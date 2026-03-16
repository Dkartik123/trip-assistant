import { useTranslations } from "next-intl";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[oklch(0.13_0.04_252)]">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-[oklch(0.30_0.15_252/0.3)] blur-[120px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full bg-[oklch(0.25_0.12_280/0.2)] blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[oklch(0.20_0.08_252/0.15)] blur-[150px]" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.50_0.22_252/0.3)] bg-[oklch(0.50_0.22_252/0.1)] px-4 py-1.5 mb-8">
          <Sparkles className="h-4 w-4 text-[oklch(0.62_0.20_252)]" />
          <span className="text-sm font-medium text-[oklch(0.75_0.10_252)]">
            {t("badge")}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-6">
          {t("title")}
          <br />
          <span className="bg-gradient-to-r from-[oklch(0.62_0.20_252)] to-[oklch(0.70_0.18_280)] bg-clip-text text-transparent">
            {t("titleHighlight")}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto max-w-2xl text-lg sm:text-xl text-white/60 leading-relaxed mb-10">
          {t("subtitle")}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#contact"
            className="group inline-flex items-center gap-2 rounded-xl bg-[oklch(0.50_0.22_252)] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-[oklch(0.50_0.22_252/0.25)] hover:bg-[oklch(0.55_0.22_252)] transition-all hover:shadow-[oklch(0.50_0.22_252/0.4)]"
          >
            {t("cta")}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
          <a
            href="#demo"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-all"
          >
            {t("ctaSecondary")}
          </a>
        </div>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto">
          {[
            { value: "24/7", label: "AI Support" },
            { value: "80%", label: "Auto-answered" },
            { value: "<3s", label: "Response time" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-white/40 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[oklch(0.98_0_0)] to-transparent" />
    </section>
  );
}
