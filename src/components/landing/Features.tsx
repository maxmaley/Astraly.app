import { getTranslations } from "next-intl/server";
import { NatalChartSvg } from "./NatalChartSvg";
import { ChatMockup } from "./ChatMockup";
import { CalendarMockup } from "./CalendarMockup";

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

  const features = [
    {
      tag: "01",
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
      tag: "02",
      title: t("featureAiTitle"),
      subtitle: t("featureAiSubtitle"),
      desc: t("featureAiDesc"),
      bullets: [t("featureAiB1"), t("featureAiB2"), t("featureAiB3")],
      cta: t("featureAiCta"),
      graphic: <ChatMockup />,
      reverse: true,
      accent: "from-nebula-500/20 to-cosmic-500/10",
    },
    {
      tag: "03",
      title: t("featureCalTitle"),
      subtitle: t("featureCalSubtitle"),
      desc: t("featureCalDesc"),
      bullets: [t("featureCalB1"), t("featureCalB2"), t("featureCalB3")],
      cta: t("featureCalCta"),
      graphic: <CalendarMockup />,
      reverse: false,
      accent: "from-cosmic-600/20 to-starlight-500/10",
    },
  ];

  return (
    <section id="features" className="relative px-4 py-24">
      {/* Section header */}
      <div className="mx-auto mb-20 max-w-2xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cosmic-500/30 bg-cosmic-500/10 px-4 py-1.5 text-xs font-medium text-cosmic-300">
          ✦ Возможности
        </div>
        <h2 className="font-display text-4xl font-bold sm:text-5xl">
          <span className="gradient-text">{t("featuresTitle")}</span>
        </h2>
      </div>

      {/* Feature blocks */}
      <div className="mx-auto max-w-6xl space-y-32">
        {features.map((f) => (
          <div
            key={f.tag}
            className={`flex flex-col items-center gap-12 lg:flex-row lg:items-center ${
              f.reverse ? "lg:flex-row-reverse" : ""
            }`}
          >
            {/* Text side */}
            <div className="flex flex-1 flex-col gap-6">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-cosmic-400 opacity-60">{f.tag}</span>
                <div className="h-px flex-1 bg-gradient-to-r from-cosmic-500/30 to-transparent" />
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-cosmic-400">
                  {f.subtitle}
                </p>
                <h3 className="font-display text-3xl font-bold text-[var(--foreground)] sm:text-4xl">
                  {f.title}
                </h3>
              </div>

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
                href="#hero"
                className="mt-2 inline-flex items-center self-start rounded-full bg-gradient-to-r from-cosmic-500 to-nebula-500 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-all hover:scale-105 hover:shadow-cosmic"
              >
                {f.cta}
              </a>
            </div>

            {/* Graphic side */}
            <div className="relative flex flex-1 items-center justify-center">
              {/* Accent glow behind graphic */}
              <div
                className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${f.accent} blur-3xl`}
                aria-hidden="true"
              />
              <div className="relative">{f.graphic}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
