"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Link } from "@/navigation";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PlanetData {
  sign: string;
  degree: number;
  house: number;
  retrograde: boolean;
}

interface ChartRecord {
  id: string;
  name: string;
  birth_date: string;
  birth_time: string | null;
  birth_city: string;
  planets_json: Record<string, PlanetData>;
  houses_json: Array<{ house: number; sign: string; degree: number }>;
  ascendant: { sign: string; degree: number };
}

interface StoredBirthData {
  name: string;
  birthDate: string;
  birthTime: string;
  birthCity: string;
  lat?: number;
  lng?: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SIGN_SYMBOLS: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀",
  Mars: "♂", Jupiter: "♃", Saturn: "♄", Uranus: "⛢",
  Neptune: "♆", Pluto: "♇",
};

const PLANET_ORDER = [
  "Sun", "Moon", "Mercury", "Venus", "Mars",
  "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
];

function formatDeg(deg: number): string {
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  return `${d}°${m.toString().padStart(2, "0")}′`;
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Spinner({ small }: { small?: boolean }) {
  return (
    <svg
      className={`animate-spin ${small ? "h-4 w-4" : "h-6 w-6"}`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ChartPage() {
  const t = useTranslations("chart");
  const tS = useTranslations("signs");
  const tP = useTranslations("planets");
  const tC = useTranslations("chart");
  const locale = useLocale();

  type PageState = "loading" | "no_data" | "ready_to_build" | "building" | "error" | "chart";
  const [state, setState] = useState<PageState>("loading");
  const [chart, setChart] = useState<ChartRecord | null>(null);
  const [birthData, setBirthData] = useState<StoredBirthData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Build chart (called automatically or on button click) ─────────────────
  const buildChart = useCallback(async (data: StoredBirthData) => {
    setState("building");
    setError(null);

    const res = await fetch("/api/natal-chart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        relation: "self",
        birth_date: data.birthDate,
        birth_time: data.birthTime || "",
        birth_city: data.birthCity,
        lat: data.lat,
        lng: data.lng,
      }),
    });

    if (!res.ok) {
      const json = await res.json() as { error?: string };
      const msg = json.error?.includes("City not found")
        ? t("cityError")
        : t("errorGeneric");
      setError(msg);
      setState("ready_to_build");
      return;
    }

    const json = await res.json() as { chart: ChartRecord };
    localStorage.removeItem("astraly_birth_data");
    setChart(json.chart);
    setState("chart");
  }, [t]);

  // ── Fetch existing chart on mount ──────────────────────────────────────────
  const loadChart = useCallback(async () => {
    setState("loading");
    const res = await fetch("/api/natal-chart");
    if (!res.ok) { setState("no_data"); return; }
    const json = await res.json() as { charts: ChartRecord[] };
    if (json.charts?.length) {
      setChart(json.charts[0]);
      setState("chart");
    } else {
      // No chart in DB — check localStorage for birth data from registration
      const stored = localStorage.getItem("astraly_birth_data");
      if (stored) {
        const parsed = JSON.parse(stored) as StoredBirthData;
        setBirthData(parsed);
        // Auto-build immediately instead of waiting for button click
        buildChart(parsed);
      } else {
        setState("no_data");
      }
    }
  }, [buildChart]);

  useEffect(() => { loadChart(); }, [loadChart]);


  // ── Render helpers ─────────────────────────────────────────────────────────

  if (state === "loading") {
    return (
      <div className="flex h-full min-h-[calc(100vh-4rem)] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (state === "no_data") {
    return (
      <div className="flex h-full min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-4xl">🌌</p>
        <h1 className="font-display text-xl font-semibold text-[var(--foreground)]">
          {t("noChartTitle")}
        </h1>
        <p className="max-w-xs text-sm text-[var(--muted-foreground)]">
          {t("noChartSubtitle")}
        </p>
        <Link
          href="/"
          locale={locale}
          className="mt-2 text-sm font-medium text-cosmic-400 hover:text-cosmic-300 transition-colors"
        >
          {t("goHome")}
        </Link>
      </div>
    );
  }

  if (state === "ready_to_build" && birthData) {
    return (
      <div className="flex h-full min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12">
        {/* Background glow */}
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cosmic-500/8 blur-[100px]" />
        </div>

        <div className="relative z-10 w-full max-w-sm">
          <div className="relative">
            <div aria-hidden="true" className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-b from-cosmic-500/25 to-transparent blur-xl" />
            <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--card)]/90 p-6 shadow-[0_4px_40px_rgba(139,92,246,0.10)] backdrop-blur-xl">
              {/* Header */}
              <div className="mb-4 text-center">
                <p className="mb-1 text-2xl">✨</p>
                <h1 className="font-display text-xl font-semibold text-[var(--foreground)]">
                  {t("onboardTitle")}
                </h1>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {t("onboardSubtitle")}
                </p>
              </div>

              {/* Birth data summary */}
              <div className="mb-5 rounded-xl border border-cosmic-500/20 bg-cosmic-500/5 px-4 py-3">
                <p className="text-sm font-semibold text-[var(--foreground)]">{birthData.name}</p>
                <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                  {formatDate(birthData.birthDate)}
                  {birthData.birthTime && ` · ${birthData.birthTime}`}
                  {" · "}
                  {birthData.birthCity}
                </p>
              </div>

              {error && (
                <p className="mb-3 text-sm text-red-400">{error}</p>
              )}

              <button
                onClick={() => birthData && buildChart(birthData)}
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-cosmic-500 via-nebula-500 to-cosmic-400 py-3 text-sm font-semibold text-white shadow-glow transition-all hover:scale-[1.02] hover:shadow-cosmic"
              >
                <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="relative">{t("buildButton")} ✦</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state === "building") {
    return (
      <div className="flex h-full min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
        <Spinner />
        <p className="text-sm text-[var(--muted-foreground)] animate-pulse">
          {t("buildingChart")}
        </p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex h-full min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
        <p className="text-[var(--muted-foreground)]">{tC("errorGeneric")}</p>
        <button
          onClick={loadChart}
          className="text-sm text-cosmic-400 hover:text-cosmic-300"
        >
          ↺ Retry
        </button>
      </div>
    );
  }

  // ── Chart display ──────────────────────────────────────────────────────────
  if (!chart) return null;

  const asc = chart.ascendant;
  const planets = chart.planets_json;

  return (
    <div className="min-h-screen px-4 py-8 md:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl space-y-6">

        {/* ── Ascendant header ──────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--card)] via-[var(--card)]/90 to-cosmic-500/5 p-6 shadow-[0_4px_30px_rgba(139,92,246,0.08)]">
          <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-cosmic-500/10 blur-[60px]" />

          <div className="relative">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
              {t("ascendant")}
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-4xl text-cosmic-400" aria-hidden="true">
                {SIGN_SYMBOLS[asc.sign] ?? "✦"}
              </span>
              <h1 className="font-display text-2xl font-bold text-[var(--foreground)]">
                {tS(asc.sign as Parameters<typeof tS>[0])} {formatDeg(asc.degree)}
              </h1>
            </div>

            {/* Big Three: Sun · Moon · Rising */}
            <div className="mt-4 flex flex-wrap gap-3">
              {(["Sun", "Moon"] as const).map((key) => {
                const p = planets[key];
                if (!p) return null;
                return (
                  <div
                    key={key}
                    className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--muted)]/50 px-3 py-1"
                  >
                    <span className="text-sm text-[var(--muted-foreground)]" aria-hidden="true">
                      {PLANET_SYMBOLS[key]}
                    </span>
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      {tP(key as Parameters<typeof tP>[0])}
                    </span>
                    <span className="text-sm text-[var(--muted-foreground)]">
                      {SIGN_SYMBOLS[p.sign]} {tS(p.sign as Parameters<typeof tS>[0])}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Planet table ──────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-x-2 border-b border-[var(--border)] px-4 py-2.5">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
              {t("planetName")}
            </span>
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
              {t("signName")}
            </span>
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
              {t("house")}
            </span>
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)] text-right">
              °
            </span>
          </div>

          {/* Rows */}
          {PLANET_ORDER.map((name, i) => {
            const p = planets[name];
            if (!p) return null;
            return (
              <div
                key={name}
                className={`grid grid-cols-[2fr_2fr_1fr_1fr] gap-x-2 items-center px-4 py-3 ${i % 2 === 1 ? "bg-[var(--muted)]/20" : ""}`}
              >
                {/* Planet */}
                <div className="flex items-center gap-2">
                  <span className="w-5 text-center text-base text-[var(--muted-foreground)]" aria-hidden="true">
                    {PLANET_SYMBOLS[name]}
                  </span>
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    {tP(name as Parameters<typeof tP>[0])}
                  </span>
                  {p.retrograde && (
                    <span className="text-xs text-amber-400 font-semibold" title="Retrograde">
                      ℞
                    </span>
                  )}
                </div>

                {/* Sign */}
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-cosmic-400" aria-hidden="true">
                    {SIGN_SYMBOLS[p.sign]}
                  </span>
                  <span className="text-sm text-[var(--foreground)]">
                    {tS(p.sign as Parameters<typeof tS>[0])}
                  </span>
                </div>

                {/* House */}
                <span className="text-sm text-[var(--muted-foreground)]">
                  {p.house}
                </span>

                {/* Degree */}
                <span className="text-right text-xs text-[var(--muted-foreground)] tabular-nums">
                  {formatDeg(p.degree)}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── CTA → Chat ────────────────────────────────────────────────────── */}
        <Link
          href="/app/chat"
          locale={locale}
          className="group flex w-full items-center justify-between rounded-2xl border border-cosmic-500/30 bg-gradient-to-r from-cosmic-500/10 to-nebula-500/10 px-5 py-4 transition-all hover:border-cosmic-400/50 hover:from-cosmic-500/15 hover:to-nebula-500/15"
        >
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">
              {t("explainChart")}
            </p>
            <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
              {t("goToChat")}
            </p>
          </div>
          <span className="text-xl text-cosmic-400 transition-transform group-hover:translate-x-1">→</span>
        </Link>

      </div>
    </div>
  );
}
