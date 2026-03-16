"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Menu, X, Globe, Plane } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "#features", label: t("features") },
    { href: "#pricing", label: t("pricing") },
    { href: "#demo", label: t("demo") },
    { href: "#contact", label: t("contact") },
  ];

  function switchLocale(locale: "en" | "ru" | "et") {
    router.replace(pathname, { locale });
  }

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-[oklch(0.13_0.04_252/0.85)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <a
          href="#"
          className="flex items-center gap-2 text-white font-semibold text-lg"
        >
          <Plane className="h-5 w-5 text-[oklch(0.62_0.20_252)]" />
          Trip Assistant
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language switcher */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-sm text-white/70 hover:text-white transition-colors">
              <Globe className="h-4 w-4" />
            </button>
            <div className="absolute right-0 top-full mt-2 hidden group-hover:flex flex-col bg-[oklch(0.18_0.04_252)] border border-white/10 rounded-lg py-1 min-w-[100px] shadow-xl">
              {routing.locales.map((loc) => (
                <button
                  key={loc}
                  onClick={() => switchLocale(loc)}
                  className="px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 text-left transition-colors"
                >
                  {loc === "en"
                    ? "English"
                    : loc === "ru"
                      ? "Русский"
                      : "Eesti"}
                </button>
              ))}
            </div>
          </div>

          <Link
            href="/login"
            className="rounded-lg bg-[oklch(0.50_0.22_252)] px-4 py-2 text-sm font-medium text-white hover:bg-[oklch(0.55_0.22_252)] transition-colors"
          >
            {t("signIn")}
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[oklch(0.13_0.04_252/0.95)] backdrop-blur-xl px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block text-sm text-white/70 hover:text-white transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex gap-2 pt-2">
            {routing.locales.map((loc) => (
              <button
                key={loc}
                onClick={() => {
                  switchLocale(loc);
                  setMobileOpen(false);
                }}
                className="rounded bg-white/10 px-3 py-1 text-sm text-white/80 hover:bg-white/20 transition-colors"
              >
                {loc.toUpperCase()}
              </button>
            ))}
          </div>
          <Link
            href="/login"
            className="block rounded-lg bg-[oklch(0.50_0.22_252)] px-4 py-2 text-sm font-medium text-white text-center hover:bg-[oklch(0.55_0.22_252)] transition-colors"
          >
            {t("signIn")}
          </Link>
        </div>
      )}
    </nav>
  );
}
