import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export type UserRole = "OWNER" | "ADMIN" | "CUSTOMER";

const roleHome = {
  OWNER: "/owner/dashboard",
  ADMIN: "/admin/dashboard",
  CUSTOMER: "/account",
} as const;

export async function requireRole(role: UserRole) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  let userId: bigint;

  try {
    if (!/^[1-9]\d*$/.test(session.user.id)) {
      redirect("/login");
    }

    userId = BigInt(session.user.id);
  } catch {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      status: true,
      role: {
        select: { name: true },
      },
    },
  });

  if (!user || user.status !== "ACTIVE") {
    redirect("/login");
  }

  const currentRole = user.role.name as UserRole;

  if (currentRole !== role) {
    redirect(roleHome[currentRole] ?? "/login");
  }

  return session;
}

export async function requireAnyRole(allowedRoles: UserRole[]) {
  const session = await auth();

  if (!session?.user?.id || !/^[1-9]\d*$/.test(session.user.id)) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: BigInt(session.user.id) },
    select: {
      status: true,
      role: {
        select: { name: true },
      },
    },
  });

  if (!user || user.status !== "ACTIVE") {
    redirect("/login");
  }

  const currentRole = user.role.name as UserRole;

  if (!allowedRoles.includes(currentRole)) {
    redirect(roleHome[currentRole] ?? "/login");
  }

  return {
    session,
    role: currentRole,
  };
}