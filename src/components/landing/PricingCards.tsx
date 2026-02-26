"use client";

import { useState } from "react";
import Link         from "next/link";
import { formatPrice } from "@/lib/plans";

export interface PlanCardData {
  id:            string;
  icon:          string;
  name:          string;
  tagline:       string;
  color:         string;
  highlight:     boolean;
  gradientFrom:  string;
  gradientTo:    string;
  isFree:        boolean;
  trialDays:     number;
  monthlyPrice:  number;        // cents
  yearlyMonthly: number;        // cents — yearly ÷ 12
  yearlyTotal:   number;        // cents — billed amount
  features:      { text: string; included: boolean }[];
  ctaLabel:      string;
  ctaHref:       string;
}

export interface PricingLabels {
  monthly:      string;
  yearly:       string;
  yearlyBadge:  string;
  perMonth:     string;
  billedYearly: string;
  free:         string;
  popular:      string;
  trial:        string;
}

export function PricingCards({
  plans,
  labels,
}: {
  plans:  PlanCardData[];
  labels: PricingLabels;
}) {
  const [yearly, setYearly] = useState(false);

  return (
    <>
      {/* Toggle */}
      <div className="mb-10 flex justify-center">
        <div className="inline-flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--card)] p-0.5">
          <button
            onClick={() => setYearly(false)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
              !yearly
                ? "bg-cosmic-500 text-white shadow-sm"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {labels.monthly}
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
              yearly
                ? "bg-cosmic-500 text-white shadow-sm"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {labels.yearly}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                yearly
                  ? "bg-white/20 text-white"
                  : "bg-emerald-500/15 text-emerald-400"
              }`}
            >
              {labels.yearlyBadge}
            </span>
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const isPopular = plan.highlight;

          const priceDisplay = plan.isFree ? null : yearly
            ? {
                main:   formatPrice(plan.yearlyMonthly),
                suffix: `${labels.perMonth} · $${formatPrice(plan.yearlyTotal)} ${labels.billedYearly}`,
              }
            : {
                main:   formatPrice(plan.monthlyPrice),
                suffix: labels.perMonth,
              };

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl transition-transform duration-300 hover:-translate-y-1 ${
                isPopular
                  ? "border-2 border-cosmic-500 bg-gradient-to-b from-cosmic-500/15 to-[var(--card)] shadow-cosmic"
                  : "border border-[var(--border)] bg-[var(--card)] hover:border-cosmic-500/40"
              }`}
            >
              {/* Popular banner */}
              {isPopular ? (
                <div className="-mx-px -mt-px mb-0 flex items-center justify-center gap-1.5 rounded-t-2xl bg-gradient-to-r from-cosmic-500 to-nebula-500 py-2 text-xs font-bold text-white">
                  ✦ {labels.popular}
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
                    <p className="text-xs text-[var(--muted-foreground)]">{plan.tagline}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {priceDisplay ? (
                    <div className="flex items-baseline gap-1 flex-wrap">
                      <span className="text-lg font-medium text-[var(--muted-foreground)]">$</span>
                      <span className="font-display text-4xl font-bold text-[var(--foreground)]">
                        {priceDisplay.main}
                      </span>
                      <span className="text-sm text-[var(--muted-foreground)]">
                        {priceDisplay.suffix}
                      </span>
                    </div>
                  ) : (
                    <span className="font-display text-4xl font-bold text-[var(--foreground)]">
                      {labels.free}
                    </span>
                  )}
                  {!plan.isFree && plan.trialDays > 0 && (
                    <p className="mt-1 text-xs text-cosmic-400">{labels.trial}</p>
                  )}
                </div>

                {/* Feature list */}
                <ul className="mb-8 flex flex-grow flex-col gap-2.5">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <span
                        className={`mt-0.5 shrink-0 ${
                          feat.included ? "text-emerald-400" : "text-[var(--border)]"
                        }`}
                      >
                        {feat.included ? "✓" : "✗"}
                      </span>
                      <span
                        className={
                          feat.included
                            ? "text-[var(--foreground)]"
                            : "text-[var(--muted-foreground)] line-through decoration-[var(--border)]"
                        }
                      >
                        {feat.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={plan.ctaHref}
                  className={`block rounded-xl py-3 text-center text-sm font-semibold transition-all ${
                    isPopular
                      ? "bg-gradient-to-r from-cosmic-500 to-nebula-500 text-white shadow-glow hover:shadow-cosmic hover:scale-[1.02]"
                      : plan.isFree
                        ? "border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]"
                        : "border border-cosmic-500/50 text-cosmic-600 dark:text-cosmic-300 hover:bg-cosmic-500/10"
                  }`}
                >
                  {plan.ctaLabel}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
