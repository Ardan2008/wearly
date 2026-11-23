
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductList } from "./product-list";
import { Plus } from "lucide-react";

type ProductManagementPageProps = {
  basePath: string;
};

export async function ProductManagementPage({
  basePath,
}: ProductManagementPageProps) {
  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      category: {
        select: {
          name: true,
        },
      },
      audiences: {
        include: {
          audience: {
            select: {
              name: true,
            },
          },
        },
      },
      images: {
        orderBy: [
          { isPrimary: "desc" },
          { sortOrder: "asc" },
        ],
        take: 1,
        select: {
          imageUrl: true,
        },
      },
      variants: {
        select: {
          price: true,
          stockQuantity: true,
        },
      },
    },
  });

  const formattedProducts = products.map((product) => {
    const prices = product.variants.map((variant) =>
      Number(variant.price)
    );

    const totalStock = product.variants.reduce(
      (total, variant) => total + variant.stockQuantity,
      0
    );

    return {
      id: product.id.toString(),
      name: product.name,
      slug: product.slug,
      category: product.category.name,
      audiences: product.audiences.map(
        (item) => item.audience.name
      ),
      image: product.images[0]?.imageUrl ?? null,
      status: product.status,
      minPrice: prices.length ? Math.min(...prices) : null,
      maxPrice: prices.length ? Math.max(...prices) : null,
      totalStock,
      variantCount: product.variants.length,
      createdAt: product.createdAt.toISOString(),
    };
  });

  const totalProducts = formattedProducts.length;

  const activeProducts = formattedProducts.filter(
    (product) => product.status === "ACTIVE"
  ).length;

  const draftProducts = formattedProducts.filter(
    (product) => product.status === "DRAFT"
  ).length;

  const inactiveProducts = formattedProducts.filter(
    (product) => product.status === "INACTIVE"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Manajemen Produk
          </h1>

          <p className="mt-1 text-sm text-neutral-500">
            Kelola seluruh produk yang tersedia di WEARLY.
          </p>
        </div>

        <Link
          href={`${basePath}/new`}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          <Plus size={16} />
          Tambah Produk
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Produk"
          value={totalProducts}
        />

        <StatCard
          label="Produk Aktif"
          value={activeProducts}
        />

        <StatCard
          label="Produk Draft"
          value={draftProducts}
        />

        <StatCard
          label="Produk Nonaktif"
          value={inactiveProducts}
        />
      </div>

      <ProductList
        products={formattedProducts}
        basePath={basePath}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <p className="text-sm text-neutral-500">{label}</p>

      <p className="mt-2 text-2xl font-semibold text-neutral-900">
        {value.toLocaleString("id-ID")}
      </p>
    </div>
  );
}
