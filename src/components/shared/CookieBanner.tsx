"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const locale = useLocale();

  useEffect(() => {
    const consent = localStorage.getItem("astraly-cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = (type: "all" | "necessary") => {
    localStorage.setItem("astraly-cookie-consent", type);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-slide-up">
      <div className="mx-auto max-w-4xl rounded-xl border border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-sm px-5 py-4 shadow-cosmic md:flex md:items-center md:gap-6">
        <p className="flex-1 text-sm text-[var(--muted-foreground)] mb-4 md:mb-0 leading-relaxed">
          Мы используем cookies для входа в аккаунт и работы сервиса, а также (в будущем) для аналитики и рекламы.{" "}
          <a
            href={`/${locale}/cookies`}
            className="underline underline-offset-2 hover:text-[var(--foreground)] transition-colors"
          >
            Политика cookies
          </a>
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => accept("necessary")}
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]/20 transition-colors"
          >
            Только необходимые
          </button>
          <button
            onClick={() => accept("all")}
            className="rounded-lg bg-cosmic-500 px-4 py-2 text-sm font-medium text-white hover:bg-cosmic-600 transition-colors"
          >
            Принять все
          </button>
        </div>
      </div>
    </div>
  );
}
