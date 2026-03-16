import { useTranslations } from "next-intl";
import { Plane } from "lucide-react";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="bg-[oklch(0.10_0.03_252)] border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-white font-semibold text-lg mb-3">
              <Plane className="h-5 w-5 text-[oklch(0.62_0.20_252)]" />
              Trip Assistant
            </div>
            <p className="text-sm text-white/40 max-w-sm leading-relaxed">
              {t("description")}
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-white/70 mb-3">{t("product")}</h4>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="text-sm text-white/40 hover:text-white/70 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-sm text-white/40 hover:text-white/70 transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#demo" className="text-sm text-white/40 hover:text-white/70 transition-colors">
                  Demo
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/TripAssistant123Bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/40 hover:text-white/70 transition-colors"
                >
                  {t("bot")}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white/70 mb-3">{t("legal")}</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-white/30 cursor-default">{t("privacy")}</span>
              </li>
              <li>
                <span className="text-sm text-white/30 cursor-default">{t("terms")}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} Trip Assistant. {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
