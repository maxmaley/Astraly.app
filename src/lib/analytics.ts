import { track } from "@vercel/analytics";
import type { SubscriptionTier } from "@/types/database";

// ── Test-user guard ──────────────────────────────────────────────────────────
// Set once on app load; when true every trackEvent call is silently skipped.

let _isTestUser = false;

export function setIsTestUser(value: boolean) {
  _isTestUser = value;
}

// ── Event definitions ────────────────────────────────────────────────────────

type AnalyticsEvents = {
  // Activation
  chart_created:          { relation?: string };
  // Engagement
  chat_message_sent:      { tier: SubscriptionTier; has_chart: boolean };
  voice_input_used:       Record<string, never>;
  horoscope_generated:    { tier: SubscriptionTier };
  // Revenue funnel
  pricing_viewed:         { current_tier: SubscriptionTier };
  checkout_opened:        { plan: string };
  subscription_activated: { plan: string };
  // Limits & upsell
  token_limit_reached:    { tier: SubscriptionTier };
  paywall_hit:            { feature: string; tier: SubscriptionTier };
  // Settings
  theme_changed:          { theme: string };
  language_changed:       { lang: string };
  memory_toggled:         { enabled: boolean };
};

// ── Typed track wrapper ──────────────────────────────────────────────────────

export function trackEvent<K extends keyof AnalyticsEvents>(
  event: K,
  props: AnalyticsEvents[K],
) {
  if (_isTestUser) return;
  track(event, props as Record<string, string | number | boolean>);
}
