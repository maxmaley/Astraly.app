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
            <div className="flex items-center text-xl font-bold tracking-tight">
              <span className="font-display text-[var(--foreground)]">Astraly</span>
              <span className="font-display text-cosmic-400">.app</span>
            </div>
            <p className="max-w-xs text-center text-sm text-[var(--muted-foreground)] md:text-left">
              {t("landing.footerTagline")}
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3 mt-2">
              {/* TikTok */}
              <a
                href="#"
                aria-label="TikTok"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted-foreground)] transition-colors hover:border-cosmic-500/40 hover:text-cosmic-400"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.16 8.16 0 0 0 4.77 1.52V6.75a4.85 4.85 0 0 1-1-.06z" />
                </svg>
              </a>
              {/* Instagram */}
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
                {t("landing.footerSectionProduct")}
              </p>
              <a href="#features" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                {t("landing.sectionFeatures")}
              </a>
              <a href="#pricing" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                {t("landing.sectionPricing")}
              </a>
              <Link href="/register" locale={locale} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                {t("common.register")}
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                {t("landing.footerSupport")}
              </p>
              <a href="mailto:support@astraly.app" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                {t("landing.footerSupport")}
              </a>
              <Link href="/privacy" locale={locale} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                {t("landing.footerPolicy")}
              </Link>
              <Link href="/terms" locale={locale} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                {t("landing.footerTerms")}
              </Link>
              <Link href="/cookies" locale={locale} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                {t("landing.footerCookies")}
              </Link>
              <Link href="/refund" locale={locale} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                {t("landing.footerRefunds")}
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                {t("landing.footerSectionAccount")}
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
        <div className="mt-10 border-t border-[var(--border)] pt-8">
          <p className="text-center text-xs text-[var(--muted-foreground)]">
            © {year} Astraly · {t("landing.footerRights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
