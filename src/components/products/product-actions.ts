
"use server";

import { z } from "zod";
import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAnyRole } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

const productSchema = z.object({
  name: z.string().trim().min(1).max(150),
  categoryId: z.string().regex(/^[1-9]\d*$/),
  description: z.string().trim(),
  audiences: z.array(z.string().regex(/^[1-9]\d*$/)).min(1),
  images: z.array(
    z.object({
      imageUrl: z.string().url(),
      isPrimary: z.boolean(),
    })
  ).min(1).max(5),
  variants: z.array(
    z.object({
      sizeId: z.string().regex(/^[1-9]\d*$/),
      colorId: z.string().regex(/^[1-9]\d*$/),
      sku: z.string().trim().min(1).max(100),
      price: z.string().regex(/^\d+(\.\d{1,2})?$/),
      stockQuantity: z.string().regex(/^\d+$/),
    })
  ).min(1),
  status: z.enum(["DRAFT", "ACTIVE"]),
});

function createSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 150);
}

function isValidCloudinaryUrl(url: string) {
  try {
    const parsed = new URL(url);

    return (
      parsed.protocol === "https:" &&
      parsed.hostname === "res.cloudinary.com" &&
      parsed.pathname.includes("/image/upload/") &&
      parsed.pathname.includes("/wearly/products/")
    );
  } catch {
    return false;
  }
}

export async function createProductAction(input: unknown) {
  await requireAnyRole(["OWNER", "ADMIN"]);

  const parsed = productSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Data produk tidak valid. Periksa kembali formulir.",
    };
  }

  const data = parsed.data;

  if (data.images.filter((image) => image.isPrimary).length !== 1) {
    return {
      success: false,
      message: "Tentukan tepat satu gambar utama.",
    };
  }

  if (!data.images.every((image) => isValidCloudinaryUrl(image.imageUrl))) {
    return {
      success: false,
      message: "URL gambar produk tidak valid.",
    };
  }

  const normalizedSkus = data.variants.map((variant) =>
    variant.sku.trim().toUpperCase()
  );

  if (new Set(normalizedSkus).size !== normalizedSkus.length) {
    return {
      success: false,
      message: "SKU tidak boleh duplikat dalam satu produk.",
    };
  }

  const combinations = data.variants.map(
    (variant) => `${variant.sizeId}-${variant.colorId}`
  );

  if (new Set(combinations).size !== combinations.length) {
    return {
      success: false,
      message: "Kombinasi ukuran dan warna tidak boleh duplikat.",
    };
  }

  for (const variant of data.variants) {
    const stock = Number(variant.stockQuantity);
    const price = Number(variant.price);

    if (
      !Number.isSafeInteger(stock) ||
      stock < 0 ||
      stock > 2147483647 ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      return {
        success: false,
        message: "Harga atau jumlah stok tidak valid.",
      };
    }
  }

  try {
    const categoryId = BigInt(data.categoryId);
    const audienceIds = [...new Set(data.audiences)].map(BigInt);
    const sizeIds = [...new Set(data.variants.map((v) => v.sizeId))].map(BigInt);
    const colorIds = [...new Set(data.variants.map((v) => v.colorId))].map(BigInt);

    const [category, audiences, sizes, colors] = await Promise.all([
      prisma.category.findFirst({
        where: { id: categoryId, isActive: true },
        select: { id: true },
      }),
      prisma.audience.findMany({
        where: { id: { in: audienceIds } },
        select: { id: true },
      }),
      prisma.size.findMany({
        where: { id: { in: sizeIds }, isActive: true },
        select: { id: true },
      }),
      prisma.color.findMany({
        where: { id: { in: colorIds }, isActive: true },
        select: { id: true },
      }),
    ]);

    if (
      !category ||
      audiences.length !== audienceIds.length ||
      sizes.length !== sizeIds.length ||
      colors.length !== colorIds.length
    ) {
      return {
        success: false,
        message: "Kategori, audiens, ukuran, atau warna tidak valid.",
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      const baseSlug = createSlug(data.name);

      if (!baseSlug) {
        throw new Error("Nama produk tidak dapat dijadikan slug.");
      }

      let slug = baseSlug;
      let suffix = 1;

      while (await tx.product.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${suffix++}`;
      }

      const product = await tx.product.create({
        data: {
          name: data.name,
          slug,
          categoryId,
          brand: "WEARLY",
          description: data.description || null,
          status: data.status,

          audiences: {
            create: audienceIds.map((audienceId) => ({
              audienceId,
            })),
          },

          images: {
            create: data.images.map((image, index) => ({
              imageUrl: image.imageUrl,
              isPrimary: image.isPrimary,
              sortOrder: index,
            })),
          },
        },
      });

      for (const variant of data.variants) {
        const stock = Number(variant.stockQuantity);

        const createdVariant = await tx.productVariant.create({
          data: {
            productId: product.id,
            sizeId: BigInt(variant.sizeId),
            colorId: BigInt(variant.colorId),
            sku: variant.sku.trim(),
            price: new Prisma.Decimal(variant.price),
            stockQuantity: stock,
          },
        });

        if (stock > 0) {
          await tx.inventoryMovement.create({
            data: {
              variantId: createdVariant.id,
              movementType: "IN",
              quantity: stock,
              stockBefore: 0,
              stockAfter: stock,
              referenceType: "PRODUCT_CREATION",
              referenceId: product.id,
              notes: "Stok awal saat produk dibuat.",
            },
          });
        }
      }

      return product;
    });

    revalidatePath("/owner/products");
    revalidatePath("/admin/products");

    return {
      success: true,
      message: `Produk "${result.name}" berhasil dibuat.`,
    };
  } catch (error) {
    console.error("Create product error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message: "SKU atau data unik lainnya sudah digunakan.",
      };
    }

    return {
      success: false,
      message: "Gagal menyimpan produk. Silakan coba kembali.",
    };
  }
}


const referenceSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("category"),
    name: z.string().trim().min(1).max(100),
  }),
  z.object({
    type: z.literal("audience"),
    name: z.string().trim().min(1).max(50),
  }),
  z.object({
    type: z.literal("size"),
    name: z.string().trim().min(1).max(30),
  }),
  z.object({
    type: z.literal("color"),
    name: z.string().trim().min(1).max(50),
    hexCode: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, "Kode warna harus berformat HEX, misalnya #000000.")
      .optional()
      .or(z.literal("")),
  }),
]);

export async function createProductReferenceAction(input: unknown) {
  await requireAnyRole(["OWNER", "ADMIN"]);

  const parsed = referenceSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Data yang dimasukkan tidak valid.",
    };
  }

  try {
    const data = parsed.data;
    let created: { id: bigint; name: string };

    switch (data.type) {
      case "category": {
        const baseSlug = createSlug(data.name);

        if (!baseSlug) {
          return {
            success: false,
            message: "Nama kategori tidak dapat dijadikan slug.",
          };
        }

        let slug = baseSlug;
        let suffix = 1;

        while (await prisma.category.findUnique({ where: { slug } })) {
          slug = `${baseSlug}-${suffix++}`;
        }

        created = await prisma.category.create({
          data: {
            name: data.name,
            slug,
            isActive: true,
          },
          select: {
            id: true,
            name: true,
          },
        });

        break;
      }

      case "audience": {
        created = await prisma.audience.create({
          data: {
            name: data.name,
          },
          select: {
            id: true,
            name: true,
          },
        });

        break;
      }

      case "size": {
        const lastSize = await prisma.size.findFirst({
          orderBy: { sortOrder: "desc" },
          select: { sortOrder: true },
        });

        created = await prisma.size.create({
          data: {
            name: data.name,
            sortOrder: (lastSize?.sortOrder ?? 0) + 1,
            isActive: true,
          },
          select: {
            id: true,
            name: true,
          },
        });

        break;
      }

      case "color": {
        created = await prisma.color.create({
          data: {
            name: data.name,
            hexCode: data.hexCode || null,
            isActive: true,
          },
          select: {
            id: true,
            name: true,
          },
        });

        break;
      }
    }

    revalidatePath("/owner/products/new");
    revalidatePath("/admin/products/new");

    return {
      success: true,
      message: `${data.type} berhasil ditambahkan.`,
      item: {
        id: created.id.toString(),
        name: created.name,
        ...(data.type === "color"
          ? { hexCode: data.hexCode || null }
          : {}),
      },
    };
  } catch (error) {
    console.error("Create product reference error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message: "Nama data tersebut sudah digunakan.",
      };
    }

    return {
      success: false,
      message: "Gagal menambahkan data. Silakan coba kembali.",
    };
  }
}
