import { useTranslations } from "next-intl";
import { Check } from "lucide-react";

const plans = ["starter", "pro", "business"] as const;

export function Pricing() {
  const t = useTranslations("pricing");

  return (
    <section id="pricing" className="relative bg-[oklch(0.98_0_0)] py-24 sm:py-32">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const isPopular = plan === "pro";
            const features = t.raw(`${plan}.features`) as string[];

            return (
              <div
                key={plan}
                className={`relative rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 ${
                  isPopular
                    ? "bg-[oklch(0.14_0.04_252)] text-white shadow-2xl shadow-[oklch(0.50_0.22_252/0.15)] ring-2 ring-[oklch(0.50_0.22_252)] scale-[1.02]"
                    : "bg-white border border-[oklch(0.90_0.015_252)] hover:shadow-lg"
                }`}
              >
                {/* Popular badge */}
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-[oklch(0.50_0.22_252)] px-4 py-1 text-xs font-semibold text-white shadow-lg">
                      {t("popular")}
                    </span>
                  </div>
                )}

                {/* Plan name */}
                <div className="mb-6">
                  <h3
                    className={`text-lg font-semibold ${
                      isPopular ? "text-white" : "text-[oklch(0.15_0.02_252)]"
                    }`}
                  >
                    {t(`${plan}.name`)}
                  </h3>
                  <p
                    className={`mt-1 text-sm ${
                      isPopular ? "text-white/60" : "text-[oklch(0.45_0.02_252)]"
                    }`}
                  >
                    {t(`${plan}.description`)}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <span
                    className={`text-4xl font-bold ${
                      isPopular ? "text-white" : "text-[oklch(0.15_0.02_252)]"
                    }`}
                  >
                    €{t(`${plan}.price`)}
                  </span>
                  <span
                    className={`text-sm ${
                      isPopular ? "text-white/50" : "text-[oklch(0.45_0.02_252)]"
                    }`}
                  >
                    {t("monthly")}
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check
                        className={`h-5 w-5 shrink-0 mt-0.5 ${
                          isPopular
                            ? "text-[oklch(0.62_0.20_252)]"
                            : "text-[oklch(0.50_0.22_252)]"
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          isPopular ? "text-white/80" : "text-[oklch(0.35_0.02_252)]"
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  href="#contact"
                  className={`block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all ${
                    isPopular
                      ? "bg-white text-[oklch(0.14_0.04_252)] hover:bg-white/90 shadow-lg"
                      : "bg-[oklch(0.50_0.22_252/0.1)] text-[oklch(0.50_0.22_252)] hover:bg-[oklch(0.50_0.22_252/0.15)]"
                  }`}
                >
                  {isPopular ? t("ctaPopular") : t("cta")}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
