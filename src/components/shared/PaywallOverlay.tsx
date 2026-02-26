"use client";

import { useRouter } from "@/navigation";
import { useLocale } from "next-intl";
import { PLANS, cheapestPlanFor, type Feature } from "@/lib/plans";

// ── Feature display config ────────────────────────────────────────────────────

const FEATURE_META: Record<Feature, {
  icon:    string;
  title:   Record<string, string>;
  desc:    Record<string, string>;
}> = {
  horoscope: {
    icon:  "☀️",
    title: { ru: "Ежедневный гороскоп", uk: "Щоденний гороскоп",  en: "Daily Horoscope"   },
    desc:  {
      ru: "Персональный прогноз на каждый день, построенный на основе твоей натальной карты и положения планет прямо сейчас.",
      uk: "Персональний прогноз на кожен день на основі твоєї натальної карти та положення планет.",
      en: "A personal forecast for every day, built on your natal chart and the planets' positions right now.",
    },
  },
  calendar: {
    icon:  "🗓",
    title: { ru: "Астро-календарь",    uk: "Астро-календар",      en: "Astro Calendar"   },
    desc:  {
      ru: "Лунные фазы, ретрограды, ингрессии планет — все астрологические события месяца в одном виде.",
      uk: "Місячні фази, ретрогради, інгресії планет — усі астрологічні події місяця в одному місці.",
      en: "Moon phases, retrogrades, planet ingresses — every astrological event of the month at a glance.",
    },
  },
  multi_charts: {
    icon:  "✦",
    title: { ru: "Карты близких",       uk: "Карти близьких",      en: "Charts for Others" },
    desc:  {
      ru: "Добавь натальные карты партнёра, родителей или друзей. AI запомнит каждую и учтёт в разговоре.",
      uk: "Додай натальні карти партнера, батьків чи друзів. AI запам'ятає кожну з них.",
      en: "Add natal charts for your partner, family, or friends. The AI remembers each one in conversation.",
    },
  },
  notifications: {
    icon:  "🔔",
    title: { ru: "Уведомления",         uk: "Сповіщення",          en: "Notifications"    },
    desc:  {
      ru: "Получай гороскоп на email каждое утро и узнавай о важных транзитах заранее.",
      uk: "Отримуй гороскоп на email щоранку та дізнавайся про важливі транзити заздалегідь.",
      en: "Get your horoscope by email every morning and be alerted to important transits in advance.",
    },
  },
  priority_ai: {
    icon:  "🌌",
    title: { ru: "Приоритетный AI",     uk: "Пріоритетний AI",     en: "Priority AI"      },
    desc:  {
      ru: "Глубокий анализ карты с более мощной моделью. Тонкие наблюдения, богатый контекст.",
      uk: "Глибокий аналіз карти з потужнішою моделлю. Тонкі спостереження, багатий контекст.",
      en: "Deeper chart analysis with a more powerful model. Richer insights, more nuanced context.",
    },
  },
  chat: {
    icon:  "✨",
    title: { ru: "AI-чат",              uk: "AI-чат",               en: "AI Chat"          },
    desc:  {
      ru: "Задавай любые вопросы астрологу с памятью о твоей карте.",
      uk: "Задавай будь-які питання астрологу, який пам'ятає твою карту.",
      en: "Ask the AI astrologer anything — it always knows your natal chart.",
    },
  },
};

const PLANS_LABEL: Record<string, Record<string, string>> = {
  ru: { moonlight: "Moonlight", solar: "Solar Oracle", cosmic: "Cosmic Mind" },
  uk: { moonlight: "Moonlight", solar: "Solar Oracle", cosmic: "Cosmic Mind" },
  en: { moonlight: "Moonlight", solar: "Solar Oracle", cosmic: "Cosmic Mind" },
};

const COPY = {
  includedIn:  { ru: "Доступно в",          uk: "Доступно в",         en: "Included in"          },
  trialCta:    { ru: "Попробовать 3 дня ✦", uk: "Спробувати 3 дні ✦", en: "Try free for 3 days ✦" },
  viewPlans:   { ru: "Посмотреть все планы", uk: "Переглянути всі плани", en: "View all plans"      },
  andUp:       { ru: " и выше",             uk: " і вище",             en: " and above"            },
};

// ── Component ─────────────────────────────────────────────────────────────────

export function PaywallOverlay({ feature }: { feature: Feature }) {
  const locale = useLocale() as "ru" | "uk" | "en";
  const router = useRouter();
  const l = locale in COPY.trialCta ? locale : "ru";

  const meta     = FEATURE_META[feature];
  const minPlan  = cheapestPlanFor(feature);
  const plan     = PLANS[minPlan];
  const hasTrial = plan.trialDays > 0;

  // Build "included in X and above" label
  const tiers = ["moonlight", "solar", "cosmic"] as const;
  const startIdx = tiers.indexOf(minPlan as typeof tiers[number]);
  const planNames = startIdx >= 0
    ? tiers.slice(startIdx).map(id => PLANS[id].name).join(", ")
    : plan.name;

  return (
    <div className="relative mx-auto max-w-2xl px-4 py-6 sm:py-10">
      {/* Blurred ghost of what the page would show */}
      <div
        aria-hidden
        className="pointer-events-none select-none blur-sm opacity-30"
      >
        <div className="space-y-4">
          <div className="h-8 w-48 rounded-lg bg-[var(--border)]" />
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
            <div className="h-4 w-full rounded bg-[var(--border)]" />
            <div className="h-4 w-5/6 rounded bg-[var(--border)]" />
            <div className="h-4 w-4/5 rounded bg-[var(--border)]" />
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="h-20 rounded-xl bg-[var(--border)]" />
              <div className="h-20 rounded-xl bg-[var(--border)]" />
            </div>
          </div>
        </div>
      </div>

      {/* Overlay card — centered over the blurred content */}
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className={[
          "w-full max-w-sm rounded-2xl border border-[var(--border)]",
          "bg-[var(--card)] shadow-cosmic p-7 flex flex-col items-center text-center",
        ].join(" ")}>

          {/* Feature icon */}
          <div className={[
            "mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl",
            `bg-gradient-to-br ${plan.gradientFrom}/15 ${plan.gradientTo}/15`,
            "border border-[var(--border)]",
          ].join(" ")}>
            {meta.icon}
          </div>

          <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">
            {meta.title[l]}
          </h2>

          <p className="text-sm leading-relaxed text-[var(--muted-foreground)] mb-5">
            {meta.desc[l]}
          </p>

          {/* Plan badge */}
          <p className="mb-5 text-xs text-[var(--muted-foreground)]">
            {COPY.includedIn[l]}{" "}
            <span className={`font-semibold ${plan.color}`}>{planNames}</span>
            {COPY.andUp[l]}
          </p>

          {/* CTAs */}
          <button
            onClick={() => router.push("/app/pricing")}
            className={[
              "w-full rounded-xl py-3 text-sm font-semibold text-white mb-2.5",
              `bg-gradient-to-r ${plan.gradientFrom} ${plan.gradientTo}`,
              "hover:opacity-90 active:opacity-80 transition-opacity",
              "shadow-sm",
            ].join(" ")}
          >
            {hasTrial ? COPY.trialCta[l] : COPY.viewPlans[l]}
          </button>

          <button
            onClick={() => router.push("/app/pricing")}
            className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            {COPY.viewPlans[l]}
          </button>
        </div>
      </div>
    </div>
  );
}
