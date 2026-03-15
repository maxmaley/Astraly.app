"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/navigation";
import { PaywallOverlay } from "@/components/shared/PaywallOverlay";


// ── Types ─────────────────────────────────────────────────────────────────────

interface HoroscopeData {
  overview: string;
  love: string;
  career: string;
  advice: string;
  planets: string[];
}

// ── Skeleton loader ───────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[var(--border)]/60 ${className ?? ""}`}
    />
  );
}

function HoroscopeSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Main card */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-xl border border-[var(--border)] p-4 space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-7 w-36 rounded-full" />
          <Skeleton className="h-7 w-40 rounded-full" />
          <Skeleton className="h-7 w-32 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

function Section({
  icon,
  label,
  text,
  accent,
}: {
  icon: string;
  label: string;
  text: string;
  accent?: string;
}) {
  return (
    <div className={`rounded-xl border border-[var(--border)] p-4 space-y-2 ${accent ?? ""}`}>
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
        <span>{icon}</span>
        {label}
      </p>
      <p className="text-sm leading-relaxed text-[var(--foreground)]">{text}</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function HoroscopePage() {
  const t = useTranslations("horoscope");
  const locale = useLocale();

  const [horoscope, setHoroscope] = useState<HoroscopeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<"no_chart" | "failed" | "tier_required" | null>(null);

  // ── Client-side session cache ──────────────────────────────────────────────
  // Prevents re-fetching on every navigation within the same browser session.
  // The API has its own DB cache (one generation per user per day), but
  // every mount still triggered a network round-trip + skeleton flash.

  const SESSION_KEY = `astraly:horoscope:${new Date().toLocaleDateString("en-CA")}`;

  function readCache(): HoroscopeData | null {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as HoroscopeData) : null;
    } catch { return null; }
  }

  function writeCache(data: HoroscopeData) {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(data)); } catch { /* ignore */ }
  }

  async function fetchHoroscope() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/horoscope?locale=${locale}`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        if (json.error === "no_chart")      { setError("no_chart");      return; }
        if (json.error === "tier_required") { setError("tier_required"); return; }
        setError("failed");
        return;
      }
      const { horoscope: raw } = await res.json();
      const parsed = JSON.parse(raw) as HoroscopeData;
      writeCache(parsed);
      setHoroscope(parsed);
    } catch {
      setError("failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setHoroscope(cached);
      setLoading(false);
      return;
    }
    fetchHoroscope();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Today's date display ───────────────────────────────────────────────────
  const todayLabel = new Date().toLocaleDateString(
    locale === "en" ? "en-US" : locale === "uk" ? "uk-UA" : "ru-RU",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" },
  );

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
        <HoroscopeSkeleton />
        <p className="mt-4 text-center text-xs text-[var(--muted-foreground)] animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  // ── Tier gate ─────────────────────────────────────────────────────────────
  if (error === "tier_required") {
    return <PaywallOverlay feature="horoscope" />;
  }

  // ── No chart ───────────────────────────────────────────────────────────────
  if (error === "no_chart") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 flex flex-col items-center gap-4 text-center">
        <div className="text-5xl">✦</div>
        <p className="text-[var(--foreground)] text-lg font-medium">{t("noChart")}</p>
        <Link
          href="/app/chart"
          className="inline-flex items-center gap-2 rounded-xl bg-cosmic-500 hover:bg-cosmic-600 px-5 py-2.5 text-sm font-medium text-white transition-colors"
        >
          {t("noChartCta")}
        </Link>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error === "failed" || !horoscope) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 flex flex-col items-center gap-4 text-center">
        <p className="text-[var(--muted-foreground)]">{t("error")}</p>
        <button
          onClick={fetchHoroscope}
          className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--accent)] transition-colors"
        >
          {t("retry")}
        </button>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">

      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
          <span className="text-cosmic-400">✦</span>
          {t("title")}
        </h1>
        <p className="mt-1 text-sm capitalize text-[var(--muted-foreground)]">
          {todayLabel}
        </p>
      </div>

      {/* ── Main card ── */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">

        {/* Overview — full-width accent */}
        <div className="relative px-6 py-6 border-b border-[var(--border)]">
          {/* Subtle gradient glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 0%, #a78bfa, transparent)",
            }}
          />
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-cosmic-400 mb-3">
            <span>✦</span>
            {t("overview")}
          </p>
          <p className="text-base leading-relaxed text-[var(--foreground)]">
            {horoscope.overview}
          </p>
        </div>

        {/* Love + Career grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)] border-b border-[var(--border)]">
          <Section icon="♀" label={t("love")} text={horoscope.love} />
          <Section icon="☿" label={t("career")} text={horoscope.career} />
        </div>

        {/* Advice */}
        <div className="px-6 py-5 border-b border-[var(--border)] flex items-start gap-3">
          <span className="mt-0.5 text-amber-400 text-lg shrink-0">★</span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)] mb-1">
              {t("advice")}
            </p>
            <p className="text-sm italic leading-relaxed text-[var(--foreground)]">
              {horoscope.advice}
            </p>
          </div>
        </div>

        {/* Planet transit pills */}
        {horoscope.planets?.length > 0 && (
          <div className="px-6 py-4 border-b border-[var(--border)]">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)] mb-3">
              {t("keyTransits")}
            </p>
            <div className="flex flex-wrap gap-2">
              {horoscope.planets.map((pill, i) => (
                <span
                  key={i}
                  className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs text-[var(--foreground)]"
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Discuss CTA */}
        <div className="px-6 py-5">
          <Link
            href="/app/chat?horoscope=1"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cosmic-500 hover:bg-cosmic-600 active:bg-cosmic-700 px-5 py-3 text-sm font-medium text-white transition-colors"
          >
            ☽ {t("discuss")}
          </Link>
        </div>
      </div>
    </div>
  );
}
