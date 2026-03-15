"use client";

import { useRouter } from "@/navigation";
import { useLocale } from "next-intl";
import { PLANS, PLAN_ORDER, getUsageLevel } from "@/lib/plans";
import type { SubscriptionTier } from "@/types/database";

// ── Copy ─────────────────────────────────────────────────────────────────────

const COPY = {
  title:      { ru: "Сообщения на исходе",         uk: "Повідомлення закінчуються",        en: "Messages running low",          pl: "Wiadomości się kończą"          },
  titleZero:  { ru: "Лимит исчерпан",              uk: "Ліміт вичерпано",                  en: "Limit reached",                 pl: "Limit wyczerpany"               },
  resetOn:    { ru: "Обновление",                  uk: "Оновлення",                         en: "Resets",                        pl: "Odnowienie"                     },
  upgrade:    { ru: "Открой больше с",             uk: "Відкрий більше з",                  en: "Unlock more with",              pl: "Odblokuj więcej z"              },

  viewAll:    { ru: "Все планы →",                 uk: "Всі плани →",                       en: "All plans →",                   pl: "Wszystkie plany →"              },
  close:      { ru: "Закрыть",                     uk: "Закрити",                           en: "Close",                         pl: "Zamknij"                        },
  waitReset:  { ru: "Подожду обновления",          uk: "Почекаю оновлення",                 en: "Wait for reset",                pl: "Poczekam na odnowienie"         },
  unlimited:  { ru: "Безлимитно",                  uk: "Безлімітно",                        en: "Unlimited",                     pl: "Bez limitu"                     },
  xMore:      { ru: "× больше сообщений",          uk: "× більше повідомлень",              en: "× more messages",               pl: "× więcej wiadomości"            },
  perMonth:   { ru: "/мес",                        uk: "/міс",                              en: "/mo",                           pl: "/mies."                         },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatResetDate(resetAt: string | null | undefined, locale: string): string {
  if (!resetAt) return "";
  return new Date(resetAt).toLocaleDateString(
    locale === "en" ? "en-US" : locale === "uk" ? "uk-UA" : locale === "pl" ? "pl-PL" : "ru-RU",
    { day: "numeric", month: "long" },
  );
}

function formatPrice(cents: number, l: string): string {
  const dollars = (cents / 100).toFixed(2).replace(/\.00$/, "");
  return `$${dollars}${COPY.perMonth[l as keyof typeof COPY.perMonth] ?? "/мес"}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface LimitModalProps {
  tier:         SubscriptionTier;
  tokensLeft:   number;
  tokensResetAt?: string | null;
  onClose:      () => void;
}

export function LimitModal({ tier, tokensLeft, tokensResetAt, onClose }: LimitModalProps) {
  const locale = useLocale() as string;
  const l      = ["ru", "uk", "en", "pl"].includes(locale) ? locale : "ru";
  const router = useRouter();

  const plan      = PLANS[tier];
  const { ratio } = getUsageLevel(tier, tokensLeft);
  const isZero    = tokensLeft <= 0;
  const resetDate = formatResetDate(tokensResetAt, l);

  // Suggest the next 1-2 tiers above current
  const currentIdx = PLAN_ORDER.indexOf(tier);
  const suggestedTiers = PLAN_ORDER.slice(currentIdx + 1, currentIdx + 3);

  function goToPricing() {
    onClose();
    router.push("/app/pricing");
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-cosmic overflow-hidden">

        {/* Header — gradient top strip */}
        <div className="relative px-6 pt-8 pb-6 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, #a78bfa, transparent)" }}
          />

          {/* Icon */}
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cosmic-500/20 to-nebula-500/20 border border-cosmic-400/30 text-2xl">
            {isZero ? "🌑" : "🌘"}
          </div>

          <h2 className="text-lg font-bold text-[var(--foreground)]">
            {isZero
              ? (COPY.titleZero[l as keyof typeof COPY.titleZero] ?? COPY.titleZero.ru)
              : (COPY.title[l as keyof typeof COPY.title] ?? COPY.title.ru)}
          </h2>

          {resetDate && (
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {COPY.resetOn[l as keyof typeof COPY.resetOn] ?? COPY.resetOn.ru}: {resetDate}
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div className="px-6 pb-5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
            <div
              className={[
                "h-full rounded-full transition-all",
                isZero
                  ? "bg-rose-500"
                  : "bg-gradient-to-r from-amber-400 to-amber-500",
              ].join(" ")}
              style={{ width: `${Math.max(2, ratio * 100)}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-[var(--muted-foreground)]">
            <span>{plan.name}</span>
            <span className={isZero ? "text-rose-400" : "text-amber-400"}>
              {isZero ? "0%" : `${Math.round(ratio * 100)}%`}
            </span>
          </div>
        </div>

        {/* Upgrade options */}
        {suggestedTiers.length > 0 && (
          <div className="border-t border-[var(--border)] px-4 py-4 space-y-2">
            <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)] mb-3">
              {COPY.upgrade[l as keyof typeof COPY.upgrade] ?? COPY.upgrade.ru}
            </p>

            {suggestedTiers.map((id) => {
              const p          = PLANS[id];
              const isUnlimited = p.monthlyTokens === -1;
              const multiplier = isUnlimited
                ? "∞"
                : plan.monthlyTokens > 0
                  ? Math.round(p.monthlyTokens / plan.monthlyTokens) + "×"
                  : "";

              return (
                <button
                  key={id}
                  onClick={goToPricing}
                  className="w-full flex items-center justify-between rounded-xl border border-[var(--border)] px-4 py-3 hover:border-cosmic-400/40 hover:bg-[var(--muted)] transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{p.icon}</span>
                    <div className="text-left">
                      <p className={`text-sm font-semibold ${p.color}`}>{p.name}</p>
                      <p className="text-[11px] text-[var(--muted-foreground)]">
                        {isUnlimited
                          ? (COPY.unlimited[l as keyof typeof COPY.unlimited] ?? COPY.unlimited.ru)
                          : multiplier
                            ? `${multiplier} ${COPY.xMore[l as keyof typeof COPY.xMore] ?? COPY.xMore.ru}`
                            : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {p.price.monthly > 0 && (
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        {formatPrice(p.price.monthly, l)}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Footer actions */}
        <div className="border-t border-[var(--border)] flex divide-x divide-[var(--border)]">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            {isZero
              ? (COPY.waitReset[l as keyof typeof COPY.waitReset] ?? COPY.waitReset.ru)
              : (COPY.close[l as keyof typeof COPY.close] ?? COPY.close.ru)}
          </button>
          <button
            onClick={goToPricing}
            className="flex-1 py-3.5 text-xs font-semibold text-cosmic-400 hover:text-cosmic-300 hover:bg-[var(--muted)] transition-colors"
          >
            {COPY.viewAll[l as keyof typeof COPY.viewAll] ?? COPY.viewAll.ru}
          </button>
        </div>
      </div>
    </div>
  );
}
