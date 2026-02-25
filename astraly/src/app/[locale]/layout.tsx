import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/i18n";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import "../globals.css";

export const metadata: Metadata = {
  title: { default: "Astraly — твой AI астролог", template: "%s | Astraly" },
  description:
    "Персональная натальная карта и AI астролог, который знает твою карту и помнит каждый разговор.",
  keywords: ["астрология", "натальная карта", "AI астролог", "гороскоп"],
  openGraph: {
    title: "Astraly — твой AI астролог",
    description: "Персональная натальная карта + AI астролог с памятью",
    type: "website",
    siteName: "Astraly",
  },
  twitter: { card: "summary_large_image" },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;

  if (!locales.includes(locale as Locale)) notFound();

  const messages = await getMessages();

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <head>
        {/* Google Fonts — loaded at runtime (not build time) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>{children}</ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
