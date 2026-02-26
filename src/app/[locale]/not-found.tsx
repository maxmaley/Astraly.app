import Link       from "next/link";
import { getLocale } from "next-intl/server";

const COPY: Record<string, { heading: string; sub: string; label: string }> = {
  ru: {
    heading: "Планета не найдена",
    sub:     "Звёзды не смогли обнаружить эту страницу. Возможно, она в другой галактике.",
    label:   "Вернуться домой",
  },
  uk: {
    heading: "Планета не знайдена",
    sub:     "Зірки не змогли знайти цю сторінку. Можливо, вона в іншій галактиці.",
    label:   "Повернутися додому",
  },
  en: {
    heading: "Planet not found",
    sub:     "The stars couldn't locate this page. It may have drifted into another galaxy.",
    label:   "Back to home",
  },
};

export default async function NotFound() {
  const locale = await getLocale();
  const c      = COPY[locale] ?? COPY.en;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--background)] px-6 text-center">

      {/* ── Animated star field ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* Layer 1 — small slow stars */}
        <div className="stars-sm absolute inset-0" />
        {/* Layer 2 — medium stars */}
        <div className="stars-md absolute inset-0" />
        {/* Layer 3 — large bright stars */}
        <div className="stars-lg absolute inset-0" />
      </div>

      {/* ── Glowing orb behind 404 ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[420px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.18) 0%, rgba(99,102,241,0.08) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col items-center gap-6">

        {/* Planet illustration */}
        <div className="relative mb-2 select-none">
          <span className="text-[88px] leading-none" style={{ filter: "drop-shadow(0 0 32px rgba(139,92,246,0.6))" }}>
            🪐
          </span>
          {/* Tiny orbiting star */}
          <span
            className="orbit-star absolute -top-1 -right-1 text-2xl leading-none"
            aria-hidden
          >
            ✦
          </span>
        </div>

        {/* 404 number */}
        <p
          className="text-[120px] font-extrabold leading-none tracking-tighter"
          style={{
            background:    "linear-gradient(135deg, #a78bfa 0%, #818cf8 40%, #c084fc 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textShadow:    "none",
            filter:        "drop-shadow(0 0 48px rgba(139,92,246,0.4))",
          }}
        >
          404
        </p>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
          {c.heading}
        </h1>

        {/* Subtext */}
        <p className="max-w-sm text-sm text-[var(--muted-foreground)] sm:text-base">
          {c.sub}
        </p>

        {/* CTA */}
        <Link
          href={`/${locale}`}
          className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cosmic-500 to-nebula-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cosmic-500/30 transition-opacity hover:opacity-90"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M19 12H5M5 12l7-7M5 12l7 7" />
          </svg>
          {c.label}
        </Link>

        {/* Subtle constellation dots */}
        <div aria-hidden className="mt-8 flex gap-3 opacity-30">
          {["✦","·","✦","·","✦"].map((s, i) => (
            <span key={i} className="text-cosmic-400 text-xs">{s}</span>
          ))}
        </div>
      </div>

      {/* ── CSS for stars + orbit animation ── */}
      <style>{`
        /* ── Stars ── */
        .stars-sm, .stars-md, .stars-lg {
          background-image: radial-gradient(circle, #fff 1px, transparent 1px);
          animation: twinkle linear infinite;
        }
        .stars-sm {
          background-size: 200px 200px;
          opacity: 0.25;
          animation-duration: 120s;
        }
        .stars-md {
          background-size: 350px 350px;
          opacity: 0.18;
          animation-duration: 80s;
        }
        .stars-lg {
          background-size: 600px 600px;
          opacity: 0.12;
          animation-duration: 50s;
        }
        @keyframes twinkle {
          from { background-position: 0 0; }
          to   { background-position: 600px 600px; }
        }

        /* ── Orbiting star ── */
        .orbit-star {
          color: #a78bfa;
          animation: orbit 4s linear infinite;
          transform-origin: -28px 28px;
        }
        @keyframes orbit {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
