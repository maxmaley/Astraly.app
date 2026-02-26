"use client";

import Link        from "next/link";
import { useParams } from "next/navigation";

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

export default function NotFound() {
  const params = useParams();
  const locale = (params?.locale as string) ?? "ru";
  const c      = COPY[locale] ?? COPY.ru;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--background)] px-6 text-center">

      {/* ── Animated star field ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="stars-404-sm absolute inset-0" />
        <div className="stars-404-md absolute inset-0" />
        <div className="stars-404-lg absolute inset-0" />
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

        {/* Planet + orbiting star */}
        <div className="relative mb-2 select-none">
          <span
            className="text-[88px] leading-none"
            style={{ filter: "drop-shadow(0 0 32px rgba(139,92,246,0.6))" }}
          >
            🪐
          </span>
          <span className="orbit-star-404 absolute -top-1 -right-1 text-2xl leading-none" aria-hidden>
            ✦
          </span>
        </div>

        {/* 404 */}
        <p
          className="text-[120px] font-extrabold leading-none tracking-tighter"
          style={{
            background:           "linear-gradient(135deg, #a78bfa 0%, #818cf8 40%, #c084fc 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor:  "transparent",
            backgroundClip:       "text",
            filter:               "drop-shadow(0 0 48px rgba(139,92,246,0.4))",
          }}
        >
          404
        </p>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
          {c.heading}
        </h1>

        {/* Sub */}
        <p className="max-w-sm text-sm text-[var(--muted-foreground)] sm:text-base">
          {c.sub}
        </p>

        {/* CTA */}
        <Link
          href={`/${locale}`}
          className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition-opacity hover:opacity-90"
        >
          <svg
            width="14" height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M19 12H5M5 12l7-7M5 12l7 7" />
          </svg>
          {c.label}
        </Link>

        <div aria-hidden className="mt-8 flex gap-3 opacity-30">
          {["✦", "·", "✦", "·", "✦"].map((s, i) => (
            <span key={i} className="text-violet-400 text-xs">{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
