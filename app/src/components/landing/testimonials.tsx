import { useTranslations } from "next-intl";
import { Quote } from "lucide-react";

export function Testimonials() {
  const t = useTranslations("testimonials");
  const items = t.raw("items") as Array<{
    quote: string;
    author: string;
    role: string;
  }>;

  return (
    <section className="relative bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[oklch(0.15_0.02_252)] tracking-tight">
            {t("title")}
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-[oklch(0.45_0.02_252)]">
            {t("subtitle")}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="relative rounded-2xl border border-[oklch(0.90_0.015_252)] bg-[oklch(0.99_0_0)] p-8 hover:shadow-md transition-shadow"
            >
              <Quote className="h-8 w-8 text-[oklch(0.50_0.22_252/0.2)] mb-4" />
              <p className="text-[oklch(0.30_0.02_252)] leading-relaxed mb-6 italic">
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[oklch(0.50_0.22_252)] to-[oklch(0.62_0.20_280)] flex items-center justify-center text-white font-bold text-sm">
                  {item.author.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[oklch(0.15_0.02_252)]">
                    {item.author}
                  </div>
                  <div className="text-xs text-[oklch(0.50_0.02_252)]">
                    {item.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coming soon note */}
        <p className="text-center mt-8 text-sm text-[oklch(0.55_0.02_252)]">
          {t("comingSoon")}
        </p>
      </div>
    </section>
  );
}
