// Redesigned chat mockup — mirrors real app UI
interface ChatMockupProps {
  locale: string;
}

const CONTENT = {
  ru: {
    title: "AI Астролог",
    status: "Онлайн",
    chartCtx: "\u2609 \u2650 Стрелец \u00B7 \u263D \u264B Рак \u00B7 ASC \u2648 Овен",
    messages: [
      { role: "assistant" as const, parts: [
        { text: "Привет, Анастасия! ", bold: false },
        { text: "Твоё Солнце в Стрельце", bold: true },
        { text: " создаёт мощную энергию для роста. Вижу интересный транзит Юпитера к твоему MC — ", bold: false },
        { text: "это редкое окно для карьеры.", bold: true },
      ]},
      { role: "user" as const, parts: [{ text: "А что насчёт карьеры в ближайший месяц?", bold: false }] },
      { role: "assistant" as const, parts: [
        { text: "С ", bold: false },
        { text: "Марсом в 10-м доме", bold: true },
        { text: " ты рождена для лидерства! Сатурн транзитом укрепляет позицию. Ключевые даты:", bold: false },
      ]},
      { role: "assistant-list" as const, parts: [
        { text: "\u00B7  14 марта — подъём энергии", bold: false },
        { text: "\u00B7  19 марта — полнолуние, важные решения", bold: false },
        { text: "\u00B7  25 марта — финансовое укрепление", bold: false },
      ]},
    ],
    prompts: ["\uD83D\uDC91 Совместимость", "\u2764\uFE0F Любовь", "\uD83D\uDCBC Карьера", "\uD83D\uDD2E Прогноз"],
    placeholder: "Спроси что угодно...",
  },
  uk: {
    title: "AI Астролог",
    status: "Онлайн",
    chartCtx: "\u2609 \u2650 Стрілець \u00B7 \u263D \u264B Рак \u00B7 ASC \u2648 Овен",
    messages: [
      { role: "assistant" as const, parts: [
        { text: "Привіт, Анастасіє! ", bold: false },
        { text: "Твоє Сонце у Стрільці", bold: true },
        { text: " створює потужну енергію для зростання. Бачу цікавий транзит Юпітера до MC — ", bold: false },
        { text: "це рідкісне вікно для кар\u2019єри.", bold: true },
      ]},
      { role: "user" as const, parts: [{ text: "А що щодо кар\u2019єри найближчим часом?", bold: false }] },
      { role: "assistant" as const, parts: [
        { text: "З ", bold: false },
        { text: "Марсом у 10-му будинку", bold: true },
        { text: " ти народжена для лідерства! Транзит Сатурна зміцнює позицію. Ключові дати:", bold: false },
      ]},
      { role: "assistant-list" as const, parts: [
        { text: "\u00B7  14 березня — підйом енергії", bold: false },
        { text: "\u00B7  19 березня — повний місяць, важливі рішення", bold: false },
        { text: "\u00B7  25 березня — фінансове зміцнення", bold: false },
      ]},
    ],
    prompts: ["\uD83D\uDC91 Сумісність", "\u2764\uFE0F Кохання", "\uD83D\uDCBC Кар\u2019єра", "\uD83D\uDD2E Прогноз"],
    placeholder: "Запитай що завгодно...",
  },
  en: {
    title: "AI Astrologer",
    status: "Online",
    chartCtx: "\u2609 \u2650 Sagittarius \u00B7 \u263D \u264B Cancer \u00B7 ASC \u2648 Aries",
    messages: [
      { role: "assistant" as const, parts: [
        { text: "Hi Anastasia! ", bold: false },
        { text: "Your Sun in Sagittarius", bold: true },
        { text: " creates powerful growth energy. I see an interesting Jupiter transit to your MC \u2014 ", bold: false },
        { text: "a rare career window.", bold: true },
      ]},
      { role: "user" as const, parts: [{ text: "What about my career this month?", bold: false }] },
      { role: "assistant" as const, parts: [
        { text: "With ", bold: false },
        { text: "Mars in the 10th house", bold: true },
        { text: ", you were born to lead! Saturn transit strengthens your position. Key dates:", bold: false },
      ]},
      { role: "assistant-list" as const, parts: [
        { text: "\u00B7  March 14 \u2014 energy surge", bold: false },
        { text: "\u00B7  March 19 \u2014 full moon, big decisions", bold: false },
        { text: "\u00B7  March 25 \u2014 financial strengthening", bold: false },
      ]},
    ],
    prompts: ["\uD83D\uDC91 Compatibility", "\u2764\uFE0F Love", "\uD83D\uDCBC Career", "\uD83D\uDD2E Forecast"],
    placeholder: "Ask anything...",
  },
} as const;

export function ChatMockup({ locale }: ChatMockupProps) {
  const c = CONTENT[locale as keyof typeof CONTENT] ?? CONTENT.ru;

  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-2xl bg-nebula-500/10 blur-3xl" />

      <div className="glass-card relative w-full max-w-sm overflow-hidden rounded-2xl shadow-nebula">
        {/* ── App-style header ─────────────────────────── */}
        <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-4 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cosmic-500 to-nebula-500 text-sm text-white">
            \u2726
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--foreground)]">{c.title}</p>
            <p className="flex items-center gap-1 text-[10px] text-emerald-500">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {c.status}
            </p>
          </div>
        </div>

        {/* ── Chart context banner ─────────────────────── */}
        <div className="border-b border-[var(--border)] bg-cosmic-500/5 px-4 py-1.5">
          <p className="truncate text-[10px] font-medium text-cosmic-600 dark:text-cosmic-300">
            {c.chartCtx}
          </p>
        </div>

        {/* ── Messages ─────────────────────────────────── */}
        <div className="flex flex-col gap-2.5 px-4 py-3">
          {c.messages.map((msg, i) => {
            const isUser = msg.role === "user";
            const isList = msg.role === "assistant-list";

            return (
              <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                {!isUser && !isList && (
                  <div className="mr-2 mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cosmic-500 to-nebula-500 text-[10px] text-white">
                    \u2726
                  </div>
                )}
                {isList && <div className="mr-2 w-6 flex-shrink-0" />}
                <div
                  className={`max-w-[82%] rounded-2xl px-3 py-2 text-[11px] leading-relaxed ${
                    isUser
                      ? "bg-gradient-to-r from-cosmic-500/25 to-nebula-500/15 text-[var(--foreground)]"
                      : isList
                        ? "-mt-1 rounded-tl-md bg-[var(--muted)] pt-1.5 text-[var(--foreground)]"
                        : "bg-[var(--muted)] text-[var(--foreground)]"
                  }`}
                >
                  {isList ? (
                    <div className="flex flex-col gap-0.5">
                      {msg.parts.map((p, j) => (
                        <span key={j} className="text-[var(--muted-foreground)]">{p.text}</span>
                      ))}
                    </div>
                  ) : (
                    <span>
                      {msg.parts.map((p, j) =>
                        p.bold
                          ? <strong key={j} className="font-semibold text-cosmic-600 dark:text-cosmic-300">{p.text}</strong>
                          : <span key={j}>{p.text}</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-cosmic-500 to-nebula-500 text-[10px] text-white">
              \u2726
            </div>
            <div className="flex gap-1 rounded-2xl bg-[var(--muted)] px-3 py-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-cosmic-400"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Quick prompts — 2×2 grid ─────────────────── */}
        <div className="grid grid-cols-2 gap-1.5 px-4 pb-3">
          {c.prompts.map((p) => (
            <span
              key={p}
              className="rounded-xl border border-cosmic-500/20 bg-cosmic-500/5 px-2.5 py-1.5 text-center text-[10px] font-medium text-cosmic-600 transition-colors hover:bg-cosmic-500/10 dark:text-cosmic-300"
            >
              {p}
            </span>
          ))}
        </div>

        {/* ── Input bar ────────────────────────────────── */}
        <div className="flex items-center gap-2 border-t border-[var(--border)] px-3 py-2">
          <span className="text-sm">\u2728</span>
          <div className="flex-1 rounded-xl bg-[var(--input)] px-3 py-1.5 text-[11px] text-[var(--muted-foreground)]">
            {c.placeholder}
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-cosmic-500 to-nebula-500 text-white shadow-sm">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
