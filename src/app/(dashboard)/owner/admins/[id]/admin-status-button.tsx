
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { toggleAdminStatusAction } from "../actions";

type AdminStatusButtonProps = {
  adminId: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
};

export function AdminStatusButton({
  adminId,
  status,
}: AdminStatusButtonProps) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const router = useRouter();

  const isActive = status === "ACTIVE";

  function handleToggle() {
    const action = isActive ? "menonaktifkan" : "mengaktifkan";

    const confirmed = window.confirm(
      `Apakah kamu yakin ingin ${action} akun Admin ini?`,
    );

    if (!confirmed) return;

    setMessage("");

    startTransition(async () => {
      const result = await toggleAdminStatusAction(adminId);

      setMessage(result.message);

      if (result.success) {
        router.refresh();
      }
    });
  }

  if (status === "SUSPENDED") {
    return (
      <p className="text-sm text-neutral-500">
        Akun ditangguhkan. Status tidak dapat diubah melalui tombol ini.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleToggle}
        disabled={pending}
        className={`rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
          isActive
            ? "border border-red-200 text-red-600 hover:bg-red-50"
            : "bg-black text-white hover:bg-neutral-800"
        }`}
      >
        {pending
          ? "Memproses..."
          : isActive
            ? "Nonaktifkan Admin"
            : "Aktifkan Admin"}
      </button>

      {message && (
        <p className="text-sm text-neutral-600" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
