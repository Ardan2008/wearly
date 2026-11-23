"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Plus, Pencil } from "lucide-react";

import { CategoryStatusButton } from "./category-status-button";
import { CategoryDeleteButton } from "./category-delete-button";

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  parentName: string | null;
  productCount: number;
  childCount: number;
};

type CategoryListProps = {
  categories: CategoryItem[];
  basePath: "/owner/categories" | "/admin/categories";
  canDelete: boolean;
};

export function CategoryList({
  categories,
  basePath,
  canDelete,
}: CategoryListProps) {
  const [search, setSearch] = useState("");

  const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return categories;

    return categories.filter((category) =>
      [
        category.name,
        category.slug,
        category.parentName ?? "",
      ].some((value) => value.toLowerCase().includes(keyword)),
    );
  }, [categories, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Kategori Produk
          </h1>

          <p className="mt-1 text-sm text-neutral-500">
            Kelola kategori dan subkategori produk WEARLY.
          </p>
        </div>

        <Link
          href={`${basePath}/new`}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          <Plus size={16} />
          Tambah Kategori
        </Link>
      </div>

      {/* Statistik */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">Total Kategori</p>

          <p className="mt-2 text-2xl font-semibold">
            {categories.length}
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">Kategori Aktif</p>

          <p className="mt-2 text-2xl font-semibold">
            {categories.filter((item) => item.isActive).length}
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">
            Total Produk Terhubung
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {categories.reduce(
              (total, item) => total + item.productCount,
              0,
            )}
          </p>
        </div>
      </div>

      {/* Tabel Kategori */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {/* Pencarian */}
        <div className="border-b border-neutral-200 p-4">
          <div className="relative max-w-sm">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama atau slug kategori..."
              className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-500"
            />
          </div>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-190 text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-500">
              <tr>
                <th className="px-5 py-3 font-medium">Kategori</th>
                <th className="px-5 py-3 font-medium">
                  Kategori Induk
                </th>
                <th className="px-5 py-3 font-medium">Produk</th>
                <th className="px-5 py-3 font-medium">Subkategori</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100">
              {filteredCategories.map((category) => (
                <tr
                  key={category.id}
                  className="hover:bg-neutral-50/70"
                >
                  <td className="px-5 py-4">
                    <div className="font-medium text-neutral-900">
                      {category.parentName ? "↳ " : ""}
                      {category.name}
                    </div>

                    <div className="mt-1 text-xs text-neutral-500">
                      /{category.slug}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-neutral-600">
                    {category.parentName ?? "Kategori utama"}
                  </td>

                  <td className="px-5 py-4 text-neutral-600">
                    {category.productCount}
                  </td>

                  <td className="px-5 py-4 text-neutral-600">
                    {category.childCount}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        category.isActive
                          ? "bg-neutral-100 text-neutral-800"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {category.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>

                  {/* Aksi */}
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      {/* Edit */}
                      <Link
                        href={`${basePath}/${category.id}/edit`}
                        title="Edit kategori"
                        aria-label={`Edit ${category.name}`}
                        className="rounded-lg border border-neutral-200 p-2 text-neutral-600 hover:bg-neutral-100"
                      >
                        <Pencil size={15} />
                      </Link>

                      {/* Aktif / Nonaktif */}
                      <CategoryStatusButton
                        categoryId={category.id}
                        isActive={category.isActive}
                      />

                      {/* Hapus khusus Owner */}
                      {canDelete && (
                        <CategoryDeleteButton
                          categoryId={category.id}
                          categoryName={category.name}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCategories.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-neutral-500"
                  >
                    {categories.length === 0
                      ? "Belum ada kategori. Tambahkan kategori pertama."
                      : "Kategori tidak ditemukan."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Informasi jumlah data */}
        <div className="border-t border-neutral-200 px-5 py-3 text-xs text-neutral-500">
          Menampilkan {filteredCategories.length} dari{" "}
          {categories.length} kategori
        </div>
      </div>
    </div>
  );
}