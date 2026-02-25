import { getTranslations } from "next-intl/server";
import { HeroForm } from "./HeroForm";

export async function Hero() {
  const t = await getTranslations("landing");

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-20">
      {/* Nebula glow orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
      >
        {/* Large central glow */}
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cosmic-500/10 blur-[120px]" />
        {/* Side orbs */}
        <div className="absolute -left-32 top-1/3 h-[400px] w-[400px] rounded-full bg-nebula-500/8 blur-[100px]" />
        <div className="absolute -right-32 bottom-1/3 h-[350px] w-[350px] rounded-full bg-cosmic-600/10 blur-[100px]" />
      </div>

      {/* Floating planets (decorative) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute left-[8%] top-[20%] h-16 w-16 animate-float rounded-full bg-gradient-to-br from-cosmic-400/30 to-nebula-500/20 blur-sm" style={{ animationDelay: "0s" }} />
        <div className="absolute right-[10%] top-[30%] h-10 w-10 animate-float rounded-full bg-gradient-to-br from-nebula-400/25 to-starlight-400/15 blur-sm" style={{ animationDelay: "-2s" }} />
        <div className="absolute left-[15%] bottom-[25%] h-8 w-8 animate-float rounded-full bg-gradient-to-br from-cosmic-500/20 to-nebula-600/15 blur-sm" style={{ animationDelay: "-4s" }} />
        <div className="absolute right-[18%] bottom-[30%] h-12 w-12 animate-float rounded-full bg-gradient-to-br from-starlight-400/20 to-cosmic-400/15 blur-sm" style={{ animationDelay: "-1s" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-6xl flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        {/* Left: Text */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:max-w-xl">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cosmic-500/30 bg-cosmic-500/10 px-4 py-1.5 text-xs font-medium text-cosmic-300">
            <span className="animate-pulse-slow">✦</span>
            AI Астролог нового поколения
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            <span className="gradient-text text-glow">{t("heroTitle")}</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg leading-relaxed text-[var(--muted-foreground)] sm:text-xl">
            {t("heroSubtitle")}
          </p>

          {/* Stats row */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 lg:justify-start">
            {[
              { icon: "🌟", label: t("heroStat1") },
              { icon: "✨", label: t("heroStat2") },
              { icon: "⭐", label: t("heroStat3") },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="text-lg">{s.icon}</span>
                <span className="text-sm font-medium text-[var(--muted-foreground)]">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Form */}
        <div className="w-full lg:w-auto lg:flex-shrink-0">
          <HeroForm />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--muted-foreground)]">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </section>
  );
}
