"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Link } from "@/navigation";
import { CityAutocomplete } from "@/components/shared/CityAutocomplete";

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
  ascendant: { sign: string; degree: number; mc_sign?: string; mc_degree?: number };
}

interface BirthForm {
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

const inputCls = "w-full rounded-xl border border-[var(--border)] bg-[var(--input)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)]/60 outline-none transition-colors focus:border-cosmic-400 focus:ring-2 focus:ring-cosmic-400/15";

// ── Sub-components ────────────────────────────────────────────────────────────

function Spinner({ small }: { small?: boolean }) {
  return (
    <svg className={`animate-spin ${small ? "h-4 w-4" : "h-6 w-6"}`} viewBox="0 0 24 24" fill="none">
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
  const locale = useLocale();

  type PageState = "loading" | "form" | "building" | "error" | "chart";
  const [state, setState] = useState<PageState>("loading");
  const [chart, setChart] = useState<ChartRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Birth form state
  const [form, setForm] = useState<BirthForm>({
    name: "", birthDate: "", birthTime: "", birthCity: "",
  });

  // ── Build chart ─────────────────────────────────────────────────────────────
  const buildChart = useCallback(async (data: BirthForm) => {
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
      const json = await res.json().catch(() => ({})) as { error?: string };
      console.error("[chart] POST failed", res.status, json);
      const serverMsg = json.error ?? "";
      const msg = serverMsg.includes("City not found")
        ? t("cityError")
        : serverMsg || `${t("errorGeneric")} (${res.status})`;
      setError(msg);
      setState("form");
      return;
    }

    const json = await res.json() as { chart: ChartRecord };
    localStorage.removeItem("astraly_birth_data");
    setChart(json.chart);
    setState("chart");
  }, [t]);

  // ── Load on mount ───────────────────────────────────────────────────────────
  const loadChart = useCallback(async () => {
    setState("loading");
    const res = await fetch("/api/natal-chart");
    if (!res.ok) {
      const json = await res.json().catch(() => ({})) as { error?: string };
      console.error("[chart] GET failed", res.status, json);
      setError(`${res.status}: ${json.error ?? "unknown"}`);
      setState("error");
      return;
    }

    const json = await res.json() as { charts: ChartRecord[] };
    if (json.charts?.length) {
      setChart(json.charts[0]);
      setState("chart");
      return;
    }

    // No chart in DB — check localStorage for pre-filled birth data
    const stored = localStorage.getItem("astraly_birth_data");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as BirthForm & { birthDate?: string };
        const unified: BirthForm = {
          name: parsed.name ?? "",
          birthDate: parsed.birthDate ?? "",
          birthTime: parsed.birthTime ?? "",
          birthCity: parsed.birthCity ?? "",
          lat: parsed.lat,
          lng: parsed.lng,
        };
        // Auto-build if all required fields present
        if (unified.name && unified.birthDate && unified.birthCity) {
          await buildChart(unified);
          return;
        }
        setForm(unified);
      } catch { /* ignore bad localStorage */ }
    }

    setState("form");
  }, [buildChart]);

  useEffect(() => { loadChart(); }, [loadChart]);

  // ── Form submit ─────────────────────────────────────────────────────────────
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.birthDate || !form.birthCity.trim()) return;
    buildChart(form);
  }

  // ── Edit existing chart ──────────────────────────────────────────────────────
  function openEditForm() {
    if (!chart) return;
    setForm({
      name: chart.name,
      birthDate: chart.birth_date,
      birthTime: chart.birth_time ?? "",
      birthCity: chart.birth_city,
    });
    setError(null);
    setState("form");
  }

  // ── Render: loading ─────────────────────────────────────────────────────────
  if (state === "loading") {
    return (
      <div className="flex flex-1 min-h-0 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // ── Render: building ────────────────────────────────────────────────────────
  if (state === "building") {
    return (
      <div className="flex flex-1 min-h-0 flex-col items-center justify-center gap-4">
        <Spinner />
        <p className="text-sm text-[var(--muted-foreground)] animate-pulse">{t("buildingChart")}</p>
      </div>
    );
  }

  // ── Render: API error ───────────────────────────────────────────────────────
  if (state === "error") {
    return (
      <div className="flex flex-1 min-h-0 flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-[var(--muted-foreground)] text-sm">{error}</p>
        <button onClick={loadChart} className="text-sm text-cosmic-400 hover:text-cosmic-300">
          ↺ {t("retry")}
        </button>
      </div>
    );
  }

  // ── Render: birth data form ─────────────────────────────────────────────────
  if (state === "form") {
    return (
      <div className="flex flex-1 min-h-0 overflow-y-auto flex-col items-center justify-center px-4 py-12">
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cosmic-500/8 blur-[100px]" />
        </div>

        <div className="relative z-10 w-full max-w-sm">
          <div aria-hidden="true" className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-b from-cosmic-500/25 to-transparent blur-xl" />

          <form
            onSubmit={handleSubmit}
            className="relative rounded-2xl border border-[var(--border)] bg-[var(--card)]/90 p-6 shadow-[0_4px_40px_rgba(139,92,246,0.10)] backdrop-blur-xl"
          >
            <div className="mb-5 text-center">
              <p className="mb-1 text-2xl">✨</p>
              <h1 className="font-display text-xl font-semibold text-[var(--foreground)]">
                {t("onboardTitle")}
              </h1>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {t("onboardSubtitle")}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {/* Name */}
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder={t("fieldName")}
                required
                className={inputCls}
              />

              {/* Date + Time */}
              <div className="grid grid-cols-[3fr_2fr] gap-2">
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))}
                  max={new Date().toISOString().split("T")[0]}
                  required
                  className={inputCls}
                />
                <input
                  type="time"
                  value={form.birthTime}
                  onChange={e => setForm(f => ({ ...f, birthTime: e.target.value }))}
                  className={inputCls}
                />
              </div>

              {/* City */}
              <CityAutocomplete
                value={form.birthCity}
                onChange={(city, geo) => setForm(f => ({
                  ...f, birthCity: city, lat: geo?.lat, lng: geo?.lng,
                }))}
                placeholder={t("fieldCity")}
              />

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={!form.name.trim() || !form.birthDate || !form.birthCity.trim()}
                className="group relative mt-1 w-full overflow-hidden rounded-xl bg-gradient-to-r from-cosmic-500 via-nebula-500 to-cosmic-400 py-3 text-sm font-semibold text-white shadow-glow transition-all hover:scale-[1.02] hover:shadow-cosmic disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="relative">{t("buildButton")} ✦</span>
              </button>

              {/* Cancel edit — only if an existing chart is available */}
              {chart && (
                <button
                  type="button"
                  onClick={() => setState("chart")}
                  className="w-full text-center text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors py-1"
                >
                  ← {t("cancelEdit")}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ── Render: chart ───────────────────────────────────────────────────────────
  if (!chart) return null;

  const asc = chart.ascendant;
  const planets = chart.planets_json;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 py-8 md:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl space-y-6 pb-8">

        {/* ── ASC + MC header ──────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--card)] via-[var(--card)]/90 to-cosmic-500/5 p-6 shadow-[0_4px_30px_rgba(139,92,246,0.08)]">
          <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-cosmic-500/10 blur-[60px]" />

          <div className="relative">
            <div className="flex flex-wrap gap-8">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                  {t("ascendant")}
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl text-cosmic-400" aria-hidden="true">
                    {SIGN_SYMBOLS[asc.sign] ?? "✦"}
                  </span>
                  <h1 className="font-display text-xl font-bold text-[var(--foreground)]">
                    {tS(asc.sign as Parameters<typeof tS>[0])} {formatDeg(asc.degree)}
                  </h1>
                </div>
              </div>
              {asc.mc_sign && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">MC</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-3xl text-nebula-400" aria-hidden="true">
                      {SIGN_SYMBOLS[asc.mc_sign] ?? "✦"}
                    </span>
                    <p className="font-display text-xl font-bold text-[var(--foreground)]">
                      {tS(asc.mc_sign as Parameters<typeof tS>[0])} {formatDeg(asc.mc_degree ?? 0)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Sun · Moon pills */}
            <div className="mt-4 flex flex-wrap gap-3">
              {(["Sun", "Moon"] as const).map((key) => {
                const p = planets[key];
                if (!p) return null;
                return (
                  <div key={key} className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--muted)]/50 px-3 py-1">
                    <span className="text-sm text-[var(--muted-foreground)]" aria-hidden="true">{PLANET_SYMBOLS[key]}</span>
                    <span className="text-sm font-medium text-[var(--foreground)]">{tP(key as Parameters<typeof tP>[0])}</span>
                    <span className="text-sm text-[var(--muted-foreground)]">{SIGN_SYMBOLS[p.sign]} {tS(p.sign as Parameters<typeof tS>[0])}</span>
                  </div>
                );
              })}
              {/* Birth info + edit button */}
              <div className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--muted)]/50 px-3 py-1">
                <span className="text-xs text-[var(--muted-foreground)]">
                  {formatDate(chart.birth_date)}
                  {chart.birth_time && ` · ${chart.birth_time}`}
                  {" · "}{chart.birth_city}
                </span>
                <button
                  onClick={openEditForm}
                  title={t("editBirthData")}
                  className="ml-0.5 text-[var(--muted-foreground)] hover:text-cosmic-400 transition-colors"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Planet table ──────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-x-2 border-b border-[var(--border)] px-4 py-2.5">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">{t("planetName")}</span>
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">{t("signName")}</span>
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">{t("house")}</span>
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)] text-right">°</span>
          </div>

          {PLANET_ORDER.map((name, i) => {
            const p = planets[name];
            if (!p) return null;
            return (
              <div key={name} className={`grid grid-cols-[2fr_2fr_1fr_1fr] gap-x-2 items-center px-4 py-3 ${i % 2 === 1 ? "bg-[var(--muted)]/20" : ""}`}>
                <div className="flex items-center gap-2">
                  <span className="w-5 text-center text-base text-[var(--muted-foreground)]" aria-hidden="true">{PLANET_SYMBOLS[name]}</span>
                  <span className="text-sm font-medium text-[var(--foreground)]">{tP(name as Parameters<typeof tP>[0])}</span>
                  {p.retrograde && <span className="text-xs text-amber-400 font-semibold" title="Retrograde">℞</span>}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-cosmic-400" aria-hidden="true">{SIGN_SYMBOLS[p.sign]}</span>
                  <span className="text-sm text-[var(--foreground)]">{tS(p.sign as Parameters<typeof tS>[0])}</span>
                </div>
                <span className="text-sm text-[var(--muted-foreground)]">{p.house}</span>
                <span className="text-right text-xs text-[var(--muted-foreground)] tabular-nums">{formatDeg(p.degree)}</span>
              </div>
            );
          })}
        </div>

        {/* ── CTA → Chat ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          {/* Explain chart */}
          <Link
            href="/app/chat?explain=1"
            locale={locale}
            className="group flex flex-col justify-between rounded-2xl border border-cosmic-500/40 bg-gradient-to-br from-cosmic-500/15 to-nebula-500/10 px-4 py-4 transition-all hover:border-cosmic-400/60 hover:from-cosmic-500/20 hover:to-nebula-500/15 active:scale-[0.98]"
          >
            <span className="mb-3 text-2xl">✦</span>
            <div>
              <p className="text-sm font-semibold leading-tight text-[var(--foreground)]">{t("explainChart")}</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{t("explainChartSubtitle")}</p>
            </div>
          </Link>

          {/* Ask astrologer */}
          <Link
            href="/app/chat"
            locale={locale}
            className="group flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-4 transition-all hover:border-cosmic-400/40 hover:bg-[var(--muted)] active:scale-[0.98]"
          >
            <span className="mb-3 text-2xl">💬</span>
            <div>
              <p className="text-sm font-semibold leading-tight text-[var(--foreground)]">{t("askAstrologer")}</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{t("askAstrologerSubtitle")}</p>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}
