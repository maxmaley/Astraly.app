"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations, useLocale }       from "next-intl";
import { Link }                             from "@/navigation";
import type { CalendarEvent, DayInfo, EventType } from "@/lib/astro/calendar";
import { PaywallOverlay }                   from "@/components/shared/PaywallOverlay";

// ── Event visual config ────────────────────────────────────────────────────

const EVENT_CONFIG: Record<EventType, { color: string; dot: string; icon: string }> = {
  solar_eclipse:    { color: "text-red-500",    dot: "bg-red-500",    icon: "⚡" },
  lunar_eclipse:    { color: "text-rose-400",   dot: "bg-rose-400",   icon: "🌘" },
  new_moon:         { color: "text-indigo-400", dot: "bg-indigo-500", icon: "🌑" },
  full_moon:        { color: "text-amber-400",  dot: "bg-amber-400",  icon: "🌕" },
  first_quarter:    { color: "text-slate-400",  dot: "bg-slate-400",  icon: "🌓" },
  last_quarter:     { color: "text-slate-400",  dot: "bg-slate-400",  icon: "🌗" },
  retrograde_start: { color: "text-orange-400", dot: "bg-orange-400", icon: "℞" },
  retrograde_end:   { color: "text-emerald-400",dot: "bg-emerald-400",icon: "℞" },
  ingress:          { color: "text-cyan-400",   dot: "bg-cyan-400",   icon: "→" },
  moon_sign:        { color: "text-cosmic-400", dot: "bg-cosmic-400", icon: "☽" },
};

// Dot priority order (most important first, shown on grid)
const DOT_PRIORITY: EventType[] = [
  "solar_eclipse","lunar_eclipse",
  "new_moon","full_moon","first_quarter","last_quarter",
  "retrograde_start","retrograde_end",
  "ingress","moon_sign",
];

// ── Helpers ────────────────────────────────────────────────────────────────

function moonIcon(angle: number): string {
  if (angle < 22.5 || angle >= 337.5) return "🌑";
  if (angle < 67.5)  return "🌒";
  if (angle < 112.5) return "🌓";
  if (angle < 157.5) return "🌔";
  if (angle < 202.5) return "🌕";
  if (angle < 247.5) return "🌖";
  if (angle < 292.5) return "🌗";
  return "🌘";
}

function formatPercent(v: number): string {
  return Math.round(v * 100) + "%";
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-[var(--border)]/60 ${className ?? ""}`} />
  );
}

function CalendarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-full rounded" />
        ))}
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={`d${i}`} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// ── Event label (uses i18n template interpolation manually) ───────────────

function useEventLabel() {
  const t = useTranslations("calendar");
  const tSigns = useTranslations("signs");
  const tPlanets = useTranslations("planets");

  return function label(ev: CalendarEvent): string {
    const planetKey = ev.planet as Parameters<typeof tPlanets>[0] | undefined;
    const signKey   = ev.sign   as Parameters<typeof tSigns>[0]   | undefined;
    const planet = planetKey ? tPlanets(planetKey) : "";
    const sign   = signKey   ? tSigns(signKey)     : "";

    switch (ev.type) {
      case "new_moon":         return t("new_moon");
      case "first_quarter":    return t("first_quarter");
      case "full_moon":        return t("full_moon");
      case "last_quarter":     return t("last_quarter");
      case "solar_eclipse":    return t("solar_eclipse");
      case "lunar_eclipse":    return t("lunar_eclipse");
      case "retrograde_start": return t("retrograde_start", { planet });
      case "retrograde_end":   return t("retrograde_end",   { planet });
      case "ingress":          return t("ingress",           { planet, sign });
      case "moon_sign":        return t("moon_sign",         { sign });
      default:                 return ev.type;
    }
  };
}

function useEventDesc() {
  const t = useTranslations("calendar");
  const tSigns = useTranslations("signs");
  const tPlanets = useTranslations("planets");

  return function desc(ev: CalendarEvent): string {
    const planetKey = ev.planet as Parameters<typeof tPlanets>[0] | undefined;
    const signKey   = ev.sign   as Parameters<typeof tSigns>[0]   | undefined;
    const planet = planetKey ? tPlanets(planetKey) : "";
    const sign   = signKey   ? tSigns(signKey)     : "";

    switch (ev.type) {
      case "new_moon":         return t("new_moon_desc");
      case "first_quarter":    return t("first_quarter_desc");
      case "full_moon":        return t("full_moon_desc");
      case "last_quarter":     return t("last_quarter_desc");
      case "solar_eclipse":    return t("solar_eclipse_desc");
      case "lunar_eclipse":    return t("lunar_eclipse_desc");
      case "retrograde_start": return t("retrograde_start_desc", { planet });
      case "retrograde_end":   return t("retrograde_end_desc",   { planet });
      case "ingress":          return t("ingress_desc",           { planet, sign });
      case "moon_sign":        return t("moon_sign_desc",         { sign });
      default:                 return "";
    }
  };
}

// ── Event card (in day detail panel) ─────────────────────────────────────

function EventCard({ ev }: { ev: CalendarEvent }) {
  const cfg      = EVENT_CONFIG[ev.type];
  const getLabel = useEventLabel();
  const getDesc  = useEventDesc();

  return (
    <div className="flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3">
      <span className={`mt-0.5 text-xl shrink-0 leading-none ${cfg.color}`}>
        {cfg.icon}
      </span>
      <div className="min-w-0">
        <p className={`text-sm font-semibold ${cfg.color}`}>{getLabel(ev)}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-[var(--muted-foreground)]">
          {getDesc(ev)}
        </p>
      </div>
    </div>
  );
}

// ── Day detail panel ───────────────────────────────────────────────────────

interface DayPanelProps {
  day:      DayInfo | null;
  locale:   string;
  onClose?: () => void;
}

function DayPanel({ day, locale, onClose }: DayPanelProps) {
  const t  = useTranslations("calendar");
  const tC = useTranslations("chat");

  if (!day) {
    return (
      <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 text-center">
        <span className="text-4xl opacity-30">✦</span>
        <p className="text-sm text-[var(--muted-foreground)]">{t("selectDay")}</p>
      </div>
    );
  }

  const dateObj = new Date(day.date + "T12:00:00Z");
  const dateLabel = dateObj.toLocaleDateString(
    locale === "en" ? "en-US" : locale === "uk" ? "uk-UA" : "ru-RU",
    { weekday: "long", day: "numeric", month: "long" },
  );

  const chatHref = `/app/chat?prompt=${encodeURIComponent(
    tC("suggestTodayPrompt") + " " + day.date
  )}`;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
            {dateLabel}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-2xl leading-none">{moonIcon(day.moonPhaseAngle)}</span>
            <span className="text-sm text-[var(--muted-foreground)]">
              {formatPercent(day.moonIllumination)}
            </span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors lg:hidden"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Events */}
      {day.events.length === 0 ? (
        <p className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 text-sm text-[var(--muted-foreground)]">
          {t("noEvents")}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {day.events.map((ev, i) => (
            <EventCard key={i} ev={ev} />
          ))}
        </div>
      )}

      {/* Discuss CTA */}
      <Link
        href={chatHref}
        className="flex items-center justify-center gap-2 rounded-xl bg-cosmic-500 hover:bg-cosmic-600 active:bg-cosmic-700 px-4 py-2.5 text-sm font-medium text-white transition-colors"
      >
        ☽ {t("discuss")}
      </Link>
    </div>
  );
}

// ── Legend ─────────────────────────────────────────────────────────────────

function Legend() {
  const t = useTranslations("calendar");
  const items: [EventType, string][] = [
    ["new_moon",         t("new_moon")],
    ["full_moon",        t("full_moon")],
    ["solar_eclipse",    t("solar_eclipse")],
    ["retrograde_start", t("retrograde_start", { planet: "" }).trim()],
    ["ingress",          t("ingress", { planet: "", sign: "" }).trim()],
    ["moon_sign",        t("moon_sign", { sign: "" }).trim()],
  ];

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-1">
      {items.map(([type, label]) => {
        const cfg = EVENT_CONFIG[type];
        return (
          <div key={type} className="flex items-center gap-1.5">
            <span className={`text-base leading-none ${cfg.color}`}>{cfg.icon}</span>
            <span className="text-xs text-[var(--muted-foreground)]">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const t      = useTranslations("calendar");
  const locale = useLocale();

  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); // 1-based
  const [days,       setDays]       = useState<DayInfo[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [tierGated,  setTierGated]  = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(
    today.toISOString().slice(0, 10), // preselect today
  );

  const todayStr = today.toISOString().slice(0, 10);

  // ── Fetch calendar data ────────────────────────────────────────────────
  const fetchMonth = useCallback(async (y: number, m: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/calendar?year=${y}&month=${m}`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        if (json.error === "tier_required" || res.status === 403) { setTierGated(true); return; }
        throw new Error("fetch failed");
      }
      const json = await res.json();
      setDays(json.days as DayInfo[]);
    } catch {
      setDays([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonth(year, month);
  }, [year, month, fetchMonth]);

  // ── Month navigation ───────────────────────────────────────────────────
  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  }
  function goToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
    setSelectedDate(todayStr);
  }

  // ── Tier gate ──────────────────────────────────────────────────────────
  if (tierGated) return <PaywallOverlay feature="calendar" />;

  // ── Calendar grid logic ────────────────────────────────────────────────
  // Monday-first weekday header (universal for ru/uk/en)
  const weekdays = t("weekdays").split(",");

  const firstDayOfMonth = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  // Convert to Monday-first offset: Sun=0 → 6, Mon=1 → 0, …
  const startOffset = (firstDayOfMonth + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const monthLabel = new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(
    locale === "en" ? "en-US" : locale === "uk" ? "uk-UA" : "ru-RU",
    { month: "long", year: "numeric" },
  );

  // Build a lookup map: dateStr → DayInfo
  const dayMap = new Map<string, DayInfo>(days.map(d => [d.date, d]));

  const selectedDay = selectedDate ? dayMap.get(selectedDate) ?? null : null;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-10">

      {/* Page title */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-cosmic-400 text-xl">✦</span>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">{t("title")}</h1>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

        {/* ── Left: calendar grid ── */}
        <div className="flex-1 min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">

          {/* Month header */}
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold capitalize text-[var(--foreground)]">
                {monthLabel}
              </h2>
              {/* Today button */}
              {(year !== today.getFullYear() || month !== today.getMonth() + 1) && (
                <button
                  onClick={goToday}
                  className="rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
                >
                  {t("today")}
                </button>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
                aria-label="Previous month"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={nextMonth}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
                aria-label="Next month"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>

          {loading ? (
            <CalendarSkeleton />
          ) : (
            <>
              {/* Weekday labels */}
              <div className="mb-1 grid grid-cols-7 text-center">
                {weekdays.map(d => (
                  <div key={d} className="py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]/60">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day grid */}
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                {/* Empty offset cells */}
                {Array.from({ length: startOffset }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
                  const dateStr = `${year}-${String(month).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
                  const info    = dayMap.get(dateStr);
                  const isToday = dateStr === todayStr;
                  const isSel   = dateStr === selectedDate;
                  const events  = info?.events ?? [];

                  // Top 3 distinct-type dots
                  const dotTypes = DOT_PRIORITY.filter(t =>
                    events.some(e => e.type === t)
                  ).slice(0, 3);

                  return (
                    <button
                      key={d}
                      onClick={() => setSelectedDate(prev => prev === dateStr ? null : dateStr)}
                      className={`
                        relative flex flex-col items-center justify-start rounded-xl p-1 pt-1.5 pb-2
                        text-xs transition-all duration-150 select-none
                        ${isSel
                          ? "bg-cosmic-500 text-white shadow-md"
                          : isToday
                          ? "bg-cosmic-500/15 text-cosmic-300 font-semibold ring-1 ring-cosmic-500/40"
                          : events.length > 0
                          ? "text-[var(--foreground)] hover:bg-[var(--muted)]"
                          : "text-[var(--muted-foreground)]/60 hover:bg-[var(--muted)]"
                        }
                      `}
                    >
                      <span className={`font-medium leading-none ${isToday && !isSel ? "text-cosmic-400" : ""}`}>
                        {d}
                      </span>
                      {/* Event dots */}
                      <div className="mt-1 flex gap-0.5">
                        {dotTypes.map(type => (
                          <span
                            key={type}
                            className={`h-1 w-1 rounded-full ${isSel ? "bg-white/80" : EVENT_CONFIG[type].dot}`}
                          />
                        ))}
                        {dotTypes.length === 0 && <span className="h-1 w-1" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-5 border-t border-[var(--border)] pt-4">
                <Legend />
              </div>
            </>
          )}
        </div>

        {/* ── Right: day detail panel ── */}
        <div className={`
          lg:w-80 xl:w-96 shrink-0
          rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5
          ${selectedDate ? "block" : "hidden lg:block"}
        `}>
          <DayPanel
            day={selectedDay}
            locale={locale}
            onClose={() => setSelectedDate(null)}
          />
        </div>
      </div>
    </div>
  );
}
