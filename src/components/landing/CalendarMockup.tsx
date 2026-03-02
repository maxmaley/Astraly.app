// Decorative astro calendar mockup
interface CalendarMockupProps {
  locale: string;
}

const CONTENT = {
  ru: {
    month: "Март 2025",
    days: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
    events: [
      { day: 3, label: "☿ Меркурий ретро начинается" },
      { day: 8, label: "♀ Венера активирует 7-й дом" },
      { day: 14, label: "♃ Удачный день для карьеры" },
      { day: 19, label: "🌕 Полнолуние — время решений" },
      { day: 25, label: "♄ Финансовое укрепление" },
    ],
  },
  uk: {
    month: "Березень 2025",
    days: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"],
    events: [
      { day: 3, label: "☿ Меркурій ретро починається" },
      { day: 8, label: "♀ Венера активує 7-й будинок" },
      { day: 14, label: "♃ Вдалий день для кар'єри" },
      { day: 19, label: "🌕 Повний місяць — час рішень" },
      { day: 25, label: "♄ Фінансове зміцнення" },
    ],
  },
  en: {
    month: "March 2025",
    days: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
    events: [
      { day: 3, label: "☿ Mercury retrograde begins" },
      { day: 8, label: "♀ Venus activates 7th house" },
      { day: 14, label: "♃ Lucky day for career" },
      { day: 19, label: "🌕 Full Moon — time for decisions" },
      { day: 25, label: "♄ Financial strengthening" },
    ],
  },
} as const;

const EVENT_COLORS = [
  "text-yellow-600 dark:text-yellow-400 border-yellow-500/40 bg-yellow-500/10",
  "text-pink-600 dark:text-pink-400 border-pink-500/40 bg-pink-500/10",
  "text-cosmic-600 dark:text-cosmic-400 border-cosmic-500/40 bg-cosmic-500/10",
  "text-nebula-600 dark:text-nebula-400 border-nebula-500/40 bg-nebula-500/10",
  "text-emerald-600 dark:text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
] as const;

export function CalendarMockup({ locale }: CalendarMockupProps) {
  const c = CONTENT[locale as keyof typeof CONTENT] ?? CONTENT.ru;
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const eventDays = new Set<number>(c.events.map((e) => e.day));

  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-2xl bg-cosmic-500/10 blur-3xl" />
      <div className="glass-card relative w-full max-w-sm rounded-2xl p-4 shadow-cosmic">
        {/* Month header */}
        <div className="mb-4 flex items-center justify-between">
          <h4 className="font-display text-sm font-semibold text-[var(--foreground)]">{c.month}</h4>
          <div className="flex items-center gap-1">
            <button className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--muted-foreground)] hover:bg-[var(--muted)]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <button className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--muted-foreground)] hover:bg-[var(--muted)]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          </div>
        </div>

        {/* Day labels */}
        <div className="mb-2 grid grid-cols-7 text-center">
          {c.days.map((d) => (
            <div key={d} className="text-[10px] font-medium text-[var(--muted-foreground)]">{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => <div key={`empty-${i}`} />)}
          {days.map((d) => (
            <button
              key={d}
              className={`relative flex h-8 w-full items-center justify-center rounded-lg text-xs transition-colors ${
                d === 14
                  ? "bg-cosmic-500 font-bold text-white"
                  : eventDays.has(d)
                  ? "font-medium text-cosmic-600 dark:text-cosmic-300 hover:bg-[var(--muted)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
              }`}
            >
              {d}
              {eventDays.has(d) && d !== 14 && (
                <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-cosmic-400" />
              )}
            </button>
          ))}
        </div>

        {/* Events list */}
        <div className="mt-4 flex flex-col gap-2">
          {c.events.slice(0, 3).map((e, i) => (
            <div
              key={e.day}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${EVENT_COLORS[i]}`}
            >
              <span className="font-bold">{e.day}</span>
              <span className="truncate">{e.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
