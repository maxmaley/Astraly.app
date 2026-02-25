import { getTranslations } from "next-intl/server";

// planKey maps to pricing.plans.{key}.name for i18n plan name display
const REVIEWS = [
  { name: "Анастасия К.", sign: "♐ Стрелец", avatar: "А", rating: 5, planKey: "solar",
    text: "Наконец-то поняла, почему не могу найти работу по душе — всё оказалось в натальной карте. AI объяснил за 5 минут то, что я искала годами. Теперь знаю куда двигаться!" },
  { name: "Дарья М.", sign: "♏ Скорпион", avatar: "Д", rating: 5, planKey: "moonlight",
    text: "Предсказало ссору с парнем ещё за 3 дня — Меркурий был квадрат моему Марсу. Теперь слежу за транзитами каждый день и конфликтов стало в разы меньше." },
  { name: "Виктория Р.", sign: "♈ Овен", avatar: "В", rating: 5, planKey: "solar",
    text: "Добавила карту мамы и узнала почему у нас такие сложные отношения. Всё сошлось до деталей. Впервые нашла способ понять её, а не просто злиться." },
  { name: "Марина О.", sign: "♎ Весы", avatar: "М", rating: 5, planKey: "cosmic",
    text: "Платная подписка — лучшее вложение за этот год. Гороскоп приходит утром в Telegram и всегда удивительно точный. Муж уже тоже хочет карту 😄" },
  { name: "Алина Т.", sign: "♓ Рыбы", avatar: "А", rating: 5, planKey: "cosmic",
    text: "Нашла в астрокалендаре лучший день для переговоров — Юпитер трин мой Меркурий. Пошла на встречу именно тогда и получила повышение. Совпадение? Не думаю." },
  { name: "Ксения Б.", sign: "♋ Рак", avatar: "К", rating: 5, planKey: "moonlight",
    text: "Думала что астрология — это выдумки. Зашла из любопытства, теперь не принимаю важных решений без AI астролога. Это просто другой уровень самопознания." },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-starlight-400">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export async function Reviews() {
  const t = await getTranslations("landing");
  const tp = await getTranslations("pricing");

  return (
    <section className="relative overflow-hidden px-4 py-24">
      {/* Subtle background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-cosmic-500/5 to-transparent"
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cosmic-500/30 bg-cosmic-500/10 px-4 py-1.5 text-xs font-medium text-cosmic-600 dark:text-cosmic-300">
            ✦ {t("sectionReviews")}
          </div>
          <h2 className="font-display text-4xl font-bold sm:text-5xl">
            <span className="gradient-text">{t("reviewsTitle")}</span>
          </h2>
          <p className="mt-4 text-[var(--muted-foreground)]">{t("reviewsSubtitle")}</p>
        </div>

        {/* Reviews grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((r) => (
            <div
              key={r.name}
              className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition-all duration-300 hover:border-cosmic-500/30 hover:shadow-cosmic"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cosmic-500 to-nebula-500 font-bold text-white">
                    {r.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">{r.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{r.sign}</p>
                  </div>
                </div>
                <Stars count={r.rating} />
              </div>

              {/* Quote */}
              <p className="flex-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
                &ldquo;{r.text}&rdquo;
              </p>

              {/* Plan badge */}
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-cosmic-500/30 bg-cosmic-500/10 px-2.5 py-0.5 text-xs text-cosmic-600 dark:text-cosmic-300">
                  {tp(`plans.${r.planKey}.name` as Parameters<typeof tp>[0])}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Social proof bar */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8">
          {[
            { value: "10 000+", label: t("reviewsCharts") },
            { value: "98%", label: t("reviewsRecommend") },
            { value: "4.9 ★", label: t("reviewsRating") },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-bold gradient-text">{s.value}</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
