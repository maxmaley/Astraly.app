// Decorative astro calendar mockup
export function CalendarMockup() {
  const events = [
    { day: 3, type: "mercury", label: "☿ Меркурий ретро начинается", color: "text-yellow-400 border-yellow-500/40 bg-yellow-500/10" },
    { day: 8, type: "venus", label: "♀ Венера активирует 7-й дом", color: "text-pink-400 border-pink-500/40 bg-pink-500/10" },
    { day: 14, type: "jupiter", label: "♃ Удачный день для карьеры", color: "text-cosmic-400 border-cosmic-500/40 bg-cosmic-500/10" },
    { day: 19, type: "moon", label: "🌕 Полнолуние — время решений", color: "text-nebula-400 border-nebula-500/40 bg-nebula-500/10" },
    { day: 25, type: "saturn", label: "♄ Финансовое укрепление", color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10" },
  ];

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const eventDays = new Set(events.map((e) => e.day));

  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-2xl bg-cosmic-500/10 blur-3xl" />
      <div className="glass-card relative w-full max-w-sm rounded-2xl p-4 shadow-cosmic">
        {/* Month header */}
        <div className="mb-4 flex items-center justify-between">
          <h4 className="font-display text-sm font-semibold text-[var(--foreground)]">Март 2025</h4>
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
          {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d) => (
            <div key={d} className="text-[10px] font-medium text-[var(--muted-foreground)]">{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {/* Offset for March starting on Saturday */}
          {Array.from({ length: 5 }).map((_, i) => <div key={`empty-${i}`} />)}
          {days.map((d) => (
            <button
              key={d}
              className={`relative flex h-8 w-full items-center justify-center rounded-lg text-xs transition-colors ${
                d === 14
                  ? "bg-cosmic-500 font-bold text-white"
                  : eventDays.has(d)
                  ? "font-medium text-cosmic-300 hover:bg-[var(--muted)]"
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
          {events.slice(0, 3).map((e) => (
            <div
              key={e.day}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${e.color}`}
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
