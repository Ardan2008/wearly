import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "nama@email.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        // 1. Validasi input login.
        const validated = loginSchema.safeParse(credentials);

        if (!validated.success) {
          return null;
        }

        const { email, password } = validated.data;

        // 2. Cari pengguna berdasarkan email.
        const user = await prisma.user.findUnique({
          where: {
            email,
          },
          include: {
            role: {
              select: {
                name: true,
              },
            },
          },
        });

        // 3. Periksa keberadaan dan status akun.
        if (!user || user.status !== "ACTIVE") {
          return null;
        }

        // 4. Verifikasi password dengan bcrypt.
        const isPasswordValid = await bcrypt.compare(
          password,
          user.passwordHash,
        );

        if (!isPasswordValid) {
          return null;
        }

        // 5. Kirim informasi pengguna ke Auth.js.
        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role.name as "OWNER" | "ADMIN" | "CUSTOMER",
        };
      },
    }),
  ],

  callbacks: {
    // Menyimpan ID dan role ke JWT.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },

    // Mengirim ID dan role ke session.
    async session({ session, token }) {
      if (session.user) {
        // Pastikan ID berupa string.
        if (typeof token.id === "string") {
          session.user.id = token.id;
        }

        // Pastikan role sesuai dengan role WEARLY.
        if (
          token.role === "OWNER" ||
          token.role === "ADMIN" ||
          token.role === "CUSTOMER"
        ) {
          session.user.role = token.role;
        }
      }

      return session;
    },
  },
});
