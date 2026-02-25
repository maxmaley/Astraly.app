import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Astraly — твой AI астролог",
  description:
    "Персональная натальная карта и AI астролог, который знает твою карту и помнит каждый разговор.",
  keywords: ["астрология", "натальная карта", "AI астролог", "гороскоп"],
  openGraph: {
    title: "Astraly — твой AI астролог",
    description: "Персональная натальная карта + AI астролог с памятью",
    type: "website",
  },
};

// This layout renders nothing — all rendering is in [locale]/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
