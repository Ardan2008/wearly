
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CategoryEditForm } from "./category-edit-form";

type CategoryEditPageProps = {
  basePath: string;
  categoryId: string;
  categoryName: string;
};

export function CategoryEditPage({
  basePath,
  categoryId,
  categoryName,
}: CategoryEditPageProps) {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <Link
        href={basePath}
        className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition hover:text-neutral-900"
      >
        <ChevronLeft className="size-4" />
        Kembali ke daftar Kategori
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Edit Kategori
        </h1>

        <p className="mt-1 text-sm text-neutral-500">
          Perbarui nama kategori produk WEARLY.
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-neutral-900">
            Informasi Kategori
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Ubah nama kategori sesuai kebutuhan.
          </p>
        </div>

        <CategoryEditForm
          categoryId={categoryId}
          categoryName={categoryName}
        />
      </div>
    </div>
  );
}
