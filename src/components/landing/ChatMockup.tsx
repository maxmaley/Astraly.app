// Decorative chat interface mockup
interface ChatMockupProps {
  locale: string;
}

const CONTENT = {
  ru: {
    title: "AI Астролог ✦",
    msg1: "Привет, Анастасия! ✨ Я вижу, что твоё Солнце в Стрельце создаёт удивительную энергию...",
    msg2: "Расскажи мне о моей карьере",
    msg3: "💼 С Марсом в 10-м доме ты рождена для лидерства! Сатурн транзит укрепляет позицию...",
    prompts: ["💑 Совместимость", "❤️ Любовь", "💼 Карьера"],
    placeholder: "Спроси что угодно...",
  },
  uk: {
    title: "AI Астролог ✦",
    msg1: "Привіт, Анастасіє! ✨ Я бачу, що твоє Сонце у Стрільці створює дивовижну енергію...",
    msg2: "Розкажи мені про мою кар'єру",
    msg3: "💼 З Марсом у 10-му будинку ти народжена для лідерства! Транзит Сатурна зміцнює позицію...",
    prompts: ["💑 Сумісність", "❤️ Кохання", "💼 Кар'єра"],
    placeholder: "Запитай що завгодно...",
  },
  en: {
    title: "AI Astrologer ✦",
    msg1: "Hi, Anastasia! ✨ I can see your Sun in Sagittarius is creating amazing energy...",
    msg2: "Tell me about my career",
    msg3: "💼 With Mars in the 10th house, you were born to lead! Saturn transit strengthens your position...",
    prompts: ["💑 Compatibility", "❤️ Love", "💼 Career"],
    placeholder: "Ask anything...",
  },
  pl: {
    title: "AI Astrolog ✦",
    msg1: "Cześć, Anastazjo! ✨ Widzę, że Twoje Słońce w Strzelcu tworzy niesamowitą energię...",
    msg2: "Opowiedz mi o mojej karierze",
    msg3: "💼 Z Marsem w 10. domu urodziłaś się, by przewodzić! Tranzyt Saturna wzmacnia Twoją pozycję...",
    prompts: ["💑 Kompatybilność", "❤️ Miłość", "💼 Kariera"],
    placeholder: "Zapytaj o cokolwiek...",
  },
} as const;

export function ChatMockup({ locale }: ChatMockupProps) {
  const c = CONTENT[locale as keyof typeof CONTENT] ?? CONTENT.ru;

  const messages = [
    { role: "assistant", text: c.msg1 },
    { role: "user", text: c.msg2 },
    { role: "assistant", text: c.msg3 },
  ];

  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-2xl bg-nebula-500/10 blur-3xl" />
      <div className="glass-card relative w-full max-w-sm rounded-2xl p-1 shadow-nebula">
        {/* Title bar */}
        <div className="flex items-center gap-2 rounded-t-xl border-b border-[var(--border)] px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
          </div>
          <span className="mx-auto text-xs text-[var(--muted-foreground)]">{c.title}</span>
        </div>

        {/* Messages */}
        <div className="flex flex-col gap-3 p-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="mr-2 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cosmic-500 to-nebula-500 text-xs text-white">
                  ✦
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-cosmic-500/20 text-[var(--foreground)]"
                    : "bg-[var(--muted)] text-[var(--foreground)]"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cosmic-500 to-nebula-500 text-xs text-white">
              ✦
            </div>
            <div className="flex gap-1 rounded-2xl bg-[var(--muted)] px-3.5 py-2.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-cosmic-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Quick prompts */}
        <div className="flex flex-wrap gap-1.5 px-4 pb-3">
          {c.prompts.map((p) => (
            <span
              key={p}
              className="rounded-full border border-cosmic-500/30 bg-cosmic-500/10 px-2.5 py-1 text-xs text-cosmic-600 dark:text-cosmic-300"
            >
              {p}
            </span>
          ))}
        </div>

        {/* Input bar */}
        <div className="flex items-center gap-2 rounded-b-xl border-t border-[var(--border)] px-3 py-2.5">
          <div className="flex-1 rounded-xl bg-[var(--input)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
            {c.placeholder}
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cosmic-500 text-white">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
