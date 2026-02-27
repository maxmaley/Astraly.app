"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useRouter } from "@/navigation";

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
  relation: string;
  birth_date: string;
  birth_time: string | null;
  birth_city: string;
  planets_json: Record<string, PlanetData>;
  houses_json: Array<{ house: number; sign: string; degree: number }>;
  ascendant: { sign: string; degree: number; mc_sign?: string; mc_degree?: number };
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

const SPECIAL_POINT_SYMBOLS: Record<string, string> = {
  NorthNode: "☊", SouthNode: "☋", Lilith: "⚸", Chiron: "⚷",
};

const PLANET_ORDER = [
  "Sun", "Moon", "Mercury", "Venus", "Mars",
  "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
];

const SIGN_ORDER = [
  "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
  "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces",
] as const;

const ALL_POINT_KEYS = [
  "Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto",
  "NorthNode","SouthNode","Lilith","Chiron",
];

interface AspectDef { key: string; symbol: string; angle: number; orb: number; color: string }
const ASPECT_DEFS: AspectDef[] = [
  { key: "Conjunction", symbol: "☌", angle: 0,   orb: 8, color: "text-amber-400"   },
  { key: "Opposition",  symbol: "☍", angle: 180, orb: 8, color: "text-red-400"     },
  { key: "Trine",       symbol: "△", angle: 120, orb: 8, color: "text-emerald-400" },
  { key: "Square",      symbol: "□", angle: 90,  orb: 7, color: "text-red-400"     },
  { key: "Sextile",     symbol: "⚹", angle: 60,  orb: 6, color: "text-emerald-400" },
  { key: "Quincunx",    symbol: "⚻", angle: 150, orb: 3, color: "text-orange-400"  },
];

interface AspectResult { p1: string; p2: string; def: AspectDef; orb: number }

function absLon(p: PlanetData): number {
  return (SIGN_ORDER as readonly string[]).indexOf(p.sign) * 30 + p.degree;
}

function computeAspects(planets: Record<string, PlanetData>): AspectResult[] {
  const keys = ALL_POINT_KEYS.filter(k => planets[k]);
  const out: AspectResult[] = [];
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const lon1 = absLon(planets[keys[i]]);
      const lon2 = absLon(planets[keys[j]]);
      let diff = Math.abs(lon1 - lon2);
      if (diff > 180) diff = 360 - diff;
      for (const def of ASPECT_DEFS) {
        const orb = Math.abs(diff - def.angle);
        if (orb <= def.orb) { out.push({ p1: keys[i], p2: keys[j], def, orb }); break; }
      }
    }
  }
  return out.sort((a, b) => a.orb - b.orb);
}

function formatDeg(deg: number): string {
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  return `${d}°${m.toString().padStart(2, "0")}′`;
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

const COPY = {
  ru: {
    back:      "← Мой круг",
    chatWith:  "Расклад с",
    ascendant: "Асцендент",
    notFound:  "Карта не найдена",
    relations: {
      self: "Я", partner: "Партнёр", parent: "Родители",
      child: "Ребёнок", friend: "Друг/подруга", other: "Другое",
    },
  },
  en: {
    back:      "← My Circle",
    chatWith:  "Reading with",
    ascendant: "Ascendant",
    notFound:  "Chart not found",
    relations: {
      self: "Me", partner: "Partner", parent: "Parent",
      child: "Child", friend: "Friend", other: "Other",
    },
  },
  uk: {
    back:      "← Моє коло",
    chatWith:  "Розклад з",
    ascendant: "Асцендент",
    notFound:  "Карта не знайдена",
    relations: {
      self: "Я", partner: "Партнер", parent: "Батьки",
      child: "Дитина", friend: "Друг/подруга", other: "Інше",
    },
  },
};

// ── Spinner ───────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PersonDetailPage() {
  const rawLocale = useLocale();
  const locale    = rawLocale as "ru" | "en" | "uk";
  const c         = COPY[locale] ?? COPY.ru;
  const router    = useRouter();
  const params    = useParams<{ id: string }>();
  const chartId   = params.id;

  const tS  = useTranslations("signs");
  const tP  = useTranslations("planets");
  const tA  = useTranslations("aspects");
  const tH  = useTranslations("housesTable");
  const tSP = useTranslations("specialPoints");

  const [chart, setChart] = useState<ChartRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch("/api/natal-chart")
      .then(r => r.json())
      .then((data: { charts: ChartRecord[] }) => {
        const found = data.charts?.find(ch => ch.id === chartId) ?? null;
        if (found) setChart(found);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [chartId]);

  if (loading) {
    return (
      <div className="flex flex-1 min-h-0 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (notFound || !chart) {
    return (
      <div className="flex flex-1 min-h-0 flex-col items-center justify-center gap-4">
        <p className="text-sm text-[var(--muted-foreground)]">{c.notFound}</p>
        <button
          onClick={() => router.push("/app/people", { locale })}
          className="text-sm text-cosmic-400 hover:text-cosmic-300 transition-colors"
        >
          {c.back}
        </button>
      </div>
    );
  }

  const asc     = chart.ascendant;
  const planets = chart.planets_json;
  const aspects = computeAspects(planets);
  const isSelf  = chart.relation === "self";
  const HOUSE_KEYS = ["h1","h2","h3","h4","h5","h6","h7","h8","h9","h10","h11","h12"] as const;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 py-8 md:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl space-y-6 pb-8">

        {/* Back */}
        <button
          onClick={() => router.push("/app/people", { locale })}
          className="text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
        >
          {c.back}
        </button>

        {/* ── Header card ─────────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--card)] via-[var(--card)]/90 to-cosmic-500/5 p-6 shadow-[0_4px_30px_rgba(139,92,246,0.08)]">
          <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-cosmic-500/10 blur-[60px]" />

          <div className="relative">
            {/* Name + relation */}
            <div className="mb-5 flex items-center gap-3">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl ${
                isSelf
                  ? "bg-gradient-to-br from-cosmic-500/30 to-nebula-500/30 border border-cosmic-400/30"
                  : "bg-[var(--muted)] border border-[var(--border)]"
              }`}>
                {{ self: "✦", partner: "💑", parent: "👨‍👩‍👧", child: "🧒", friend: "👫", other: "👤" }[chart.relation] ?? "👤"}
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-[var(--foreground)]">{chart.name}</h1>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {c.relations[chart.relation as keyof typeof c.relations] ?? chart.relation}
                </p>
              </div>
            </div>

            {/* ASC + MC */}
            <div className="flex flex-wrap gap-8 mb-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                  {c.ascendant}
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl text-cosmic-400">{SIGN_SYMBOLS[asc.sign] ?? "✦"}</span>
                  <span className="font-display text-xl font-bold text-[var(--foreground)]">
                    {tS(asc.sign as Parameters<typeof tS>[0])} {formatDeg(asc.degree)}
                  </span>
                </div>
              </div>
              {asc.mc_sign && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">MC</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-3xl text-nebula-400">{SIGN_SYMBOLS[asc.mc_sign] ?? "✦"}</span>
                    <span className="font-display text-xl font-bold text-[var(--foreground)]">
                      {tS(asc.mc_sign as Parameters<typeof tS>[0])} {formatDeg(asc.mc_degree ?? 0)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Sun · Moon pills + birth info */}
            <div className="flex flex-wrap gap-2">
              {(["Sun", "Moon"] as const).map(key => {
                const p = planets[key];
                if (!p) return null;
                return (
                  <div key={key} className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--muted)]/50 px-3 py-1">
                    <span className="text-sm text-[var(--muted-foreground)]">{PLANET_SYMBOLS[key]}</span>
                    <span className="text-sm font-medium text-[var(--foreground)]">{tP(key as Parameters<typeof tP>[0])}</span>
                    <span className="text-sm text-[var(--muted-foreground)]">{SIGN_SYMBOLS[p.sign]} {tS(p.sign as Parameters<typeof tS>[0])}</span>
                  </div>
                );
              })}
              <div className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--muted)]/50 px-3 py-1">
                <span className="text-xs text-[var(--muted-foreground)]">
                  {formatDate(chart.birth_date)}
                  {chart.birth_time && ` · ${chart.birth_time}`}
                  {" · "}{chart.birth_city}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Planet table ──────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-x-2 border-b border-[var(--border)] px-4 py-2.5">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">{tP("Sun").slice(0,0)}✦</span>
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">♈</span>
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">{tH("houseCol")}</span>
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)] text-right">°</span>
          </div>
          {PLANET_ORDER.map((name, i) => {
            const p = planets[name];
            if (!p) return null;
            return (
              <div key={name} className={`grid grid-cols-[2fr_2fr_1fr_1fr] gap-x-2 items-center px-4 py-3 ${i % 2 === 1 ? "bg-[var(--muted)]/20" : ""}`}>
                <div className="flex items-center gap-2">
                  <span className="w-5 text-center text-base text-[var(--muted-foreground)]">{PLANET_SYMBOLS[name]}</span>
                  <span className="text-sm font-medium text-[var(--foreground)]">{tP(name as Parameters<typeof tP>[0])}</span>
                  {p.retrograde && <span className="text-xs text-amber-400 font-semibold">℞</span>}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-cosmic-400">{SIGN_SYMBOLS[p.sign]}</span>
                  <span className="text-sm text-[var(--foreground)]">{tS(p.sign as Parameters<typeof tS>[0])}</span>
                </div>
                <span className="text-sm text-[var(--muted-foreground)]">{p.house}</span>
                <span className="text-right text-xs text-[var(--muted-foreground)] tabular-nums">{formatDeg(p.degree)}</span>
              </div>
            );
          })}
        </div>

        {/* ── Special points ────────────────────────────────────────────────── */}
        {(planets.NorthNode || planets.SouthNode || planets.Lilith || planets.Chiron) && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[var(--border)]">
              <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">{tSP("title")}</span>
            </div>
            <div className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-x-2 px-4 py-2 border-b border-[var(--border)]/50">
              <span className="text-xs text-[var(--muted-foreground)]">✦</span>
              <span className="text-xs text-[var(--muted-foreground)]">♈</span>
              <span className="text-xs text-[var(--muted-foreground)]">{tH("houseCol")}</span>
              <span className="text-xs text-[var(--muted-foreground)] text-right">°</span>
            </div>
            {(["NorthNode","SouthNode","Lilith","Chiron"] as const).map((key, i) => {
              const p = planets[key];
              if (!p) return null;
              return (
                <div key={key} className={`grid grid-cols-[2fr_2fr_1fr_1fr] gap-x-2 items-center px-4 py-3 ${i % 2 === 1 ? "bg-[var(--muted)]/20" : ""}`}>
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-center text-base text-nebula-400">{SPECIAL_POINT_SYMBOLS[key]}</span>
                    <span className="text-sm font-medium text-[var(--foreground)]">{tP(key as Parameters<typeof tP>[0])}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-cosmic-400">{SIGN_SYMBOLS[p.sign]}</span>
                    <span className="text-sm text-[var(--foreground)]">{tS(p.sign as Parameters<typeof tS>[0])}</span>
                  </div>
                  <span className="text-sm text-[var(--muted-foreground)]">{p.house}</span>
                  <span className="text-right text-xs text-[var(--muted-foreground)] tabular-nums">{formatDeg(p.degree)}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Houses ────────────────────────────────────────────────────────── */}
        {chart.houses_json?.length > 0 && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[var(--border)]">
              <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">{tH("title")}</span>
            </div>
            <div className="grid grid-cols-[2fr_2fr_1fr] gap-x-2 px-4 py-2 border-b border-[var(--border)]/50">
              <span className="text-xs text-[var(--muted-foreground)]">{tH("houseCol")}</span>
              <span className="text-xs text-[var(--muted-foreground)]">♈</span>
              <span className="text-xs text-[var(--muted-foreground)] text-right">°</span>
            </div>
            {chart.houses_json.map((h, i) => (
              <div key={h.house} className={`grid grid-cols-[2fr_2fr_1fr] gap-x-2 items-center px-4 py-3 ${i % 2 === 1 ? "bg-[var(--muted)]/20" : ""}`}>
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {tH(HOUSE_KEYS[i] as Parameters<typeof tH>[0])}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-cosmic-400">{SIGN_SYMBOLS[h.sign]}</span>
                  <span className="text-sm text-[var(--foreground)]">{tS(h.sign as Parameters<typeof tS>[0])}</span>
                </div>
                <span className="text-right text-xs text-[var(--muted-foreground)] tabular-nums">{formatDeg(h.degree)}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Aspects ───────────────────────────────────────────────────────── */}
        {aspects.length > 0 && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[var(--border)]">
              <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">{tA("title")}</span>
            </div>
            <div className="divide-y divide-[var(--border)]/50">
              {aspects.map(({ p1, p2, def, orb }) => {
                const sym1 = PLANET_SYMBOLS[p1] ?? SPECIAL_POINT_SYMBOLS[p1] ?? "•";
                const sym2 = PLANET_SYMBOLS[p2] ?? SPECIAL_POINT_SYMBOLS[p2] ?? "•";
                const orbD = Math.floor(orb);
                const orbM = Math.floor((orb - orbD) * 60);
                return (
                  <div key={`${p1}-${p2}`} className="flex items-center gap-2 px-4 py-2.5">
                    <span className="w-5 text-center text-sm text-[var(--muted-foreground)]">{sym1}</span>
                    <span className="text-sm text-[var(--foreground)] w-20 truncate">{tP(p1 as Parameters<typeof tP>[0])}</span>
                    <span className={`text-base font-bold w-5 text-center ${def.color}`}>{def.symbol}</span>
                    <span className="w-5 text-center text-sm text-[var(--muted-foreground)]">{sym2}</span>
                    <span className="text-sm text-[var(--foreground)] flex-1 truncate">{tP(p2 as Parameters<typeof tP>[0])}</span>
                    <span className="text-xs text-[var(--muted-foreground)] tabular-nums whitespace-nowrap">
                      {tA("orb")} {orbD}°{orbM.toString().padStart(2,"0")}′
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        {!isSelf && (
          <button
            onClick={() => router.push(`/app/chat?chart_ids=${chart.id}`, { locale })}
            className="w-full rounded-2xl border border-cosmic-500/40 bg-gradient-to-br from-cosmic-500/15 to-nebula-500/10 px-4 py-4 text-sm font-semibold text-cosmic-400 transition-all hover:border-cosmic-400/60 hover:from-cosmic-500/20 active:scale-[0.99]"
          >
            {c.chatWith} {chart.name} →
          </button>
        )}

      </div>
    </div>
  );
}
