// Premium natal chart infographic — app-like card with SVG wheel
export function NatalChartSvg() {
  const cx = 170;
  const cy = 170;
  const outerR = 152;
  const zodiacMid = 140;
  const planetR = 106;
  const innerR = 68;
  const coreR = 28;

  const planets = [
    { symbol: "\u2609", angle: 250, color: "#fb923c" }, // Sun
    { symbol: "\u263D", angle: 100, color: "#a78bfa" }, // Moon
    { symbol: "\u263F", angle: 278, color: "#34d399" }, // Mercury
    { symbol: "\u2640", angle: 222, color: "#f472b6" }, // Venus
    { symbol: "\u2642", angle: 308, color: "#f87171" }, // Mars
    { symbol: "\u2643", angle: 70, color: "#fbbf24" },  // Jupiter
    { symbol: "\u2644", angle: 342, color: "#94a3b8" }, // Saturn
  ];

  const aspects = [
    { from: 0, to: 5, color: "rgba(52,211,153,0.35)", dash: "" },       // Sun-Jupiter trine
    { from: 1, to: 3, color: "rgba(248,113,113,0.25)", dash: "4 3" },   // Moon-Venus opposition
    { from: 2, to: 6, color: "rgba(251,191,36,0.25)", dash: "2 2" },    // Mercury-Saturn sextile
  ];

  const zodiac = ["\u2648","\u2649","\u264A","\u264B","\u264C","\u264D","\u264E","\u264F","\u2650","\u2651","\u2652","\u2653"];

  function pt(angle: number, r: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  return (
    <div className="relative flex flex-col items-center">
      {/* Ambient glow */}
      <div className="absolute -inset-10 rounded-3xl bg-cosmic-500/15 blur-[60px]" />

      <div className="glass-card relative w-full max-w-[392px] overflow-hidden rounded-2xl shadow-cosmic">
        {/* ── Header bar ─────────────────────────────────── */}
        <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-4 py-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cosmic-500 to-nebula-500 text-[11px] text-white">
            \u2299
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[var(--foreground)]">Natal Chart</p>
            <p className="text-[10px] leading-tight text-[var(--muted-foreground)]">
              Anastasia &middot; Dec&nbsp;15,&nbsp;1998 &middot; 14:30
            </p>
          </div>
          <div className="flex h-6 w-6 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
          </div>
        </div>

        {/* ── Chart SVG ──────────────────────────────────── */}
        <div className="flex justify-center px-4 py-5">
          <svg
            viewBox="0 0 340 340"
            className="h-[264px] w-[264px] drop-shadow-[0_0_40px_rgba(139,92,246,0.25)]"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id="ncGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(139,92,246,0.12)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <linearGradient id="ncRing" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(139,92,246,0.40)" />
                <stop offset="50%" stopColor="rgba(217,70,239,0.30)" />
                <stop offset="100%" stopColor="rgba(139,92,246,0.40)" />
              </linearGradient>
            </defs>

            {/* Background aura */}
            <circle cx={cx} cy={cy} r={outerR + 12} fill="url(#ncGlow)" />

            {/* Outer ring */}
            <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="url(#ncRing)" strokeWidth="1" />

            {/* Zodiac mid-ring */}
            <circle cx={cx} cy={cy} r={zodiacMid - 8} fill="none" stroke="rgba(139,92,246,0.12)" strokeWidth="0.7" />

            {/* House dividers */}
            {Array.from({ length: 12 }).map((_, i) => {
              const a = pt(i * 30, innerR);
              const b = pt(i * 30, outerR);
              return (
                <line key={`h${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke="rgba(139,92,246,0.10)" strokeWidth="0.7" />
              );
            })}

            {/* Inner circle */}
            <circle cx={cx} cy={cy} r={innerR} fill="var(--card)" stroke="rgba(139,92,246,0.22)" strokeWidth="1.5" />

            {/* Core circle */}
            <circle cx={cx} cy={cy} r={coreR} fill="rgba(139,92,246,0.05)" stroke="rgba(217,70,239,0.25)" strokeWidth="1" />

            {/* Aspect lines */}
            {aspects.map((a, i) => {
              const f = pt(planets[a.from].angle, planetR);
              const t = pt(planets[a.to].angle, planetR);
              return (
                <line key={`a${i}`} x1={f.x} y1={f.y} x2={t.x} y2={t.y}
                  stroke={a.color} strokeWidth="1" strokeDasharray={a.dash || undefined} />
              );
            })}

            {/* Zodiac signs */}
            {zodiac.map((sign, i) => {
              const p = pt(i * 30 + 15, (zodiacMid + outerR) / 2 - 1);
              return (
                <text key={sign} x={p.x} y={p.y + 3.5} textAnchor="middle"
                  fontSize="9" fill="rgba(167,139,250,0.45)" fontFamily="serif">
                  {sign}
                </text>
              );
            })}

            {/* Planet glyphs */}
            {planets.map((p) => {
              const pos = pt(p.angle, planetR);
              return (
                <g key={p.symbol}>
                  <circle cx={pos.x} cy={pos.y} r="14" fill={p.color} opacity="0.07" />
                  <circle cx={pos.x} cy={pos.y} r="11" fill="var(--card)" stroke={p.color} strokeWidth="1.5" />
                  <text x={pos.x} y={pos.y + 3.5} textAnchor="middle"
                    fontSize="9.5" fill={p.color} fontFamily="serif" fontWeight="600">
                    {p.symbol}
                  </text>
                </g>
              );
            })}

            {/* Ascendant line */}
            {(() => {
              const inner = pt(0, innerR);
              const outer = pt(0, outerR);
              return (
                <g>
                  <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                    stroke="rgba(217,70,239,0.55)" strokeWidth="1.8" />
                  <text x={pt(0, innerR + 14).x + 10} y={pt(0, innerR + 14).y + 3}
                    fontSize="7.5" fill="rgba(217,70,239,0.85)" fontFamily="sans-serif" fontWeight="700" letterSpacing="0.5">
                    ASC
                  </text>
                </g>
              );
            })()}

            {/* Animated pulse */}
            <circle cx={cx} cy={cy} r={coreR} fill="none" stroke="rgba(217,70,239,0.4)" strokeWidth="1">
              <animate attributeName="r" values={`${coreR};${coreR + 10};${coreR}`} dur="3.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0;0.4" dur="3.5s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>

        {/* ── Key positions strip ────────────────────────── */}
        <div className="grid grid-cols-3 divide-x divide-[var(--border)] border-t border-[var(--border)]">
          {([
            { label: "\u2609 Sun",  sign: "\u2650", deg: "15\u00B032\u2032", name: "Sagittarius", cls: "text-starlight-500" },
            { label: "\u263D Moon", sign: "\u264B", deg: "8\u00B017\u2032",  name: "Cancer",      cls: "text-cosmic-400" },
            { label: "ASC",         sign: "\u2648", deg: "22\u00B041\u2032", name: "Aries",       cls: "text-nebula-400" },
          ] as const).map((item) => (
            <div key={item.label} className="px-2 py-2.5 text-center">
              <p className="text-[10px] text-[var(--muted-foreground)]">{item.label}</p>
              <p className={`text-[13px] font-bold leading-tight ${item.cls}`}>
                {item.sign} {item.deg}
              </p>
              <p className="text-[10px] text-[var(--muted-foreground)]">{item.name}</p>
            </div>
          ))}
        </div>

        {/* ── Aspect tags ────────────────────────────────── */}
        <div className="flex flex-wrap gap-1.5 border-t border-[var(--border)] px-3 py-2.5">
          {([
            { label: "\u2609 \u25B3 \u2643", tag: "Trine",       cls: "text-emerald-400 border-emerald-500/30 bg-emerald-500/8" },
            { label: "\u263D \u25A1 \u2644", tag: "Square",      cls: "text-red-400 border-red-500/30 bg-red-500/8" },
            { label: "\u263F \u260C \u2642", tag: "Conjunction", cls: "text-amber-400 border-amber-500/30 bg-amber-500/8" },
          ] as const).map((a) => (
            <span key={a.label} className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${a.cls}`}>
              {a.label} {a.tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
