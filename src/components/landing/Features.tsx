import { getTranslations, getLocale } from "next-intl/server";
import { NatalChartSvg } from "./NatalChartSvg";
import { ChatMockup } from "./ChatMockup";
import { CalendarMockup } from "./CalendarMockup";
import { FeatureReveal, GraphicFloat } from "./FeatureReveal";

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 text-cosmic-400">
      <circle cx="12" cy="12" r="10" fill="rgba(139,92,246,0.15)" stroke="rgba(139,92,246,0.4)" strokeWidth="1.5" />
      <path d="m8 12 3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export async function Features() {
  const t = await getTranslations("landing");
  const locale = await getLocale();

  const features = [
    {
      icon: "\u2299",
      iconGradient: "from-cosmic-500 to-nebula-500",
      title: t("featureChartTitle"),
      subtitle: t("featureChartSubtitle"),
      desc: t("featureChartDesc"),
      bullets: [t("featureChartB1"), t("featureChartB2"), t("featureChartB3")],
      cta: t("featureChartCta"),
      graphic: <NatalChartSvg />,
      reverse: false,
      accent: "from-cosmic-500/20 to-nebula-500/10",
    },
    {
      icon: "\u2726",
      iconGradient: "from-nebula-500 to-cosmic-500",
      title: t("featureAiTitle"),
      subtitle: t("featureAiSubtitle"),
      desc: t("featureAiDesc"),
      bullets: [t("featureAiB1"), t("featureAiB2"), t("featureAiB3")],
      cta: t("featureAiCta"),
      graphic: <ChatMockup locale={locale} />,
      reverse: true,
      accent: "from-nebula-500/20 to-cosmic-500/10",
    },
    {
      icon: "\u263D",
      iconGradient: "from-cosmic-600 to-starlight-500",
      title: t("featureCalTitle"),
      subtitle: t("featureCalSubtitle"),
      desc: t("featureCalDesc"),
      bullets: [t("featureCalB1"), t("featureCalB2"), t("featureCalB3")],
      cta: t("featureCalCta"),
      graphic: <CalendarMockup locale={locale} />,
      reverse: false,
      accent: "from-cosmic-600/20 to-starlight-500/10",
    },
  ];

  return (
    <section id="features" className="relative px-4 py-24">
      {/* Section header */}
      <div className="mx-auto mb-16 max-w-2xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cosmic-500/30 bg-cosmic-500/10 px-4 py-1.5 text-xs font-medium text-cosmic-600 dark:text-cosmic-300">
          \u2726 {t("sectionFeatures")}
        </div>
        <h2 className="font-display text-4xl font-bold sm:text-5xl">
          <span className="gradient-text">{t("featuresTitle")}</span>
        </h2>
      </div>

      {/* Feature blocks */}
      <div className="mx-auto max-w-6xl space-y-24">
        {features.map((f, idx) => (
          <FeatureReveal key={idx} delay={0.1}>
            <div
              className={`flex flex-col items-center gap-12 lg:flex-row lg:items-center ${
                f.reverse ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* ── Text side ─────────────────────────────── */}
              <div className="flex flex-1 flex-col gap-5">
                {/* Icon badge + subtitle */}
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${f.iconGradient} text-sm text-white shadow-sm`}>
                    {f.icon}
                  </div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-cosmic-400">
                    {f.subtitle}
                  </p>
                </div>

                <h3 className="font-display text-3xl font-bold text-[var(--foreground)] sm:text-4xl">
                  {f.title}
                </h3>

                <p className="text-base leading-relaxed text-[var(--muted-foreground)]">
                  {f.desc}
                </p>

                <ul className="flex flex-col gap-3">
                  {f.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-3 text-sm text-[var(--foreground)]">
                      <CheckIcon />
                      {b}
                    </li>
                  ))}
                </ul>

                <a
                  href="#pricing"
                  className="mt-2 inline-flex items-center self-start rounded-full bg-gradient-to-r from-cosmic-500 to-nebula-500 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-all hover:scale-105 hover:shadow-cosmic"
                >
                  {f.cta}
                </a>
              </div>

              {/* ── Graphic side ──────────────────────────── */}
              <div className="relative flex flex-1 items-center justify-center">
                <div
                  className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${f.accent} blur-3xl`}
                  aria-hidden="true"
                />
                <GraphicFloat>{f.graphic}</GraphicFloat>
              </div>
            </div>
          </FeatureReveal>
        ))}
      </div>
    </section>
  );
}
