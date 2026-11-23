
export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Dashboard Admin
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Ringkasan aktivitas operasional WEARLY.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {["Pesanan Baru", "Menunggu Pembayaran", "Perlu Diproses", "Stok Menipis"].map(
          (title) => (
            <div key={title} className="rounded-lg border bg-white p-5">
              <p className="text-sm text-neutral-500">{title}</p>
              <p className="mt-3 text-2xl font-semibold">—</p>
              <p className="mt-1 text-xs text-neutral-400">
                Data akan ditampilkan setelah modul terintegrasi.
              </p>
            </div>
          )
        )}
      </div>

      <section className="rounded-lg border bg-white p-6">
        <h2 className="font-semibold">Pesanan Terbaru</h2>
        <p className="mt-2 text-sm text-neutral-500">
          Daftar pesanan terbaru akan ditampilkan di sini.
        </p>
      </section>
    </div>
  );
}
