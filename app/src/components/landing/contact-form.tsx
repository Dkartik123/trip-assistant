"use client";

import { useTranslations } from "next-intl";
import { Send } from "lucide-react";
import { useState } from "react";

export function ContactForm() {
  const t = useTranslations("contact");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      agency: (form.elements.namedItem("agency") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="relative py-24 sm:py-32 bg-[oklch(0.13_0.04_252)]">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-[oklch(0.25_0.12_252/0.2)] blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-[oklch(0.20_0.10_280/0.15)] blur-[80px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-white/50">
            {t("subtitle")}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-1.5">
                {t("form.name")}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-[oklch(0.50_0.22_252)] focus:ring-1 focus:ring-[oklch(0.50_0.22_252)] focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1.5">
                {t("form.email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-[oklch(0.50_0.22_252)] focus:ring-1 focus:ring-[oklch(0.50_0.22_252)] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="agency" className="block text-sm font-medium text-white/70 mb-1.5">
              {t("form.agency")}
            </label>
            <input
              id="agency"
              name="agency"
              type="text"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-[oklch(0.50_0.22_252)] focus:ring-1 focus:ring-[oklch(0.50_0.22_252)] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-white/70 mb-1.5">
              {t("form.message")}
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-[oklch(0.50_0.22_252)] focus:ring-1 focus:ring-[oklch(0.50_0.22_252)] focus:outline-none transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={status === "sending"}
            className="group w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[oklch(0.50_0.22_252)] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-[oklch(0.50_0.22_252/0.25)] hover:bg-[oklch(0.55_0.22_252)] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {status === "sending" ? (
              t("form.sending")
            ) : (
              <>
                {t("form.submit")}
                <Send className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>

          {/* Status messages */}
          {status === "success" && (
            <p className="text-center text-sm text-emerald-400">{t("form.success")}</p>
          )}
          {status === "error" && (
            <p className="text-center text-sm text-red-400">{t("form.error")}</p>
          )}
        </form>
      </div>
    </section>
  );
}
