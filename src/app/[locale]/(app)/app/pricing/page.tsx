"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale }                     from "next-intl";
import { createClient }                  from "@/lib/supabase/client";
import {
  PLANS, PLAN_ORDER, formatPrice,
  canAccess, getPaddlePriceId,
}                                        from "@/lib/plans";
import { usePaddleCheckout }             from "@/components/shared/PaddleProvider";
import type { SubscriptionTier }         from "@/types/database";
import { trackEvent }                   from "@/lib/analytics";

// ── Copy (inline — no i18n namespace needed for this single page) ─────────────

const C = {
  title:         { ru: "Тарифы",                       uk: "Тарифи",                        en: "Pricing",                      pl: "Cennik"                        },
  subtitle:      { ru: "Выбери свой путь к звёздам",   uk: "Оберіть свій шлях до зір",      en: "Choose your path to the stars", pl: "Wybierz swoją drogę do gwiazd" },
  monthly:       { ru: "Месяц",                        uk: "Місяць",                         en: "Monthly",                      pl: "Miesięcznie"                   },
  yearly:        { ru: "Год",                          uk: "Рік",                            en: "Yearly",                       pl: "Rocznie"                       },
  yearlyBadge:   { ru: "−33%",                         uk: "−33%",                           en: "−33%",                         pl: "−33%"                          },
  perMonth:      { ru: "/мес",                         uk: "/міс",                           en: "/mo",                          pl: "/mies."                        },
  billedYearly:  { ru: "в год",                        uk: "на рік",                         en: "/yr",                          pl: "/rok"                          },
  popular:       { ru: "Популярный",                   uk: "Популярний",                     en: "Most popular",                 pl: "Najpopularniejszy"             },
  current:       { ru: "Текущий план",                 uk: "Поточний план",                  en: "Current plan",                 pl: "Aktualny plan"                 },
  ctaFree:       { ru: "Бесплатный",                    uk: "Безкоштовний",                   en: "Free plan",                    pl: "Darmowy plan"                  },
  ctaPaid:       { ru: "Перейти на план →",            uk: "Перейти на план →",              en: "Get this plan →",              pl: "Wybierz plan →"                },
  ctaCurrent:    { ru: "✓ Активный план",              uk: "✓ Активний план",                en: "✓ Active plan",                pl: "✓ Aktywny plan"                },
  soonModal:     { ru: "Оплата подключается — скоро здесь появится кнопка 🔜", uk: "Оплата підключається — незабаром тут з'явиться кнопка 🔜", en: "Payment is coming — the button will appear here soon 🔜", pl: "Płatności wkrótce — przycisk pojawi się tutaj niebawem 🔜" },
  free:          { ru: "Бесплатно",                    uk: "Безкоштовно",                    en: "Free",                         pl: "Za darmo"                      },
  taglines: {
    ru: {
      free:      "Первые шаги к звёздам",
      moonlight: "Для семьи и близких",
      solar:     "Ежедневная астрология",
      cosmic:    "Безграничное познание",
    },
    uk: {
      free:      "Перші кроки до зір",
      moonlight: "Для сім'ї та близьких",
      solar:     "Щоденна астрологія",
      cosmic:    "Безмежне пізнання",
    },
    en: {
      free:      "First steps to the stars",
      moonlight: "For family & loved ones",
      solar:     "Daily astrology",
      cosmic:    "Boundless knowledge",
    },
    pl: {
      free:      "Pierwsze kroki ku gwiazdom",
      moonlight: "Dla rodziny i bliskich",
      solar:     "Codzienna astrologia",
      cosmic:    "Bezgraniczne poznanie",
    },
  },
  // Feature label keys (match PLANS[x].featureLabels keys)
  chatByPlan: {
    ru: {
      free:      "Базовый AI-чат ●○○○",
      moonlight: "Расширенный AI-чат ●●○○",
      solar:     "Глубокий AI-чат ●●●○",
      cosmic:    "Максимальный AI-чат ●●●●",
    },
    uk: {
      free:      "Базовий AI-чат ●○○○",
      moonlight: "Розширений AI-чат ●●○○",
      solar:     "Глибокий AI-чат ●●●○",
      cosmic:    "Максимальний AI-чат ●●●●",
    },
    en: {
      free:      "Basic AI chat ●○○○",
      moonlight: "Extended AI chat ●●○○",
      solar:     "Deep AI chat ●●●○",
      cosmic:    "Max AI chat ●●●●",
    },
    pl: {
      free:      "Podstawowy czat AI ●○○○",
      moonlight: "Rozszerzony czat AI ●●○○",
      solar:     "Zaawansowany czat AI ●●●○",
      cosmic:    "Maksymalny czat AI ●●●●",
    },
  },
  featureLabels: {
    ru: {
      charts_limit:  (n: string) => `${n} натальная карта${n === "1" ? "" : " (до " + n + ")"}`,
      multi_charts:  "Мой круг — карты партнёра, мамы, друзей",
      horoscope:     "Ежедневный личный гороскоп",
      calendar:      "Полный астро-календарь",
      notifications: "Email-уведомления",
      priority_ai:   "Приоритетный AI",
    },
    uk: {
      charts_limit:  (n: string) => `${n} натальна карта${n === "1" ? "" : " (до " + n + ")"}`,
      multi_charts:  "Моє коло — карти партнера, мами, друзів",
      horoscope:     "Щоденний особистий гороскоп",
      calendar:      "Повний астро-календар",
      notifications: "Email-сповіщення",
      priority_ai:   "Пріоритетний AI",
    },
    en: {
      charts_limit:  (n: string) => `${n === "1" ? "1 natal" : "Up to " + n} chart${n === "1" ? "" : "s"}`,
      multi_charts:  "My Circle — charts for partner, family & friends",
      horoscope:     "Daily personal horoscope",
      calendar:      "Full astro calendar",
      notifications: "Email notifications",
      priority_ai:   "Priority AI",
    },
    pl: {
      charts_limit:  (n: string) => `${n === "1" ? "1 karta" : "Do " + n + " kart"} urodzeniow${n === "1" ? "a" : "ych"}`,
      multi_charts:  "Mój krąg — karty partnera, rodziny i przyjaciół",
      horoscope:     "Codzienny osobisty horoskop",
      calendar:      "Pełny kalendarz astro",
      notifications: "Powiadomienia email",
      priority_ai:   "Priorytetowe AI",
    },
  },
};

// ── Feature list per plan ─────────────────────────────────────────────────────

interface FeatureItem { text: string; included: boolean }

function buildFeatureList(
  id: SubscriptionTier,
  l: "ru" | "uk" | "en" | "pl",
): FeatureItem[] {
  const plan     = PLANS[id];
  const labels   = C.featureLabels[l];
  const chartCount = plan.maxCharts === -1 ? "∞" : String(plan.maxCharts);

  return [
    {
      text:     C.chatByPlan[l][id],
      included: canAccess(id, "chat"),
    },
    {
      text:     labels.charts_limit(chartCount),
      included: true,
    },
    {
      text:     labels.multi_charts,
      included: canAccess(id, "multi_charts"),
    },
    {
      text:     labels.horoscope,
      included: canAccess(id, "horoscope"),
    },
    {
      text:     labels.calendar,
      included: canAccess(id, "calendar"),
    },
    {
      text:     labels.notifications,
      included: canAccess(id, "notifications"),
    },
    {
      text:     labels.priority_ai,
      included: canAccess(id, "priority_ai"),
    },
  ].filter((_, i) => {
    // Hide multi_charts from free (redundant with charts_limit)
    if (i === 2 && id === "free") return false;
    return true;
  });
}

// ── Coming-soon toast ─────────────────────────────────────────────────────────

function ComingSoonToast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-3.5 shadow-cosmic text-sm text-[var(--foreground)] max-w-xs text-center">
      {msg}
    </div>
  );
}

// ── Plan card ─────────────────────────────────────────────────────────────────

function PlanCard({
  id,
  yearly,
  currentTier,
  locale,
  onUpgrade,
}: {
  id:          SubscriptionTier;
  yearly:      boolean;
  currentTier: SubscriptionTier | null;
  locale:      "ru" | "uk" | "en" | "pl";
  onUpgrade:   (id: SubscriptionTier) => void;
}) {
  const l    = locale;
  const plan = PLANS[id];
  const isCurrent  = id === currentTier;

  // Price display
  const price = plan.price.monthly === 0
    ? null
    : yearly
      ? { main: plan.price.yearlyMonthly, suffix: `${C.perMonth[l]} · ${formatPrice(plan.price.yearly)} ${C.billedYearly[l]}` }
      : { main: plan.price.monthly,       suffix: C.perMonth[l] };

  const features = useMemo(() => buildFeatureList(id, l), [id, l]);

  return (
    <div className={[
      "relative flex flex-col rounded-2xl border bg-[var(--card)] overflow-hidden transition-all",
      plan.highlight
        ? "border-amber-400/40 shadow-[0_0_24px_rgba(251,191,36,0.12)]"
        : "border-[var(--border)]",
      isCurrent ? "opacity-70" : "",
    ].join(" ")}>

      {/* "Most popular" banner */}
      {plan.highlight && (
        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-amber-400/0 via-amber-400 to-amber-400/0" />
      )}

      <div className="p-6 pb-4">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{plan.icon}</span>
            <div>
              <p className={`text-base font-bold ${plan.color}`}>{plan.name}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{C.taglines[l][id]}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {plan.highlight && (
              <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                {C.popular[l]}
              </span>
            )}
            {isCurrent && (
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                {C.current[l]}
              </span>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="mb-6">
          {price ? (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-[var(--foreground)]">
                  ${formatPrice(price.main)}
                </span>
                <span className="text-sm text-[var(--muted-foreground)]">{price.suffix}</span>
              </div>
            </>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-[var(--foreground)]">
                {C.free[l]}
              </span>
            </div>
          )}
        </div>

        {/* CTA button */}
        <button
          disabled={isCurrent}
          onClick={() => onUpgrade(id)}
          className={[
            "w-full rounded-xl py-2.5 text-sm font-semibold transition-all",
            isCurrent
              ? "cursor-default bg-[var(--muted)] text-[var(--muted-foreground)]"
              : plan.highlight
                ? `bg-gradient-to-r ${plan.gradientFrom} ${plan.gradientTo} text-white hover:opacity-90 active:opacity-75 shadow-sm`
                : `border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)] hover:border-cosmic-400/30`,
          ].join(" ")}
        >
          {isCurrent
            ? C.ctaCurrent[l]
            : plan.price.monthly === 0
              ? C.ctaFree[l]
              : C.ctaPaid[l]}
        </button>
      </div>

      {/* Feature list */}
      <div className="border-t border-[var(--border)] px-6 py-4 space-y-2.5 flex-1">
        {features.map((f, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <span className={`mt-0.5 text-sm shrink-0 ${f.included ? "text-emerald-400" : "text-[var(--border)]"}`}>
              {f.included ? "✓" : "✗"}
            </span>
            <span className={`text-sm ${f.included ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)] line-through decoration-[var(--border)]"}`}>
              {f.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const locale     = useLocale() as "ru" | "uk" | "en" | "pl";
  const l          = (["ru", "uk", "en", "pl"] as const).includes(locale) ? locale : "ru" as const;
  const supabase   = useMemo(() => createClient(), []);
  const { openCheckout } = usePaddleCheckout();

  const [yearly,      setYearly]      = useState(false);
  const [currentTier, setCurrentTier] = useState<SubscriptionTier | null>(null);
  const [toast,       setToast]       = useState<string | null>(null);
  const [userEmail,   setUserEmail]   = useState<string | null>(null);
  const [userId,      setUserId]      = useState<string | null>(null);

  // Load current tier + user info
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserEmail(user.email ?? null);
      setUserId(user.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from("users")
        .select("subscription_tier")
        .eq("id", user.id)
        .single();
      const tier = data?.subscription_tier ?? "free";
      setCurrentTier(tier);
      trackEvent("pricing_viewed", { current_tier: tier });
    }
    load();
  }, [supabase]);

  function handleUpgrade(id: SubscriptionTier) {
    if (id === currentTier) return;
    if (id === "free") return;

    const priceId = getPaddlePriceId(id, yearly ? "yearly" : "monthly");
    if (!priceId || !userEmail || !userId) {
      setToast(C.soonModal[l]);
      return;
    }

    trackEvent("checkout_opened", { plan: id });
    openCheckout({ priceId, email: userEmail, userId, plan: id, locale: l });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
      {toast && <ComingSoonToast msg={toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-2 inline-flex items-center gap-2">
          <span className="text-cosmic-400 text-xl">✦</span>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">{C.title[l]}</h1>
        </div>
        <p className="text-sm text-[var(--muted-foreground)]">{C.subtitle[l]}</p>

        {/* Monthly / Yearly toggle */}
        <div className="mt-5 inline-flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--card)] p-0.5">
          <button
            onClick={() => setYearly(false)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
              !yearly ? "bg-cosmic-500 text-white shadow-sm" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {C.monthly[l]}
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all flex items-center gap-1.5 ${
              yearly ? "bg-cosmic-500 text-white shadow-sm" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {C.yearly[l]}
            <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 ${
              yearly ? "bg-white/20 text-white" : "bg-emerald-500/15 text-emerald-400"
            }`}>
              {C.yearlyBadge[l]}
            </span>
          </button>
        </div>
      </div>

      {/* Plan grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLAN_ORDER.map((id) => (
          <PlanCard
            key={id}
            id={id}
            yearly={yearly}
            currentTier={currentTier}
            locale={l}
            onUpgrade={handleUpgrade}
          />
        ))}
      </div>


    </div>
  );
}
