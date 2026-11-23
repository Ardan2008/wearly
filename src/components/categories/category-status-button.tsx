
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { toggleCategoryStatusAction } from "./category-actions";

type CategoryStatusButtonProps = {
  categoryId: string;
  isActive: boolean;
};

export function CategoryStatusButton({
  categoryId,
  isActive,
}: CategoryStatusButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [active, setActive] = useState(isActive);

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleCategoryStatusAction(categoryId);

      if (!result.success) {
        toast.error(result.error ?? "Gagal mengubah status kategori.");
        return;
      }

      setActive(result.isActive ?? !active);

      toast.success(
        result.isActive
          ? "Kategori berhasil diaktifkan."
          : "Kategori berhasil dinonaktifkan."
      );

      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
        active
          ? "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100"
          : "bg-neutral-900 text-white hover:bg-neutral-700"
      }`}
    >
      {isPending
        ? "Memproses..."
        : active
          ? "Nonaktifkan"
          : "Aktifkan"}
    </button>
  );
}
