import { useTranslations } from "next-intl";
import { Play } from "lucide-react";

export function DemoSection() {
  const t = useTranslations("demo");

  return (
    <section id="demo" className="relative bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[oklch(0.15_0.02_252)] tracking-tight">
            {t("title")}
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-[oklch(0.45_0.02_252)]">
            {t("subtitle")}
          </p>
        </div>

        {/* Video placeholder */}
        <div className="relative aspect-video rounded-2xl overflow-hidden border border-[oklch(0.90_0.015_252)] bg-gradient-to-br from-[oklch(0.14_0.04_252)] to-[oklch(0.18_0.05_260)] shadow-2xl">
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Play button */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[oklch(0.50_0.22_252)] shadow-lg shadow-[oklch(0.50_0.22_252/0.3)] hover:bg-[oklch(0.55_0.22_252)] transition-colors cursor-pointer">
              <Play className="h-8 w-8 text-white ml-1" />
            </div>
            <span className="text-white/50 text-sm font-medium">
              {t("placeholder")}
            </span>
          </div>

          {/* Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[oklch(0.30_0.15_252/0.2)] blur-[100px]" />
        </div>
      </div>
    </section>
  );
}
