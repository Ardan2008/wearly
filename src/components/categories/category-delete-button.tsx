"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteCategoryAction } from "./category-actions";
import { Loader2, Trash2 } from "lucide-react";

type CategoryDeleteButtonProps = {
  categoryId: string;
  categoryName: string;
};

export function CategoryDeleteButton({
  categoryId,
  categoryName,
}: CategoryDeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      `Apakah kamu yakin ingin menghapus kategori "${categoryName}"? Tindakan ini tidak dapat dibatalkan.`
    );

    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteCategoryAction(categoryId);

      if (!result.success) {
        toast.error(result.error ?? "Gagal menghapus kategori.");
        return;
      }

      toast.success("Kategori berhasil dihapus.");
      router.refresh();
    });
  }

  return (
    <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        title="Hapus kategori"
        aria-label={`Hapus kategori ${categoryName}`}
        className="inline-flex size-8 items-center justify-center rounded-md border border-red-200 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
        {isPending ? (
        <Loader2 className="size-4 animate-spin" />
        ) : (
        <Trash2 className="size-4" />
        )}
    </button>
  );
}
