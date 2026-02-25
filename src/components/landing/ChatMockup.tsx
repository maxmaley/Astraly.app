// Decorative chat interface mockup
export function ChatMockup() {
  const messages = [
    {
      role: "assistant",
      text: "Привет, Анастасия! ✨ Я вижу, что твоё Солнце в Стрельце создаёт удивительную энергию...",
    },
    {
      role: "user",
      text: "Расскажи мне о моей карьере",
    },
    {
      role: "assistant",
      text: "💼 С Марсом в 10-м доме ты рождена для лидерства! Сатурн транзит укрепляет твою позицию...",
    },
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
          <span className="mx-auto text-xs text-[var(--muted-foreground)]">AI Астролог ✦</span>
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
          {["💑 Совместимость", "❤️ Любовь", "💼 Карьера"].map((p) => (
            <span
              key={p}
              className="rounded-full border border-cosmic-500/30 bg-cosmic-500/10 px-2.5 py-1 text-xs text-cosmic-300"
            >
              {p}
            </span>
          ))}
        </div>

        {/* Input bar */}
        <div className="flex items-center gap-2 rounded-b-xl border-t border-[var(--border)] px-3 py-2.5">
          <div className="flex-1 rounded-xl bg-[var(--input)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
            Спроси что угодно...
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
