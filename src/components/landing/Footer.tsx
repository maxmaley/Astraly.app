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
