
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";

import { AdminStatusButton } from "./admin-status-button";
import { DeleteAdminButton } from "./delete-admin-button";

type AdminDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminDetailPage({
  params,
}: AdminDetailPageProps) {
  await requireRole("OWNER");

  const { id } = await params;

  if (!/^[1-9]\d*$/.test(id)) {
    notFound();
  }

  const admin = await prisma.user.findFirst({
    where: {
      id: BigInt(id),
      role: { name: "ADMIN" },
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!admin) {
    notFound();
  }

  const dateFormatter = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/owner/admins"
          className="text-sm text-neutral-500 hover:text-black"
        >
          ← Kembali ke Daftar Admin
        </Link>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Detail Admin</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Informasi lengkap akun Admin WEARLY.
            </p>
          </div>

          <Link
            href={`/owner/admins/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
          >
            <Pencil size={16} />
            Edit Admin
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 p-6">
          <h2 className="font-semibold">{admin.name}</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Administrator WEARLY
          </p>
        </div>

        <div className="divide-y divide-neutral-100">
          <DetailRow label="ID Admin" value={admin.id.toString()} />
          <DetailRow label="Nama Lengkap" value={admin.name} />
          <DetailRow label="Email" value={admin.email} />
          <DetailRow label="Nomor Telepon" value={admin.phone || "Belum diisi"} />
          <DetailRow
            label="Status Akun"
            value={admin.status === "ACTIVE" ? "Aktif" : admin.status === "INACTIVE" ? "Tidak Aktif" : "Ditangguhkan"}
          />
          <DetailRow
            label="Tanggal Dibuat"
            value={dateFormatter.format(admin.createdAt)}
          />
          <DetailRow
            label="Terakhir Diperbarui"
            value={dateFormatter.format(admin.updatedAt)}
          />
        </div>
      </div>

      {/* Pengelolaan Akun */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="font-semibold">Pengelolaan Akun</h2>

        <p className="mt-1 text-sm text-neutral-500">
          Atur akses Admin ke dashboard WEARLY.
        </p>

        <div className="mt-4">
          <AdminStatusButton
            adminId={admin.id.toString()}
            status={admin.status}
          />
        </div>
      </div>

      {/* Hapus */}
      <div className="rounded-xl border border-red-200 bg-white p-6">
        <h2 className="font-semibold text-red-600">
          Zona Berbahaya
        </h2>

        <p className="mt-1 text-sm text-neutral-500">
          Hapus akun Admin secara permanen jika akun belum memiliki
          data atau riwayat aktivitas.
        </p>

        <div className="mt-4">
          <DeleteAdminButton
            adminId={admin.id.toString()}
            adminName={admin.name}
          />
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="grid gap-1 px-6 py-4 sm:grid-cols-[180px_1fr] sm:gap-4">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="break-words text-sm font-medium text-neutral-900">
        {value}
      </p>
    </div>
  );
}
