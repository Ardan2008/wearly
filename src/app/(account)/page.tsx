export default function AccountPage() {
  return (
    <main className="mx-auto min-h-[70vh] max-w-7xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Akun Saya</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Selamat datang di WEARLY. Kelola profil dan pesananmu di sini.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["Profil Saya", "Lihat dan ubah informasi akun."],
          ["Pesanan Saya", "Lihat status dan riwayat pesanan."],
          ["Alamat", "Kelola alamat pengiriman."],
        ].map(([title, description]) => (
          <div key={title} className="rounded-lg border bg-white p-5">
            <h2 className="font-medium">{title}</h2>
            <p className="mt-2 text-sm text-neutral-500">
              {description}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
