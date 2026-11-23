"use client";

import { useActionState } from "react";
import Link from "next/link";

import {
  createAdminAction,
  type CreateAdminState,
} from "./actions";

const initialState: CreateAdminState = {
  success: false,
  message: "",
};

export default function CreateAdminForm() {
  const [state, formAction, isPending] = useActionState(
    createAdminAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
      {state.message && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            state.success
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Nama lengkap
        </label>

        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={100}
          placeholder="Masukkan nama Admin"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-black"
        />

        {state.fieldErrors?.name?.[0] && (
          <p className="text-sm text-red-600">
            {state.fieldErrors.name[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>

        <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={150}
          placeholder="admin@wearly.com"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-black"
        />

        {state.fieldErrors?.email?.[0] && (
          <p className="text-sm text-red-600">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-medium">
          Nomor telepon
          <span className="ml-1 text-neutral-400">(Opsional)</span>
        </label>

        <input
          id="phone"
          name="phone"
          type="tel"
          maxLength={20}
          placeholder="08xxxxxxxxxx"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-black"
        />

        {state.fieldErrors?.phone?.[0] && (
          <p className="text-sm text-red-600">
            {state.fieldErrors.phone[0]}
          </p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={12}
            maxLength={72}
            placeholder="Minimal 12 karakter"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-black"
          />

          {state.fieldErrors?.password?.[0] && (
            <p className="text-sm text-red-600">
              {state.fieldErrors.password[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium"
          >
            Konfirmasi password
          </label>

          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={12}
            maxLength={72}
            placeholder="Ulangi password"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-black"
          />

          {state.fieldErrors?.confirmPassword?.[0] && (
            <p className="text-sm text-red-600">
              {state.fieldErrors.confirmPassword[0]}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:justify-end">
        <Link
          href="/owner/admins"
          className="rounded-lg border border-neutral-300 px-5 py-2.5 text-center text-sm font-medium hover:bg-neutral-100"
        >
          Batal
        </Link>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Menyimpan..." : "Simpan Admin"}
        </button>
      </div>
    </form>
  );
}