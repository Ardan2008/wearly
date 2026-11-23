
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { EditAdminForm } from "./edit-admin-form";

type EditAdminPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditAdminPage({
  params,
}: EditAdminPageProps) {
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
    },
  });

  if (!admin) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href={`/owner/admins/${id}`}
          className="text-sm text-neutral-500 hover:text-black"
        >
          ← Kembali ke Detail Admin
        </Link>

        <h1 className="mt-4 text-2xl font-semibold">
          Edit Admin
        </h1>

        <p className="mt-1 text-sm text-neutral-500">
          Perbarui informasi akun Admin WEARLY.
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <EditAdminForm
          admin={{
            ...admin,
            id: admin.id.toString(),
          }}
        />
      </div>
    </div>
  );
}
