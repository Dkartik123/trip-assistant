import { useTranslations } from "next-intl";
import {
  Bot,
  MessageSquare,
  Mic,
  Bell,
  MessagesSquare,
  Languages,
} from "lucide-react";

const featureKeys = [
  { key: "ai", icon: Bot, colSpan: "md:col-span-2", rowSpan: "" },
  { key: "telegram", icon: MessageSquare, colSpan: "", rowSpan: "" },
  { key: "voice", icon: Mic, colSpan: "", rowSpan: "" },
  { key: "notifications", icon: Bell, colSpan: "", rowSpan: "" },
  { key: "chat", icon: MessagesSquare, colSpan: "", rowSpan: "" },
  { key: "multilang", icon: Languages, colSpan: "md:col-span-2", rowSpan: "" },
] as const;

export function FeaturesBento() {
  const t = useTranslations("features");

  return (
    <section id="features" className="relative bg-[oklch(0.98_0_0)] py-24 sm:py-32">
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

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {featureKeys.map(({ key, icon: Icon, colSpan }) => (
            <div
              key={key}
              className={`group relative overflow-hidden rounded-2xl border border-[oklch(0.90_0.015_252)] bg-white p-6 lg:p-8 hover:shadow-lg hover:shadow-[oklch(0.50_0.22_252/0.08)] transition-all duration-300 hover:-translate-y-0.5 ${colSpan}`}
            >
              {/* Icon */}
              <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-[oklch(0.50_0.22_252/0.1)] p-3">
                <Icon className="h-6 w-6 text-[oklch(0.50_0.22_252)]" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-[oklch(0.15_0.02_252)] mb-2">
                {t(`${key}.title`)}
              </h3>
              <p className="text-sm leading-relaxed text-[oklch(0.45_0.02_252)]">
                {t(`${key}.description`)}
              </p>

              {/* Hover gradient corner */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[oklch(0.50_0.22_252/0.05)] to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
