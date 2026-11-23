import Link from "next/link";
import { Plus, Users } from "lucide-react";

import { prisma } from "@/lib/prisma";

export default async function AdminManagementPage() {
  const admins = await prisma.user.findMany({
    where: {
      role: {
        name: "ADMIN",
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Manajemen Admin
          </h1>

          <p className="mt-1 text-sm text-neutral-500">
            Kelola akun Admin yang memiliki akses ke dashboard WEARLY.
          </p>
        </div>

        <Link
          href="/owner/admins/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
        >
          <Plus size={17} />
          Tambah Admin
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-500">Total Admin</p>
            <Users size={18} className="text-neutral-400" />
          </div>

          <p className="mt-3 text-3xl font-semibold">
            {admins.length}
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">Admin Aktif</p>

          <p className="mt-3 text-3xl font-semibold">
            {admins.filter((admin) => admin.status === "ACTIVE").length}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 px-5 py-4">
          <h2 className="font-semibold">Daftar Admin</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Seluruh akun dengan role Admin.
          </p>
        </div>

        {admins.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <div className="mb-4 rounded-full bg-neutral-100 p-4">
              <Users size={24} className="text-neutral-500" />
            </div>

            <h3 className="font-medium">Belum ada Admin</h3>

            <p className="mt-1 max-w-sm text-sm text-neutral-500">
              Tambahkan akun Admin pertama untuk mulai mengelola operasional WEARLY.
            </p>

            <Link
              href="/owner/admins/new"
              className="mt-5 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Tambah Admin
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Admin</th>
                  <th className="px-5 py-3 font-medium">Nomor Telepon</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Tanggal Dibuat</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100">
                {admins.map((admin) => (
                  <tr key={admin.id.toString()} className="hover:bg-neutral-50">
                    <td className="px-5 py-4">
                      <Link
                        href={`/owner/admins/${admin.id}`}
                        className="font-medium text-neutral-900 hover:underline"
                      >
                        {admin.name}
                      </Link>
                      <p className="mt-1 text-neutral-500">
                        {admin.email}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-neutral-600">
                      {admin.phone || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          admin.status === "ACTIVE"
                            ? "bg-green-50 text-green-700"
                            : admin.status === "INACTIVE"
                              ? "bg-neutral-100 text-neutral-600"
                              : "bg-red-50 text-red-700"
                        }`}
                      >
                        {admin.status === "ACTIVE"
                          ? "Aktif"
                          : admin.status === "INACTIVE"
                            ? "Nonaktif"
                            : "Ditangguhkan"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-neutral-600">
                      {admin.createdAt.toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}