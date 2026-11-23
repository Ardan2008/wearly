import { ReactNode } from "react";
import { signOut } from "@/auth";
import { DashboardSidebar } from "./dashboard-sidebar";
import { LogOut } from "lucide-react";

type Props = {
  role: "OWNER" | "ADMIN";
  name: string;
  children: ReactNode;
};

export function DashboardShell({ role, name, children }: Props) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <DashboardSidebar role={role} />

      <div className="pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-8">
          <div>
            <p className="text-sm font-medium text-neutral-900">
              {role === "OWNER" ? "Owner Panel" : "Admin Panel"}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-neutral-900">{name}</p>
              <p className="text-xs text-neutral-500">{role}</p>
            </div>

            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
              >
                <LogOut className="size-4" />
                Keluar
              </button>
            </form>
          </div>
        </header>

        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
