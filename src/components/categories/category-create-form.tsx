
"use client";

import { useActionState } from "react";
import {
  createCategoryAction,
  type CategoryFormState,
} from "./category-actions";

const initialState: CategoryFormState = {};

export function CategoryCreateForm() {
  const [state, formAction, isPending] = useActionState(
    createCategoryAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="name"
          className="text-sm font-medium text-neutral-900"
        >
          Nama Kategori
          <span className="ml-1 text-red-500">*</span>
        </label>

        <input
          id="name"
          name="name"
          type="text"
          placeholder="Contoh: T-Shirts"
          maxLength={100}
          required
          autoComplete="off"
          className="h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
        />
      </div>

      <div className="flex justify-end border-t border-neutral-100 pt-5">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-neutral-900 px-5 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Menyimpan..." : "Simpan Kategori"}
        </button>
      </div>
    </form>
  );
}
