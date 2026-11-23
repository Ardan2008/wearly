
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { deleteAdminAction } from "../actions";

type DeleteAdminButtonProps = {
  adminId: string;
  adminName: string;
};

export function DeleteAdminButton({
  adminId,
  adminName,
}: DeleteAdminButtonProps) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const router = useRouter();

  function handleDelete() {
    const confirmed = window.confirm(
      `Apakah kamu yakin ingin menghapus akun Admin "${adminName}"? Tindakan ini tidak dapat dibatalkan.`,
    );

    if (!confirmed) return;

    setMessage("");

    startTransition(async () => {
      const result = await deleteAdminAction(adminId);

      setMessage(result.message);

      if (result.success) {
        router.push("/owner/admins");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Trash2 size={16} />
        {pending ? "Menghapus..." : "Hapus Admin"}
      </button>

      {message && (
        <p className="text-sm text-red-600" role="alert">
          {message}
        </p>
      )}
    </div>
  );
}
