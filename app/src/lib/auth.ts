import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { managers } from "@/lib/db/schema";
import { authConfig } from "./auth.config";

/**
 * Full NextAuth config with Credentials provider.
 * Used in API route handler + server-side auth() calls.
 * NOT used in middleware (see auth.config.ts for that).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;

        if (!email || !password) return null;

        const manager = await db.query.managers.findFirst({
          where: eq(managers.email, email),
        });
        if (!manager) return null;

        // Verify password (SHA-256 — matches seed script)
        const hash = createHash("sha256").update(password).digest("hex");
        if (hash !== manager.passwordHash) return null;

        return {
          id: manager.id,
          name: manager.name,
          email: manager.email,
          agencyId: manager.agencyId,
        };
      },
    }),
  ],
});
