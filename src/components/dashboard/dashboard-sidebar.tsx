"use client";

import type { ElementType } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Package,
  Tags,
  ShoppingBag,
  CreditCard,
  Truck,
  Ticket,
  Star,
  ChartNoAxesCombined,
  Settings,
  Store,
  Boxes,
} from "lucide-react";

type DashboardRole = "OWNER" | "ADMIN";

type MenuItem = {
  label: string;
  href: string;
  icon: ElementType;
};

const ownerMenus: MenuItem[] = [
  { label: "Dashboard", href: "/owner/dashboard", icon: LayoutDashboard },
  { label: "Admin", href: "/owner/admins", icon: Users },
  { label: "Produk", href: "/owner/products", icon: Package },
  { label: "Kategori", href: "/owner/categories", icon: Tags },
  { label: "Pesanan", href: "/owner/orders", icon: ShoppingBag },
  { label: "Pembayaran", href: "/owner/payments", icon: CreditCard },
  { label: "Pelanggan", href: "/owner/customers", icon: Users },
  { label: "Stok", href: "/owner/inventory", icon: Boxes },
  { label: "Pengiriman", href: "/owner/shipments", icon: Truck },
  { label: "Voucher & Promosi", href: "/owner/promotions", icon: Ticket },
  { label: "Ulasan", href: "/owner/reviews", icon: Star },
  { label: "Laporan", href: "/owner/reports", icon: ChartNoAxesCombined },
  { label: "Pengaturan", href: "/owner/settings", icon: Settings },
];

const adminMenus: MenuItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Produk", href: "/admin/products", icon: Package },
  { label: "Kategori", href: "/admin/categories", icon: Tags },
  { label: "Pesanan", href: "/admin/orders", icon: ShoppingBag },
  { label: "Pembayaran", href: "/admin/payments", icon: CreditCard },
  { label: "Pelanggan", href: "/admin/customers", icon: Users },
  { label: "Stok", href: "/admin/inventory", icon: Boxes },
  { label: "Pengiriman", href: "/admin/shipments", icon: Truck },
  { label: "Voucher & Promosi", href: "/admin/promotions", icon: Ticket },
  { label: "Ulasan", href: "/admin/reviews", icon: Star },
];

export function DashboardSidebar({ role }: { role: DashboardRole }) {
  const pathname = usePathname();
  const menus = role === "OWNER" ? ownerMenus : adminMenus;
  const basePath = role === "OWNER" ? "/owner" : "/admin";

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Store className="size-5" />
        <span className="text-lg font-bold tracking-widest">WEARLY</span>
        <span className="ml-auto rounded border px-2 py-1 text-[10px] font-medium">
          {role}
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <p className="px-3 pb-2 pt-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Menu Utama
        </p>

        {menus.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== `${basePath}/dashboard` &&
              pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-neutral-900 font-medium text-white"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
              }`}
            >
              <item.icon className="size-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <p className="text-xs text-neutral-400">WEARLY Management</p>
        <p className="mt-1 text-xs text-neutral-500">Dashboard {role}</p>
      </div>
    </aside>
  );
}
