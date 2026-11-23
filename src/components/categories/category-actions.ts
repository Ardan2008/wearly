
"use server";

import { prisma } from "@/lib/prisma";
import { requireAnyRole } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type CategoryFormState = {
  error?: string;
};

function createSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

export async function createCategoryAction(
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const { role } = await requireAnyRole(["OWNER", "ADMIN"]);

  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return { error: "Nama kategori wajib diisi." };
  }

  if (name.length > 100) {
    return { error: "Nama kategori maksimal 100 karakter." };
  }

  const baseSlug = createSlug(name);

  if (!baseSlug) {
    return { error: "Nama kategori tidak valid." };
  }

  let slug = baseSlug;
  let counter = 1;

  while (
    await prisma.category.findUnique({
      where: { slug },
      select: { id: true },
    })
  ) {
    const suffix = `-${counter}`;
    slug = `${baseSlug.slice(0, 120 - suffix.length)}${suffix}`;
    counter++;
  }

  try {
    await prisma.category.create({
      data: {
        name,
        slug,
        sortOrder: 0,
        isActive: true,
        description: null,
        parentId: null,
        image: null,
      },
    });
  } catch (error) {
    console.error("Gagal membuat kategori:", error);

    return {
      error: "Kategori gagal ditambahkan. Silakan coba kembali.",
    };
  }

  const basePath =
    role === "OWNER"
      ? "/owner/categories"
      : "/admin/categories";

  revalidatePath(basePath);
  revalidatePath("/owner/categories");
  revalidatePath("/admin/categories");

  redirect(basePath);
}


export async function updateCategoryAction(
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const { role } = await requireAnyRole(["OWNER", "ADMIN"]);

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!/^[1-9]\d*$/.test(id)) {
    return { error: "ID kategori tidak valid." };
  }

  if (!name) {
    return { error: "Nama kategori wajib diisi." };
  }

  if (name.length > 100) {
    return { error: "Nama kategori maksimal 100 karakter." };
  }

  const categoryId = BigInt(id);

  const existingCategory = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });

  if (!existingCategory) {
    return { error: "Kategori tidak ditemukan." };
  }

  const baseSlug = createSlug(name);

  if (!baseSlug) {
    return { error: "Nama kategori tidak valid." };
  }

  let slug = baseSlug;
  let counter = 1;

  while (
    await prisma.category.findFirst({
      where: {
        slug,
        id: { not: categoryId },
      },
      select: { id: true },
    })
  ) {
    const suffix = `-${counter}`;
    slug = `${baseSlug.slice(0, 120 - suffix.length)}${suffix}`;
    counter++;
  }

  try {
    await prisma.category.update({
      where: { id: categoryId },
      data: {
        name,
        slug,
      },
    });
  } catch (error) {
    console.error("Gagal mengubah kategori:", error);

    return {
      error: "Kategori gagal diperbarui. Silakan coba kembali.",
    };
  }

  const basePath =
    role === "OWNER"
      ? "/owner/categories"
      : "/admin/categories";

  revalidatePath(basePath);
  revalidatePath("/owner/categories");
  revalidatePath("/admin/categories");

  redirect(basePath);
}


export async function toggleCategoryStatusAction(
  categoryId: string
): Promise<{ success: boolean; error?: string; isActive?: boolean }> {
  await requireAnyRole(["OWNER", "ADMIN"]);

  if (!/^[1-9]\d*$/.test(categoryId)) {
    return {
      success: false,
      error: "ID kategori tidak valid.",
    };
  }

  try {
    const id = BigInt(categoryId);

    const category = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!category) {
      return {
        success: false,
        error: "Kategori tidak ditemukan.",
      };
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        isActive: !category.isActive,
      },
      select: {
        isActive: true,
      },
    });

    revalidatePath("/owner/categories");
    revalidatePath("/admin/categories");

    return {
      success: true,
      isActive: updatedCategory.isActive,
    };
  } catch (error) {
    console.error("Gagal mengubah status kategori:", error);

    return {
      success: false,
      error: "Status kategori gagal diperbarui.",
    };
  }
}


export async function deleteCategoryAction(
  categoryId: string
): Promise<{ success: boolean; error?: string }> {
  await requireAnyRole(["OWNER"]);

  if (!/^[1-9]\d*$/.test(categoryId)) {
    return {
      success: false,
      error: "ID kategori tidak valid.",
    };
  }

  try {
    const id = BigInt(categoryId);

    const category = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
      },
    });

    if (!category) {
      return {
        success: false,
        error: "Kategori tidak ditemukan.",
      };
    }

    if (category._count.products > 0) {
      return {
        success: false,
        error: "Kategori tidak dapat dihapus karena masih memiliki produk.",
      };
    }

    if (category._count.children > 0) {
      return {
        success: false,
        error: "Kategori tidak dapat dihapus karena masih memiliki subkategori.",
      };
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/owner/categories");
    revalidatePath("/admin/categories");

    return { success: true };
  } catch (error) {
    console.error("Gagal menghapus kategori:", error);

    return {
      success: false,
      error: "Kategori gagal dihapus. Pastikan kategori tidak memiliki data terkait.",
    };
  }
}
