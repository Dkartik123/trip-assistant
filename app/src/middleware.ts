import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/**
 * Edge-safe middleware.
 * Uses auth.config.ts (no DB imports) to verify JWT in cookies.
 * The `authorized` callback decides access per-route.
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/admin/:path*", "/api/:path*", "/login"],
};
