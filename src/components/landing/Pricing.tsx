import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/navigation";
import { PLANS, PLAN_ORDER, formatPrice, canAccess } from "@/lib/plans";
import type { SubscriptionTier } from "@/types/database";

interface FeatureItem {
  text: string;
  included: boolean;
}

type TranslateFn = Awaited<ReturnType<typeof getTranslations>>;

function buildFeatureList(id: SubscriptionTier, t: TranslateFn): FeatureItem[] {
  const plan = PLANS[id];
  const n = plan.maxCharts;

  let chartsText: string;
  if (n === -1) {
    chartsText = t("pricing.featureLabels.chartsUnlimited");
  } else if (n === 1) {
    chartsText = t("pricing.featureLabels.chartsOne");
  } else {
    chartsText = t("pricing.featureLabels.chartsMany", { n });
  }

  const items: FeatureItem[] = [
    { text: t("pricing.featureLabels.chat"),          included: canAccess(id, "chat")          },
    { text: chartsText,                               included: true                            },
    { text: t("pricing.featureLabels.multiCharts"),   included: canAccess(id, "multi_charts")   },
    { text: t("pricing.featureLabels.horoscope"),     included: canAccess(id, "horoscope")      },
    { text: t("pricing.featureLabels.calendar"),      included: canAccess(id, "calendar")       },
    { text: t("pricing.featureLabels.notifications"), included: canAccess(id, "notifications")  },
    { text: t("pricing.featureLabels.priorityAi"),    included: canAccess(id, "priority_ai")    },
  ];

  // Hide multi_charts row for free plan (redundant with chartsOne)
  return items.filter((_, i) => !(i === 2 && id === "free"));
}

export async function Pricing() {
  const t      = await getTranslations();
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
          {PLAN_ORDER.map((id) => {
            const plan         = PLANS[id];
            const isFree       = plan.price.monthly === 0;
            const isPopular    = plan.highlight;
            const displayPrice = formatPrice(plan.price.monthly);
            const features     = buildFeatureList(id, t);
            const tagline      = t(`pricing.taglines.${id}` as Parameters<typeof t>[0]);

            return (
              <div
                key={id}
                className={`relative flex flex-col rounded-2xl transition-transform duration-300 hover:-translate-y-1 ${
                  isPopular
                    ? "border-2 border-cosmic-500 bg-gradient-to-b from-cosmic-500/15 to-[var(--card)] shadow-cosmic"
                    : "border border-[var(--border)] bg-[var(--card)] hover:border-cosmic-500/40"
                }`}
              >
                {/* Popular banner */}
                {isPopular ? (
                  <div className="-mx-px -mt-px mb-0 flex items-center justify-center gap-1.5 rounded-t-2xl bg-gradient-to-r from-cosmic-500 to-nebula-500 py-2 text-xs font-bold text-white">
                    ✦ {t("pricing.popular")}
                  </div>
                ) : (
                  <div className="py-2" />
                )}

                <div className="flex flex-1 flex-col p-6 pt-4">
                  {/* Icon + Name + Tagline */}
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-2xl">{plan.icon}</span>
                    <div>
                      <h3 className={`font-display text-base font-bold ${plan.color}`}>
                        {plan.name}
                      </h3>
                      <p className="text-xs text-[var(--muted-foreground)]">{tagline}</p>
                    </div>
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
                          {displayPrice}
                        </span>
                        <span className="text-sm text-[var(--muted-foreground)]">
                          {t("pricing.perMonth")}
                        </span>
                      </div>
                    )}
                    {!isFree && (
                      <p className="mt-1 text-xs text-cosmic-400">{t("pricing.trial")}</p>
                    )}
                  </div>

                  {/* Feature list with ✓/✗ */}
                  <ul className="mb-8 flex flex-grow flex-col gap-2.5">
                    {features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <span className={`mt-0.5 shrink-0 ${feat.included ? "text-emerald-400" : "text-[var(--border)]"}`}>
                          {feat.included ? "✓" : "✗"}
                        </span>
                        <span className={feat.included ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)] line-through decoration-[var(--border)]"}>
                          {feat.text}
                        </span>
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
                </div>
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
