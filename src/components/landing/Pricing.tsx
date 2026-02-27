import { getTranslations, getLocale } from "next-intl/server";
import { PLANS, PLAN_ORDER, canAccess } from "@/lib/plans";
import type { SubscriptionTier }        from "@/types/database";
import { PricingCards }                 from "./PricingCards";
import type { PlanCardData, PricingLabels } from "./PricingCards";

type TranslateFn = Awaited<ReturnType<typeof getTranslations>>;

function buildFeatures(id: SubscriptionTier, t: TranslateFn) {
  const plan = PLANS[id];
  const n    = plan.maxCharts;

  const chartsText =
    n === -1 ? t("pricing.featureLabels.chartsUnlimited") :
    n === 1  ? t("pricing.featureLabels.chartsOne") :
               t("pricing.featureLabels.chartsMany", { n });

  const chatKey = `pricing.featureLabels.chat_${id}` as Parameters<typeof t>[0];

  const items = [
    { text: t(chatKey),                               included: canAccess(id, "chat")          },
    { text: chartsText,                               included: true                            },
    { text: t("pricing.featureLabels.multiCharts"),   included: canAccess(id, "multi_charts")   },
    { text: t("pricing.featureLabels.horoscope"),     included: canAccess(id, "horoscope")      },
    { text: t("pricing.featureLabels.calendar"),      included: canAccess(id, "calendar")       },
    { text: t("pricing.featureLabels.notifications"), included: canAccess(id, "notifications")  },
    { text: t("pricing.featureLabels.priorityAi"),    included: canAccess(id, "priority_ai")    },
  ];

  return items.filter((_, i) => !(i === 2 && id === "free"));
}

export async function Pricing() {
  const t      = await getTranslations();
  const locale = await getLocale();

  const labels: PricingLabels = {
    monthly:      t("pricing.monthly"),
    yearly:       t("pricing.yearly"),
    yearlyBadge:  t("pricing.yearlyBadge"),
    perMonth:     t("pricing.perMonth"),
    billedYearly: t("pricing.billedYearly"),
    free:         t("pricing.free"),
    popular:      t("pricing.popular"),
    trial:        t("pricing.trial"),
  };

  const plans: PlanCardData[] = PLAN_ORDER.map((id) => {
    const plan = PLANS[id];
    return {
      id,
      icon:          plan.icon,
      name:          plan.name,
      tagline:       t(`pricing.taglines.${id}` as Parameters<typeof t>[0]),
      color:         plan.color,
      highlight:     plan.highlight,
      gradientFrom:  plan.gradientFrom,
      gradientTo:    plan.gradientTo,
      isFree:        plan.price.monthly === 0,
      trialDays:     plan.trialDays,
      monthlyPrice:  plan.price.monthly,
      yearlyMonthly: plan.price.yearlyMonthly,
      yearlyTotal:   plan.price.yearly,
      features:      buildFeatures(id, t),
      ctaLabel:      plan.price.monthly === 0 ? t("pricing.startFree") : t("pricing.startTrial"),
      ctaHref:       `/${locale}/register`,
    };
  });

  return (
    <section id="pricing" className="relative px-4 py-24">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cosmic-500/8 blur-[150px]"
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
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

        {/* Toggle + Cards (client) */}
        <PricingCards plans={plans} labels={labels} />

        {/* Bottom note */}
        <p className="mt-8 text-center text-sm text-[var(--muted-foreground)]">
          {t("pricing.cancel")} · {t("pricing.noHidden")} · {t("landing.pricingSecure")}
        </p>
      </div>
    </section>
  );
}
