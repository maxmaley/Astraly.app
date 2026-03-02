// Redesigned astro calendar mockup — matches real app with moon phases & event types
interface CalendarMockupProps {
  locale: string;
}

const CONTENT = {
  ru: {
    month: "Март 2025",
    days: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
    today: "Сегодня",
    events: [
      { day: 3,  icon: "℞", label: "Меркурий ретроград",    cls: "text-orange-500 dark:text-orange-400 border-orange-500/30 bg-orange-500/8" },
      { day: 6,  icon: "🌓", label: "Первая четверть",       cls: "text-slate-500 dark:text-slate-400 border-slate-500/30 bg-slate-500/8" },
      { day: 14, icon: "🌕", label: "Полнолуние",            cls: "text-amber-500 dark:text-amber-400 border-amber-500/30 bg-amber-500/8" },
      { day: 22, icon: "🌗", label: "Последняя четверть",    cls: "text-slate-500 dark:text-slate-400 border-slate-500/30 bg-slate-500/8" },
      { day: 29, icon: "🌑", label: "Новолуние",             cls: "text-indigo-500 dark:text-indigo-400 border-indigo-500/30 bg-indigo-500/8" },
    ],
    detail: {
      date: "14 марта",
      phase: "🌕 Полнолуние",
      illum: "100%",
      events: [
        { icon: "🌕", text: "Полнолуние — время решений", cls: "text-amber-400" },
        { icon: "♃",  text: "Удачный день для карьеры",   cls: "text-cosmic-400" },
      ],
    },
  },
  uk: {
    month: "Березень 2025",
    days: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"],
    today: "Сьогодні",
    events: [
      { day: 3,  icon: "℞", label: "Меркурій ретроград",    cls: "text-orange-500 dark:text-orange-400 border-orange-500/30 bg-orange-500/8" },
      { day: 6,  icon: "🌓", label: "Перша чверть",          cls: "text-slate-500 dark:text-slate-400 border-slate-500/30 bg-slate-500/8" },
      { day: 14, icon: "🌕", label: "Повний місяць",         cls: "text-amber-500 dark:text-amber-400 border-amber-500/30 bg-amber-500/8" },
      { day: 22, icon: "🌗", label: "Остання чверть",        cls: "text-slate-500 dark:text-slate-400 border-slate-500/30 bg-slate-500/8" },
      { day: 29, icon: "🌑", label: "Новий місяць",          cls: "text-indigo-500 dark:text-indigo-400 border-indigo-500/30 bg-indigo-500/8" },
    ],
    detail: {
      date: "14 березня",
      phase: "🌕 Повний місяць",
      illum: "100%",
      events: [
        { icon: "🌕", text: "Повний місяць — час рішень",    cls: "text-amber-400" },
        { icon: "♃",  text: "Вдалий день для кар\u2019єри", cls: "text-cosmic-400" },
      ],
    },
  },
  en: {
    month: "March 2025",
    days: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
    today: "Today",
    events: [
      { day: 3,  icon: "℞", label: "Mercury retrograde",    cls: "text-orange-500 dark:text-orange-400 border-orange-500/30 bg-orange-500/8" },
      { day: 6,  icon: "🌓", label: "First quarter",         cls: "text-slate-500 dark:text-slate-400 border-slate-500/30 bg-slate-500/8" },
      { day: 14, icon: "🌕", label: "Full Moon",             cls: "text-amber-500 dark:text-amber-400 border-amber-500/30 bg-amber-500/8" },
      { day: 22, icon: "🌗", label: "Last quarter",          cls: "text-slate-500 dark:text-slate-400 border-slate-500/30 bg-slate-500/8" },
      { day: 29, icon: "🌑", label: "New Moon",              cls: "text-indigo-500 dark:text-indigo-400 border-indigo-500/30 bg-indigo-500/8" },
    ],
    detail: {
      date: "March 14",
      phase: "🌕 Full Moon",
      illum: "100%",
      events: [
        { icon: "🌕", text: "Full Moon — time for decisions", cls: "text-amber-400" },
        { icon: "♃",  text: "Lucky day for career",          cls: "text-cosmic-400" },
      ],
    },
  },
} as const;

// Moon phase icons for specific days (decorative)
const MOON_PHASES: Record<number, string> = {
  6: "🌓", 14: "🌕", 22: "🌗", 29: "🌑",
};

// Days with event dots
const DOT_DAYS = new Set([3, 6, 8, 14, 19, 22, 25, 29]);

export function CalendarMockup({ locale }: CalendarMockupProps) {
  const c = CONTENT[locale as keyof typeof CONTENT] ?? CONTENT.ru;
  const totalDays = 31;
  // March 2025 starts on Saturday → 5 empty cells (Mon=0…Sat=5)
  const offset = 5;
  const selectedDay = 14;

  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-2xl bg-cosmic-500/10 blur-3xl" />

      <div className="glass-card relative flex w-full max-w-sm overflow-hidden rounded-2xl shadow-cosmic">
        {/* ── Left: Calendar grid ──────────────────────── */}
        <div className="flex-1 p-4">
          {/* Month header */}
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-display text-sm font-semibold text-[var(--foreground)]">
              {c.month}
            </h4>
            <div className="flex items-center gap-1">
              <button className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--muted-foreground)] hover:bg-[var(--muted)]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </button>
              <button className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--muted-foreground)] hover:bg-[var(--muted)]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </button>
            </div>
          </div>

          {/* Day-of-week labels */}
          <div className="mb-1.5 grid grid-cols-7 text-center">
            {c.days.map((d) => (
              <div key={d} className="text-[10px] font-medium text-[var(--muted-foreground)]">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-px">
            {/* Empty offset cells */}
            {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}

            {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => {
              const isSelected = d === selectedDay;
              const hasMoon = MOON_PHASES[d];
              const hasDot = DOT_DAYS.has(d) && !isSelected;

              return (
                <button
                  key={d}
                  className={`relative flex h-8 w-full flex-col items-center justify-center rounded-lg text-[11px] transition-colors ${
                    isSelected
                      ? "bg-cosmic-500 font-bold text-white shadow-sm shadow-cosmic-500/40"
                      : hasDot
                        ? "font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
                        : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                  }`}
                >
                  {hasMoon && !isSelected ? (
                    <span className="text-[8px] leading-none opacity-70">{hasMoon}</span>
                  ) : null}
                  <span className={hasMoon && !isSelected ? "-mt-0.5 text-[10px]" : ""}>{d}</span>
                  {hasDot && (
                    <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-cosmic-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Right: Day detail panel ──────────────────── */}
        <div className="hidden w-[140px] flex-shrink-0 border-l border-[var(--border)] bg-[var(--muted)]/30 p-3 sm:block">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            {c.detail.date}
          </p>

          {/* Moon phase */}
          <div className="mt-2.5 text-center">
            <p className="text-2xl leading-none">{c.detail.phase.split(" ")[0]}</p>
            <p className="mt-1 text-[10px] font-medium text-[var(--foreground)]">
              {c.detail.phase.split(" ").slice(1).join(" ")}
            </p>
            <p className="text-[10px] text-[var(--muted-foreground)]">{c.detail.illum}</p>
          </div>

          {/* Events for selected day */}
          <div className="mt-3 flex flex-col gap-1.5">
            {c.detail.events.map((ev) => (
              <div key={ev.text} className="rounded-lg bg-[var(--card)] px-2 py-1.5">
                <span className={`text-[10px] ${ev.cls}`}>{ev.icon}</span>
                <p className="mt-0.5 text-[9px] leading-tight text-[var(--foreground)]">{ev.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Event list (below card, visible on all screens) ── */}
      <div className="relative mt-3 flex flex-col gap-1.5">
        {c.events.slice(0, 3).map((e) => (
          <div
            key={e.day}
            className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-[11px] ${e.cls}`}
          >
            <span className="text-sm leading-none">{e.icon}</span>
            <span className="font-bold tabular-nums">{e.day}</span>
            <span className="truncate">{e.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
