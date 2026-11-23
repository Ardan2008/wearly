import type { ReactNode } from "react";

import { requireRole } from "@/lib/auth-guard";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = await requireRole("ADMIN");

  return (
    <DashboardShell
      role="ADMIN"
      name={session.user.name ?? "Admin"}
    >
      {children}
    </DashboardShell>
  );
}
