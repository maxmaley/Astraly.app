import { getTranslations } from "next-intl/server";

const REVIEWS = [
  { nameKey: "n1", sign: "Sagittarius", rating: 5, planKey: "solar",    textKey: "r1" },
  { nameKey: "n2", sign: "Scorpio",     rating: 5, planKey: "moonlight", textKey: "r2" },
  { nameKey: "n3", sign: "Aries",       rating: 5, planKey: "solar",    textKey: "r3" },
  { nameKey: "n4", sign: "Libra",       rating: 5, planKey: "cosmic",   textKey: "r4" },
  { nameKey: "n5", sign: "Pisces",      rating: 5, planKey: "cosmic",   textKey: "r5" },
  { nameKey: "n6", sign: "Cancer",      rating: 5, planKey: "moonlight", textKey: "r6" },
];

const SIGN_SYMBOLS: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋", Leo: "♌", Virgo: "♍",
  Libra: "♎", Scorpio: "♏", Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

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
  const t  = await getTranslations("landing");
  const tp = await getTranslations("pricing");
  const ts = await getTranslations("signs");
  const tr = await getTranslations("reviews");

  return (
    <section className="relative overflow-hidden px-4 py-24">
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
          {REVIEWS.map((r) => {
            const name = tr(r.nameKey as Parameters<typeof tr>[0]);
            const avatar = name[0]?.toUpperCase() ?? "?";
            return (
            <div
              key={r.nameKey}
              className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition-all duration-300 hover:border-cosmic-500/30 hover:shadow-cosmic"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cosmic-500 to-nebula-500 font-bold text-white">
                    {avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">{name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {SIGN_SYMBOLS[r.sign]} {ts(r.sign as Parameters<typeof ts>[0])}
                    </p>
                  </div>
                </div>
                <Stars count={r.rating} />
              </div>

              {/* Quote */}
              <p className="flex-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
                &ldquo;{tr(r.textKey as Parameters<typeof tr>[0])}&rdquo;
              </p>

              {/* Plan badge */}
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-cosmic-500/30 bg-cosmic-500/10 px-2.5 py-0.5 text-xs text-cosmic-600 dark:text-cosmic-300">
                  {tp(`plans.${r.planKey}.name` as Parameters<typeof tp>[0])}
                </span>
              </div>
            </div>
            );
          })}
        </div>

        {/* Social proof bar */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8">
          {[
            { value: "10 000+", label: t("reviewsCharts") },
            { value: "98%",     label: t("reviewsRecommend") },
            { value: "4.9 ★",  label: t("reviewsRating") },
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
