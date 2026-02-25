"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Link } from "@/navigation";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { useEffect, useState } from "react";

export function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          locale={locale}
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-[var(--foreground)]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cosmic-500 to-nebula-500 text-sm text-white shadow-glow">
            ✦
          </span>
          <span className="font-display gradient-text">Astraly</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <a
            href="#features"
            className="text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
          >
            {t("landing.featuresTitle").split(" ").slice(0, 2).join(" ")}
          </a>
          <a
            href="#pricing"
            className="text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
          >
            {t("pricing.free") === "Бесплатно" ? "Цены" : t("pricing.free") === "Free" ? "Pricing" : "Ціни"}
          </a>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />

          <div className="hidden items-center gap-2 sm:flex">
            <Link
              href="/login"
              locale={locale}
              className="rounded-full px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
            >
              {t("common.login")}
            </Link>
            <Link
              href="/register"
              locale={locale}
              className="rounded-full bg-gradient-to-r from-cosmic-500 to-nebula-500 px-4 py-2 text-sm font-semibold text-white shadow-glow transition-all hover:shadow-cosmic hover:scale-105"
            >
              {t("common.start")}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] sm:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {menuOpen ? (
                <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>
              ) : (
                <><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-[var(--border)] bg-[var(--background)]/95 px-4 py-4 backdrop-blur-xl sm:hidden">
          <div className="flex flex-col gap-3">
            <a href="#features" onClick={() => setMenuOpen(false)} className="py-2 text-sm text-[var(--muted-foreground)]">
              Возможности
            </a>
            <a href="#pricing" onClick={() => setMenuOpen(false)} className="py-2 text-sm text-[var(--muted-foreground)]">
              Цены
            </a>
            <div className="mt-2 flex flex-col gap-2">
              <Link href="/login" locale={locale} className="rounded-xl border border-[var(--border)] py-2.5 text-center text-sm font-medium">
                {t("common.login")}
              </Link>
              <Link href="/register" locale={locale} className="rounded-xl bg-gradient-to-r from-cosmic-500 to-nebula-500 py-2.5 text-center text-sm font-semibold text-white">
                {t("common.start")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
