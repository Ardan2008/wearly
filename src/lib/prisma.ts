import { PrismaClient } from "@/../generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// Konfigurasi koneksi MariaDB
const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST!,
  port: Number(process.env.DATABASE_PORT),
  user: process.env.DATABASE_USER!,
  password: process.env.DATABASE_PASSWORD!,
  database: process.env.DATABASE_NAME!,
  connectionLimit: 5,
});

// Menggunakan satu instance Prisma Client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

// Mencegah pembuatan instance berulang saat development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
