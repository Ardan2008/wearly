import { auth } from "@/auth";
import { NextResponse } from "next/server";

const roleHome = {
  OWNER: "/owner/dashboard",
  ADMIN: "/admin/dashboard",
  CUSTOMER: "/account",
} as const;

export const proxy = auth((request) => {
  const { pathname } = request.nextUrl;
  const session = request.auth;

  const isOwnerRoute = pathname.startsWith("/owner");
  const isAdminRoute = pathname.startsWith("/admin");
  const isCustomerRoute = pathname.startsWith("/account");
  const isLoginPage = pathname === "/login";

  // Pengguna belum login.
  if (!session?.user) {
    if (isOwnerRoute || isAdminRoute || isCustomerRoute) {
      return NextResponse.redirect(
        new URL("/login", request.url)
      );
    }

    return NextResponse.next();
  }

  const role = session.user.role;

  // Pengguna sudah login, tetapi mengakses halaman login.
  if (isLoginPage) {
    return NextResponse.redirect(
      new URL(roleHome[role], request.url)
    );
  }

  // OWNER hanya boleh mengakses area OWNER.
  if (isOwnerRoute && role !== "OWNER") {
    return NextResponse.redirect(
      new URL(roleHome[role], request.url)
    );
  }

  // ADMIN hanya boleh mengakses area ADMIN.
  if (isAdminRoute && role !== "ADMIN") {
    return NextResponse.redirect(
      new URL(roleHome[role], request.url)
    );
  }

  // CUSTOMER hanya boleh mengakses area CUSTOMER.
  if (isCustomerRoute && role !== "CUSTOMER") {
    return NextResponse.redirect(
      new URL(roleHome[role], request.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/login",
    "/owner/:path*",
    "/admin/:path*",
    "/account/:path*",
  ],
};
