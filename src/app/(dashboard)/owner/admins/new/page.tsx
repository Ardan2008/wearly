import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import CreateAdminForm from "../create-admin-form";

export default function NewAdminPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/owner/admins"
          className="mb-4 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-black"
        >
          <ChevronLeft size={16} />
          Kembali ke daftar Admin
        </Link>

        <h1 className="text-2xl font-semibold tracking-tight">
          Tambah Admin
        </h1>

        <p className="mt-1 text-sm text-neutral-500">
          Buat akun baru untuk mengelola operasional WEARLY.
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <CreateAdminForm />
      </div>
    </div>
  );
}