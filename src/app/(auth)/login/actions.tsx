
"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

type LoginState = {
  error: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    return {
      error: "Email dan password wajib diisi.",
    };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/auth/redirect",
    });

    return { error: "" };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return {
          error: "Email atau password yang kamu masukkan salah.",
        };
      }

      return {
        error: "Terjadi kesalahan saat login. Silakan coba lagi.",
      };
    }

    throw error;
  }
}
