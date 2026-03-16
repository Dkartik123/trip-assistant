import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe NextAuth configuration.
 * NO database or Node.js-only imports — this is used by middleware (Edge Runtime).
 * Providers are added in auth.ts (server-only).
 */
export const authConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" as const },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.managerId = user.id!;
        token.agencyId = (user as { agencyId?: string }).agencyId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.managerId = token.managerId as string;
        session.user.agencyId = token.agencyId as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      // ── Public routes (no auth) ──────────────────────
      if (
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/api/webhook") ||
        pathname.startsWith("/api/health")
      ) {
        return true;
      }

      // ── Protected API routes → 401 JSON ─────────────
      if (pathname.startsWith("/api/")) {
        if (!isLoggedIn) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }
        return true;
      }

      // ── Login / Register → redirect to admin if already authenticated
      if (pathname === "/login" || pathname === "/register") {
        if (isLoggedIn) {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        return true;
      }

      // ── Admin routes → redirect to login ────────────
      if (pathname.startsWith("/admin")) {
        return isLoggedIn; // false → NextAuth redirects to pages.signIn
      }

      return true;
    },
  },
  providers: [], // Filled in auth.ts
} satisfies NextAuthConfig;
