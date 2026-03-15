/**
 * PLANS — single source of truth for subscription tier config.
 *
 * All feature gates, price displays, token limits, and UI copy
 * derive from this file. When the admin panel is built, these values
 * move to the DB; the exported helpers remain the same API.
 */

import type { SubscriptionTier } from "@/types/database";

// ── Feature keys ─────────────────────────────────────────────────────────────

export type Feature =
  | "chat"          // AI chat — all tiers, token-limited
  | "multi_charts"  // Multiple natal charts — moonlight+
  | "horoscope"     // Daily horoscope — solar+
  | "calendar"      // Astro calendar — solar+
  | "notifications" // Email notifications — solar+
  | "priority_ai";  // Premium model — cosmic

// ── Plan shape ────────────────────────────────────────────────────────────────

export interface PlanConfig {
  id:            SubscriptionTier;
  name:          string;
  icon:          string;
  color:         string;         // Tailwind text-* class
  ringColor:     string;         // Tailwind ring-* class
  gradientFrom:  string;         // Tailwind from-* class (for gradient badges)
  gradientTo:    string;
  price: {
    monthly:     number;         // USD cents — 0 for free
    yearly:      number;         // USD cents total — 0 for free
    yearlyMonthly: number;       // yearly price ÷ 12 (display only)
  };
  paddlePriceId: {
    monthly:     string;         // Paddle price ID — empty for free
    yearly:      string;         // Paddle price ID — empty for free
  };
  monthlyTokens: number;         // -1 = unlimited
  maxCharts:     number;         // -1 = unlimited

  features:      Feature[];
  featureLabels: Record<string, string>; // human-readable, kept here for admin override
  highlight:     boolean;        // "Most popular" badge
  tagline:       string;
}

// ── Config ───────────────────────────────────────────────────────────────────
// Prices in USD cents. ~33% yearly discount on all paid plans.

export const PLANS: Record<SubscriptionTier, PlanConfig> = {
  free: {
    id:            "free",
    name:          "Starlight",
    icon:          "⭐",
    color:         "text-slate-400",
    ringColor:     "ring-slate-400/30",
    gradientFrom:  "from-slate-500",
    gradientTo:    "to-slate-400",
    price:         { monthly: 0, yearly: 0, yearlyMonthly: 0 },
    paddlePriceId: { monthly: "", yearly: "" },
    monthlyTokens: 10_000,
    maxCharts:     1,
    features:      ["chat"],
    featureLabels: {
      chat:         "AI-чат с астрологом",
      charts_limit: "1 натальная карта",
    },
    highlight:     false,
    tagline:       "Первые шаги к звёздам",
  },

  moonlight: {
    id:            "moonlight",
    name:          "Moonlight",
    icon:          "🌙",
    color:         "text-blue-400",
    ringColor:     "ring-blue-400/30",
    gradientFrom:  "from-blue-600",
    gradientTo:    "to-indigo-500",
    price:         { monthly: 399, yearly: 3192, yearlyMonthly: 266 },
    paddlePriceId: {
      monthly: "pri_01kkqen32asscm69h698q4m8bt",
      yearly:  "pri_01kkqephdg765a7z1rnj5jqf5f",
    },
    monthlyTokens: 500_000,
    maxCharts:     3,
    features:      ["chat", "multi_charts"],
    featureLabels: {
      chat:         "Расширенный AI-чат",
      charts_limit: "До 3 натальных карт",
      multi_charts: "Карты близких — партнёр, семья",
    },
    highlight:     false,
    tagline:       "Для семьи и близких",
  },

  solar: {
    id:            "solar",
    name:          "Solar Oracle",
    icon:          "☀️",
    color:         "text-amber-400",
    ringColor:     "ring-amber-400/30",
    gradientFrom:  "from-amber-500",
    gradientTo:    "to-orange-400",
    price:         { monthly: 599, yearly: 4792, yearlyMonthly: 399 },
    paddlePriceId: {
      monthly: "pri_01kkqeqywk3vbftfzg5z9svmmr",
      yearly:  "pri_01kkqery0px7wwes0enh18t54n",
    },
    monthlyTokens: 1_000_000,
    maxCharts:     5,
    features:      ["chat", "multi_charts", "horoscope", "calendar", "notifications"],
    featureLabels: {
      chat:         "Безграничный AI-чат",
      charts_limit: "До 5 натальных карт",
      multi_charts: "Карты близких",
      horoscope:    "Ежедневный личный гороскоп",
      calendar:     "Полный астро-календарь",
      notifications:"Email-уведомления",
    },
    highlight:     true,
    tagline:       "Ежедневная астрология",
  },

  cosmic: {
    id:            "cosmic",
    name:          "Cosmic Mind",
    icon:          "🌌",
    color:         "text-cosmic-400",
    ringColor:     "ring-cosmic-400/30",
    gradientFrom:  "from-cosmic-600",
    gradientTo:    "to-nebula-500",
    price:         { monthly: 1799, yearly: 14392, yearlyMonthly: 1199 },
    paddlePriceId: {
      monthly: "pri_01kkqesvgv55mjs4t384jzjthv",
      yearly:  "pri_01kkqetr63jw5m1jszjqh8nvjy",
    },
    monthlyTokens: 5_000_000,
    maxCharts:     10,
    features:      ["chat", "multi_charts", "horoscope", "calendar", "notifications", "priority_ai"],
    featureLabels: {
      chat:         "Безлимитный AI-чат",
      charts_limit: "До 10 натальных карт",
      multi_charts: "Карты близких",
      horoscope:    "Ежедневный личный гороскоп",
      calendar:     "Полный астро-календарь",
      notifications:"Email-уведомления",
      priority_ai:  "Приоритетный AI (Claude Sonnet)",
    },
    highlight:     false,
    tagline:       "Безграничное познание",
  },
};

// ── Ordered tiers for UI display ─────────────────────────────────────────────
export const PLAN_ORDER: SubscriptionTier[] = ["free", "moonlight", "solar", "cosmic"];

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Can this tier access a specific feature? */
export function canAccess(tier: SubscriptionTier | null | undefined, feature: Feature): boolean {
  if (!tier) return false;
  return PLANS[tier].features.includes(feature);
}

/** Format USD cents as human-readable price string */
export function formatPrice(cents: number): string {
  if (cents === 0) return "0";
  const dollars = cents / 100;
  return dollars % 1 === 0 ? String(dollars) : dollars.toFixed(2);
}

/** Monthly token limit for a tier (-1 = unlimited) */
export function getMonthlyTokens(tier: SubscriptionTier): number {
  return PLANS[tier].monthlyTokens;
}

/**
 * Token usage level — never exposes raw token counts to UI.
 * Returns a semantic level the UI can act on.
 */
export type UsageLevel = "ok" | "warning" | "critical";

export function getUsageLevel(
  tier: SubscriptionTier,
  tokensLeft: number,
): { level: UsageLevel; ratio: number } {
  const limit = PLANS[tier].monthlyTokens;
  if (limit === -1) return { level: "ok", ratio: 1 };    // unlimited
  if (tokensLeft <= 0) return { level: "critical", ratio: 0 };
  const ratio = tokensLeft / limit;
  if (ratio <= 0.01) return { level: "warning", ratio };
  return { level: "ok", ratio };
}

/**
 * Find the cheapest plan that includes a feature (for upgrade nudges).
 */
export function cheapestPlanFor(feature: Feature): SubscriptionTier {
  for (const id of PLAN_ORDER) {
    if (PLANS[id].features.includes(feature)) return id;
  }
  return "cosmic";
}

/** Paddle price ID for a tier + billing interval. Returns empty string for free. */
export function getPaddlePriceId(
  tier: SubscriptionTier,
  interval: "monthly" | "yearly",
): string {
  return PLANS[tier].paddlePriceId[interval];
}

/** Resolve subscription tier from a Paddle price ID. Returns null if not found. */
export function tierFromPriceId(priceId: string): SubscriptionTier | null {
  for (const id of PLAN_ORDER) {
    const p = PLANS[id].paddlePriceId;
    if (p.monthly === priceId || p.yearly === priceId) return id;
  }
  return null;
}

/** Max number of natal charts for a tier (-1 = unlimited, treated as 10 for Cosmic) */
export function getMaxCharts(tier: SubscriptionTier): number {
  return PLANS[tier].maxCharts;
}

/**
 * The next tier above the current one (for upgrade nudges).
 */
export function nextTier(current: SubscriptionTier): SubscriptionTier | null {
  const idx = PLAN_ORDER.indexOf(current);
  return idx < PLAN_ORDER.length - 1 ? PLAN_ORDER[idx + 1] : null;
}
