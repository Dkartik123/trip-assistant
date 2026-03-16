import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import createIntlMiddleware from "next-intl/middleware";
import { authConfig } from "@/lib/auth.config";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);
const { auth } = NextAuth(authConfig);

/**
 * Combined middleware:
 * - /admin, /api, /login, /register → NextAuth (JWT auth check)
 * - /en, /ru, /et, / → next-intl (locale routing for landing page)
 * - Static assets (_next, favicon, etc.) → skip
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Auth-protected routes — already handled by NextAuth `auth()` wrapper
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname === "/login" ||
    pathname === "/register"
  ) {
    // NextAuth's authorized callback in authConfig handles access control
    return NextResponse.next();
  }

  // Public landing pages — delegate to next-intl middleware
  return intlMiddleware(req);
});

export const config = {
  matcher: [
    // Auth routes
    "/admin/:path*",
    "/api/:path*",
    "/login",
    "/register",
    // i18n routes: match everything except _next, static files, favicon
    "/((?!_next|.*\\..*).*)",
  ],
};
