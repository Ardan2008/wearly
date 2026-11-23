import type { ReactNode } from "react";

import { requireRole } from "@/lib/auth-guard";
import { StoreHeader } from "@/components/store/store-header";

export default async function AccountLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = await requireRole("CUSTOMER");

  return (
    <>
      <StoreHeader name={session.user.name ?? "Customer"} />
      {children}
    </>
  );
}
