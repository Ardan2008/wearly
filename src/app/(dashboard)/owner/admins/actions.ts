"use server";

import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";

const createAdminSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Nama minimal 3 karakter.")
    .max(100, "Nama maksimal 100 karakter."),

  email: z
    .string()
    .trim()
    .email("Format email tidak valid.")
    .max(150, "Email maksimal 150 karakter.")
    .transform((value) => value.toLowerCase()),

  phone: z
    .string()
    .trim()
    .max(20, "Nomor telepon maksimal 20 karakter.")
    .optional(),

  password: z
    .string()
    .min(12, "Password minimal 12 karakter.")
    .max(72, "Password maksimal 72 karakter."),

  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Konfirmasi password tidak cocok.",
  path: ["confirmPassword"],
});

export type CreateAdminState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function createAdminAction(
  _prevState: CreateAdminState,
  formData: FormData,
): Promise<CreateAdminState> {
  await requireRole("OWNER");

  const validated = createAdminSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validated.success) {
    return {
      success: false,
      message: "Periksa kembali data yang kamu masukkan.",
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  const { name, email, phone, password } = validated.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    return {
      success: false,
      message: "Email sudah digunakan oleh akun lain.",
      fieldErrors: {
        email: ["Gunakan alamat email yang berbeda."],
      },
    };
  }

  const adminRole = await prisma.role.findUnique({
    where: { name: "ADMIN" },
    select: { id: true },
  });

  if (!adminRole) {
    return {
      success: false,
      message: "Role ADMIN tidak ditemukan. Periksa data role di database.",
    };
  }

  const passwordHash = await hash(password, 12);

  try {
    await prisma.user.create({
      data: {
        roleId: adminRole.id,
        name,
        email,
        phone: phone || null,
        passwordHash,
        status: "ACTIVE",
      },
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message: "Email sudah digunakan oleh akun lain.",
      };
    }

    throw error;
  }

  revalidatePath("/owner/admins");
  redirect("/owner/admins");
}


const updateAdminSchema = z.object({
  id: z.string().regex(/^[1-9]\d*$/, "ID Admin tidak valid."),
  name: z
    .string()
    .trim()
    .min(3, "Nama minimal 3 karakter.")
    .max(100, "Nama maksimal 100 karakter."),
  email: z
    .string()
    .trim()
    .email("Format email tidak valid.")
    .max(150, "Email maksimal 150 karakter.")
    .transform((value) => value.toLowerCase()),
  phone: z
    .string()
    .trim()
    .max(20, "Nomor telepon maksimal 20 karakter.")
    .optional(),
});

export type UpdateAdminState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function updateAdminAction(
  _prevState: UpdateAdminState,
  formData: FormData,
): Promise<UpdateAdminState> {
  await requireRole("OWNER");

  const validated = updateAdminSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
  });

  if (!validated.success) {
    return {
      success: false,
      message: "Periksa kembali data yang kamu masukkan.",
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  const { id, name, email, phone } = validated.data;

  const adminId = BigInt(id);

  const admin = await prisma.user.findFirst({
    where: {
      id: adminId,
      role: { name: "ADMIN" },
    },
    select: { id: true },
  });

  if (!admin) {
    return {
      success: false,
      message: "Data Admin tidak ditemukan.",
    };
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      email,
      NOT: { id: adminId },
    },
    select: { id: true },
  });

  if (existingUser) {
    return {
      success: false,
      message: "Email sudah digunakan oleh akun lain.",
      fieldErrors: {
        email: ["Gunakan alamat email yang berbeda."],
      },
    };
  }

  try {
    await prisma.user.update({
      where: { id: adminId },
      data: {
        name,
        email,
        phone: phone || null,
      },
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message: "Email sudah digunakan oleh akun lain.",
        fieldErrors: {
          email: ["Gunakan alamat email yang berbeda."],
        },
      };
    }

    throw error;
  }

  revalidatePath("/owner/admins");
  revalidatePath(`/owner/admins/${id}`);

  redirect(`/owner/admins/${id}`);
}


export async function toggleAdminStatusAction(
  adminId: string,
): Promise<{ success: boolean; message: string }> {
  await requireRole("OWNER");

  if (!/^[1-9]\d*$/.test(adminId)) {
    return {
      success: false,
      message: "ID Admin tidak valid.",
    };
  }

  const id = BigInt(adminId);

  const admin = await prisma.user.findFirst({
    where: {
      id,
      role: { name: "ADMIN" },
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!admin) {
    return {
      success: false,
      message: "Data Admin tidak ditemukan.",
    };
  }

  if (admin.status === "SUSPENDED") {
    return {
      success: false,
      message: "Admin yang ditangguhkan tidak dapat diaktifkan melalui fitur ini.",
    };
  }

  const nextStatus =
    admin.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

  await prisma.user.update({
    where: { id },
    data: { status: nextStatus },
  });

  revalidatePath("/owner/admins");
  revalidatePath(`/owner/admins/${adminId}`);

  return {
    success: true,
    message:
      nextStatus === "ACTIVE"
        ? "Akun Admin berhasil diaktifkan."
        : "Akun Admin berhasil dinonaktifkan.",
  };
}

export async function deleteAdminAction(
  adminId: string,
): Promise<{ success: boolean; message: string }> {
  await requireRole("OWNER");

  if (!/^[1-9]\d*$/.test(adminId)) {
    return {
      success: false,
      message: "ID Admin tidak valid.",
    };
  }

  const id = BigInt(adminId);

  const admin = await prisma.user.findFirst({
    where: {
      id,
      role: { name: "ADMIN" },
    },
    select: {
      id: true,
      name: true,
      customerProfile: true,
      _count: {
        select: {
          addresses: true,
          orders: true,
          voucherUsages: true,
          paymentsVerified: true,
          inventoryMovements: true,
          reviews: true,
          notifications: true,
        },
      },
      cart: {
        select: { id: true },
      },
      wishlist: {
        select: { id: true },
      },
    },
  });

  if (!admin) {
    return {
      success: false,
      message: "Data Admin tidak ditemukan.",
    };
  }

  const hasRelatedData =
    admin.customerProfile !== null ||
    admin.cart !== null ||
    admin.wishlist !== null ||
    Object.values(admin._count).some((count) => count > 0);

  if (hasRelatedData) {
    return {
      success: false,
      message:
        "Admin tidak dapat dihapus permanen karena masih memiliki data atau riwayat aktivitas. Nonaktifkan akun Admin sebagai gantinya.",
    };
  }

  try {
    await prisma.user.delete({
      where: { id },
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error.code === "P2003" || error.code === "P2014")
    ) {
      return {
        success: false,
        message:
          "Admin tidak dapat dihapus karena masih terhubung dengan data lain.",
      };
    }

    throw error;
  }

  revalidatePath("/owner/admins");

  return {
    success: true,
    message: `Admin ${admin.name} berhasil dihapus.`,
  };
}