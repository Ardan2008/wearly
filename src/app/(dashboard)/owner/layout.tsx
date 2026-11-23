import type { ReactNode } from "react";

import { requireRole } from "@/lib/auth-guard";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function OwnerLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = await requireRole("OWNER");

  return (
    <DashboardShell
      role="OWNER"
      name={session.user.name ?? "Owner"}
    >
      {children}
    </DashboardShell>
  );
}
