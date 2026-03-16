import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Script from "next/script";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trip Assistant — AI Travel Assistant for Agencies",
  description:
    "AI-powered chatbot for travel agencies. Answer tourist questions 24/7 via Telegram & WhatsApp. Save your managers 10+ hours a week.",
  openGraph: {
    title: "Trip Assistant — AI Travel Assistant for Agencies",
    description:
      "AI-powered chatbot for travel agencies. Answer tourist questions 24/7 via Telegram & WhatsApp.",
    url: "https://trip.llmsolution.eu",
    siteName: "Trip Assistant",
    type: "website",
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}');`}
          </Script>
        </>
      )}
      {children}
    </NextIntlClientProvider>
  );
}
