// Decorative natal chart SVG illustration
export function NatalChartSvg() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full bg-cosmic-500/20 blur-3xl" />

      <svg
        viewBox="0 0 320 320"
        width="320"
        height="320"
        className="relative drop-shadow-[0_0_30px_rgba(139,92,246,0.4)]"
        aria-hidden="true"
      >
        {/* Outer circle */}
        <circle cx="160" cy="160" r="150" fill="none" stroke="rgba(139,92,246,0.3)" strokeWidth="1" />
        {/* Middle circle */}
        <circle cx="160" cy="160" r="110" fill="none" stroke="rgba(139,92,246,0.2)" strokeWidth="1" />
        {/* Inner circle */}
        <circle cx="160" cy="160" r="70" fill="rgba(15,15,46,0.8)" stroke="rgba(139,92,246,0.4)" strokeWidth="1.5" />
        {/* Core */}
        <circle cx="160" cy="160" r="30" fill="rgba(139,92,246,0.15)" stroke="rgba(217,70,239,0.5)" strokeWidth="1" />

        {/* 12 house dividers */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const x1 = 160 + 70 * Math.cos(angle);
          const y1 = 160 + 70 * Math.sin(angle);
          const x2 = 160 + 150 * Math.cos(angle);
          const y2 = 160 + 150 * Math.sin(angle);
          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(139,92,246,0.2)"
              strokeWidth="1"
            />
          );
        })}

        {/* Planets */}
        {[
          { angle: 15, r: 130, symbol: "☉", color: "#fb923c" },   // Sun
          { angle: 45, r: 125, symbol: "☽", color: "#a78bfa" },   // Moon
          { angle: 90, r: 132, symbol: "☿", color: "#34d399" },   // Mercury
          { angle: 135, r: 128, symbol: "♀", color: "#f472b6" },  // Venus
          { angle: 200, r: 130, symbol: "♂", color: "#f87171" },  // Mars
          { angle: 255, r: 125, symbol: "♃", color: "#fbbf24" },  // Jupiter
          { angle: 310, r: 132, symbol: "♄", color: "#94a3b8" },  // Saturn
        ].map((p) => {
          const angle = (p.angle * Math.PI) / 180;
          const x = 160 + p.r * Math.cos(angle);
          const y = 160 + p.r * Math.sin(angle);
          return (
            <g key={p.symbol}>
              <circle cx={x} cy={y} r="10" fill="rgba(15,15,46,0.9)" stroke={p.color} strokeWidth="1.5" />
              <text x={x} y={y + 4} textAnchor="middle" fontSize="9" fill={p.color} fontFamily="serif">
                {p.symbol}
              </text>
            </g>
          );
        })}

        {/* Ascendant marker */}
        <text x="170" y="165" fontSize="11" fill="rgba(217,70,239,0.9)" fontFamily="sans-serif" fontWeight="bold">
          ASC
        </text>

        {/* Zodiac signs around the edge */}
        {["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"].map((sign, i) => {
          const angle = ((i * 30 + 15) * Math.PI) / 180;
          const x = 160 + 140 * Math.cos(angle);
          const y = 160 + 140 * Math.sin(angle);
          return (
            <text key={sign} x={x} y={y + 4} textAnchor="middle" fontSize="10" fill="rgba(167,139,250,0.6)" fontFamily="serif">
              {sign}
            </text>
          );
        })}

        {/* Animated pulse ring */}
        <circle cx="160" cy="160" r="30" fill="none" stroke="rgba(217,70,239,0.6)" strokeWidth="1">
          <animate attributeName="r" values="30;38;30" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0;0.6" dur="3s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}
