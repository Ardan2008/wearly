import { prisma } from "@/lib/prisma";
import { ProductCreateForm } from "./product-create-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type ProductCreatePageProps = {
  basePath: string;
};

export async function ProductCreatePage({
  basePath,
}: ProductCreatePageProps) {
  const [categories, audiences, sizes, colors] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    }),

    prisma.audience.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    }),

    prisma.size.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        sortOrder: true,
      },
      orderBy: { sortOrder: "asc" },
    }),

    prisma.color.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        hexCode: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link
          href={basePath}
          className="mb-7 inline-flex items-center gap-2 text-sm text-neutral-600 transition hover:text-neutral-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Kembali ke daftar Produk
        </Link>

        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Tambah Produk
        </h1>

        <p className="mt-1 text-sm text-neutral-500">
          Tambahkan produk baru ke katalog WEARLY.
        </p>
      </div>

      <ProductCreateForm
        basePath={basePath}
        categories={categories.map((item) => ({
          id: item.id.toString(),
          name: item.name,
        }))}
        audiences={audiences.map((item) => ({
          id: item.id.toString(),
          name: item.name,
        }))}
        sizes={sizes.map((item) => ({
          id: item.id.toString(),
          name: item.name,
        }))}
        colors={colors.map((item) => ({
          id: item.id.toString(),
          name: item.name,
          hexCode: item.hexCode,
        }))}
      />
    </div>
  );
}
