
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AuthRedirectPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  switch (session.user.role) {
    case "OWNER":
      redirect("/owner/dashboard");

    case "ADMIN":
      redirect("/admin/dashboard");

    case "CUSTOMER":
      redirect("/account");

    default:
      redirect("/login");
  }
}
