
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Search, ImageIcon } from "lucide-react";

type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  audiences: string[];
  image: string | null;
  status: "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED";
  minPrice: number | null;
  maxPrice: number | null;
  totalStock: number;
  variantCount: number;
  createdAt: string;
};

type ProductListProps = {
  products: Product[];
  basePath: string;
};

const statusOptions = [
  { value: "ALL", label: "Semua Status" },
  { value: "ACTIVE", label: "Aktif" },
  { value: "DRAFT", label: "Draft" },
  { value: "INACTIVE", label: "Nonaktif" },
  { value: "ARCHIVED", label: "Diarsipkan" },
];

const statusStyles: Record<Product["status"], string> = {
  ACTIVE: "bg-green-50 text-green-700",
  DRAFT: "bg-yellow-50 text-yellow-700",
  INACTIVE: "bg-neutral-100 text-neutral-600",
  ARCHIVED: "bg-red-50 text-red-600",
};

const statusLabels: Record<Product["status"], string> = {
  ACTIVE: "Aktif",
  DRAFT: "Draft",
  INACTIVE: "Nonaktif",
  ARCHIVED: "Diarsipkan",
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatPriceRange(
  minPrice: number | null,
  maxPrice: number | null
) {
  if (minPrice === null || maxPrice === null) {
    return "Belum ditentukan";
  }

  if (minPrice === maxPrice) {
    return formatPrice(minPrice);
  }

  return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
}

export function ProductList({
  products,
}: ProductListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase()) ||
        product.slug.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ||
        product.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [products, search, statusFilter]);

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <div className="flex flex-col gap-4 border-b border-neutral-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-neutral-900">
            Daftar Produk
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Menampilkan {filteredProducts.length} dari {products.length} produk.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari produk..."
              className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-900 sm:w-64"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-neutral-900"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-262.5 text-left text-sm">
          <thead className="bg-neutral-50 text-xs text-neutral-500">
            <tr>
              <th className="px-5 py-4 font-medium">Produk</th>
              <th className="px-5 py-4 font-medium">Kategori</th>
              <th className="px-5 py-4 font-medium">Target</th>
              <th className="px-5 py-4 font-medium">Harga</th>
              <th className="px-5 py-4 font-medium">Stok</th>
              <th className="px-5 py-4 font-medium">Status</th>
              <th className="px-5 py-4 text-right font-medium">Varian</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-100">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="transition hover:bg-neutral-50/70"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={400}
                            height={400}
                            className="size-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="size-5 text-neutral-400" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="font-medium text-neutral-900">
                          {product.name}
                        </p>

                        <p className="mt-1 text-xs text-neutral-400">
                          {product.slug}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-neutral-600">
                    {product.category}
                  </td>

                  <td className="px-5 py-4 text-neutral-600">
                    {product.audiences.length > 0
                      ? product.audiences.join(", ")
                      : "-"}
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap text-neutral-700">
                    {formatPriceRange(
                      product.minPrice,
                      product.maxPrice
                    )}
                  </td>

                  <td className="px-5 py-4 tabular-nums text-neutral-700">
                    {product.totalStock.toLocaleString("id-ID")}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[product.status]}`}
                    >
                      {statusLabels[product.status]}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right tabular-nums text-neutral-600">
                    {product.variantCount}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-14 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Search className="size-8 text-neutral-300" />

                    <p className="font-medium text-neutral-700">
                      Produk tidak ditemukan
                    </p>

                    <p className="text-xs text-neutral-500">
                      Coba ubah kata kunci pencarian atau filter status.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
