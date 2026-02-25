import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { Link } from "@/navigation";

export async function Footer() {
  const t = await getTranslations();
  const locale = await getLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-[var(--border)] px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="flex flex-col items-center gap-3 md:items-start">
            <div className="flex items-center gap-2 text-lg font-bold">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cosmic-500 to-nebula-500 text-sm text-white shadow-glow">
                ✦
              </span>
              <span className="font-display gradient-text">Astraly</span>
            </div>
            <p className="max-w-xs text-center text-sm text-[var(--muted-foreground)] md:text-left">
              {t("landing.footerTagline")}
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3 mt-2">
              <a
                href="#"
                aria-label="Telegram"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted-foreground)] transition-colors hover:border-cosmic-500/40 hover:text-cosmic-400"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.247l-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.163 13.6l-2.952-.924c-.642-.202-.654-.642.136-.953l11.527-4.443c.536-.194 1.006.131.688.967z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted-foreground)] transition-colors hover:border-cosmic-500/40 hover:text-cosmic-400"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links groups */}
          <div className="flex flex-wrap justify-center gap-12 md:justify-end">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                Продукт
              </p>
              <a href="#features" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                Возможности
              </a>
              <a href="#pricing" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                Цены
              </a>
              <Link href="/register" locale={locale} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                {t("common.register")}
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                Поддержка
              </p>
              <a href="mailto:support@astraly.app" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                {t("landing.footerSupport")}
              </a>
              <a href="#" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                {t("landing.footerPolicy")}
              </a>
              <a href="#" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                {t("landing.footerTerms")}
              </a>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                Аккаунт
              </p>
              <Link href="/login" locale={locale} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                {t("common.login")}
              </Link>
              <Link href="/register" locale={locale} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                {t("common.start")}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-8 md:flex-row">
          <p className="text-xs text-[var(--muted-foreground)]">
            © {year} Astraly · {t("landing.footerRights")}
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">
            Made with ✦ for the stars
          </p>
        </div>
      </div>
    </footer>
  );
}
