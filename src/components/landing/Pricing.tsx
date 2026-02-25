import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { Link } from "@/navigation";

const PLAN_IDS = ["starlight", "moonlight", "solar", "cosmic"] as const;
type PlanId = typeof PLAN_IDS[number];

const PLAN_ICONS: Record<PlanId, string> = {
  starlight: "⭐",
  moonlight: "🌙",
  solar: "☀️",
  cosmic: "🌌",
};

export async function Pricing() {
  const t = await getTranslations();
  const locale = await getLocale();

  return (
    <section id="pricing" className="relative px-4 py-24">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cosmic-500/8 blur-[150px]"
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cosmic-500/30 bg-cosmic-500/10 px-4 py-1.5 text-xs font-medium text-cosmic-600 dark:text-cosmic-300">
            ✦ {t("landing.sectionPricing")}
          </div>
          <h2 className="font-display text-4xl font-bold sm:text-5xl">
            <span className="gradient-text">{t("landing.pricingTitle")}</span>
          </h2>
          <p className="mt-4 text-[var(--muted-foreground)]">
            {t("pricing.cancel")} · {t("pricing.noHidden")} · {t("pricing.trial")}
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLAN_IDS.map((id) => {
            const price = t(`pricing.plans.${id}.price`);
            const name = t(`pricing.plans.${id}.name`);
            const isFree = price === "0";
            const isPopular = id === "solar";

            // Features array — we use hardcoded indices since next-intl doesn't support array iteration easily
            const features: string[] = [];
            const rawFeatures = t.raw(`pricing.plans.${id}.features`);
            if (Array.isArray(rawFeatures)) {
              features.push(...rawFeatures as string[]);
            }

            return (
              <div
                key={id}
                className={`relative flex flex-col rounded-2xl transition-transform duration-300 hover:-translate-y-1 ${
                  isPopular
                    ? "border-2 border-cosmic-500 bg-gradient-to-b from-cosmic-500/15 to-[var(--card)] shadow-cosmic"
                    : "border border-[var(--border)] bg-[var(--card)] hover:border-cosmic-500/40"
                }`}
              >
                {/* Popular banner — inline at top of card */}
                {isPopular ? (
                  <div className="-mx-px -mt-px mb-0 flex items-center justify-center gap-1.5 rounded-t-2xl bg-gradient-to-r from-cosmic-500 to-nebula-500 py-2 text-xs font-bold text-white">
                    ✦ {t("pricing.popular")}
                  </div>
                ) : (
                  <div className="py-2" /> /* spacer so all cards align */
                )}
                <div className="flex flex-1 flex-col p-6 pt-4">

                {/* Icon + Name */}
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-2xl">{PLAN_ICONS[id]}</span>
                  <h3 className="font-display text-base font-bold text-[var(--foreground)]">
                    {name}
                  </h3>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {isFree ? (
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-4xl font-bold text-[var(--foreground)]">
                        {t("pricing.free")}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-medium text-[var(--muted-foreground)]">$</span>
                      <span className="font-display text-4xl font-bold text-[var(--foreground)]">
                        {price}
                      </span>
                      <span className="text-sm text-[var(--muted-foreground)]">
                        {t("pricing.perMonth")}
                      </span>
                    </div>
                  )}
                  {!isFree && (
                    <p className="mt-1 text-xs text-cosmic-400">
                      {t("pricing.trial")}
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="mb-8 flex flex-grow flex-col gap-3">
                  {features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm text-[var(--foreground)]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="mt-0.5 flex-shrink-0 text-cosmic-400">
                        <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {feat}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href="/register"
                  locale={locale}
                  className={`block rounded-xl py-3 text-center text-sm font-semibold transition-all ${
                    isPopular
                      ? "bg-gradient-to-r from-cosmic-500 to-nebula-500 text-white shadow-glow hover:shadow-cosmic hover:scale-[1.02]"
                      : isFree
                      ? "border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]"
                      : "border border-cosmic-500/50 text-cosmic-600 dark:text-cosmic-300 hover:bg-cosmic-500/10"
                  }`}
                >
                  {isFree ? t("pricing.startFree") : t("pricing.startTrial")}
                </Link>
                </div>{/* end inner flex */}
              </div>
            );
          })}
        </div>

        {/* Bottom note */}
        <p className="mt-8 text-center text-sm text-[var(--muted-foreground)]">
          {t("pricing.cancel")} · {t("pricing.noHidden")} · {t("landing.pricingSecure")}
        </p>
      </div>
    </section>
  );
}
