
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const requiredEnv = [
  "DATABASE_HOST",
  "DATABASE_PORT",
  "DATABASE_USER",
  "DATABASE_NAME",
  "OWNER_NAME",
  "OWNER_EMAIL",
  "OWNER_PASSWORD",
] as const;

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Environment variable ${key} belum diatur.`);
  }
}

const ownerName = process.env.OWNER_NAME!;
const ownerEmail = process.env.OWNER_EMAIL!.trim().toLowerCase();
const ownerPassword = process.env.OWNER_PASSWORD!;

if (ownerPassword.length < 12) {
  throw new Error("Password Owner minimal 12 karakter.");
}

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST!,
  port: Number(process.env.DATABASE_PORT),
  user: process.env.DATABASE_USER!,
  password: process.env.DATABASE_PASSWORD ?? "",
  database: process.env.DATABASE_NAME!,
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Memulai seeding WEARLY...");

  // 1. Membuat role jika belum tersedia.
  const ownerRole = await prisma.role.upsert({
    where: { name: "OWNER" },
    update: {},
    create: {
      name: "OWNER",
      description: "Pemilik dan pengelola utama WEARLY.",
    },
  });

  await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: {
      name: "ADMIN",
      description: "Pengelola operasional WEARLY.",
    },
  });

  await prisma.role.upsert({
    where: { name: "CUSTOMER" },
    update: {},
    create: {
      name: "CUSTOMER",
      description: "Pelanggan WEARLY.",
    },
  });

  console.log("Role OWNER, ADMIN, dan CUSTOMER berhasil diperiksa.");

  // 2. Periksa apakah akun Owner sudah tersedia.
  const existingOwner = await prisma.user.findUnique({
    where: { email: ownerEmail },
  });

  if (existingOwner) {
    if (existingOwner.roleId !== ownerRole.id) {
      throw new Error(
        "Email Owner sudah digunakan oleh akun dengan role berbeda."
      );
    }

    console.log("Akun Owner sudah tersedia. Tidak ada perubahan password.");
    return;
  }

  // 3. Hash password sebelum disimpan.
  const passwordHash = await bcrypt.hash(ownerPassword, 12);

  // 4. Membuat akun Owner pertama.
  await prisma.user.create({
    data: {
      roleId: ownerRole.id,
      name: ownerName,
      email: ownerEmail,
      passwordHash,
      status: "ACTIVE",
    },
  });

  console.log("Akun Owner berhasil dibuat.");
  console.log(`Email Owner: ${ownerEmail}`);
}

main()
  .catch((error) => {
    console.error("Seeding gagal:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
