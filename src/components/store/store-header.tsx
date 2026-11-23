
import Link from "next/link";
import { signOut } from "@/auth";

export function StoreHeader({
  name,
}: {
  name: string;
}) {
  return (
    <header className="sticky top-0 z-40 border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-xl font-bold tracking-[0.2em]"
        >
          WEARLY
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-neutral-600 md:flex">
          <Link href="/" className="hover:text-black">Beranda</Link>
          <Link href="/products" className="hover:text-black">Produk</Link>
          <Link href="/account" className="hover:text-black">Akun Saya</Link>
        </nav>

        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-neutral-600 sm:block">
            {name}
          </span>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="text-sm font-medium text-neutral-700 hover:text-black"
            >
              Keluar
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
