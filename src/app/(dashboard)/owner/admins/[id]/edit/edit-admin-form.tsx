"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  updateAdminAction,
  type UpdateAdminState,
} from "../../actions";

type EditAdminFormProps = {
  admin: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
};

const initialState: UpdateAdminState = {
  success: false,
  message: "",
};

export function EditAdminForm({ admin }: EditAdminFormProps) {
  const [state, formAction, pending] = useActionState(
    updateAdminAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="id" value={admin.id} />

      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium">
          Nama Lengkap
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={admin.name}
          required
          className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-black"
        />
        {state.fieldErrors?.name?.map((error) => (
          <p key={error} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        ))}
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={admin.email}
          required
          className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-black"
        />
        {state.fieldErrors?.email?.map((error) => (
          <p key={error} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        ))}
      </div>

      <div>
        <label htmlFor="phone" className="mb-2 block text-sm font-medium">
          Nomor Telepon
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={admin.phone ?? ""}
          className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-black"
        />
        {state.fieldErrors?.phone?.map((error) => (
          <p key={error} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        ))}
      </div>

      {state.message && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Menyimpan..." : "Simpan Perubahan"}
        </button>

        <Link
          href={`/owner/admins/${admin.id}`}
          className="rounded-lg border border-neutral-300 px-5 py-3 text-sm font-medium hover:bg-neutral-100"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}
