"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

/* ── Static data ──────────────────────────────────────── */

const ZODIAC = [
  { symbol: "\u2648", element: "fire" },   // Aries
  { symbol: "\u2649", element: "earth" },  // Taurus
  { symbol: "\u264A", element: "air" },    // Gemini
  { symbol: "\u264B", element: "water" },  // Cancer
  { symbol: "\u264C", element: "fire" },   // Leo
  { symbol: "\u264D", element: "earth" },  // Virgo
  { symbol: "\u264E", element: "air" },    // Libra
  { symbol: "\u264F", element: "water" },  // Scorpio
  { symbol: "\u2650", element: "fire" },   // Sagittarius
  { symbol: "\u2651", element: "earth" },  // Capricorn
  { symbol: "\u2652", element: "air" },    // Aquarius
  { symbol: "\u2653", element: "water" },  // Pisces
];

const ELEM: Record<string, { fill: string; stroke: string }> = {
  fire:  { fill: "rgba(251,146,60,0.12)", stroke: "rgba(251,146,60,0.50)" },
  earth: { fill: "rgba(52,211,153,0.10)", stroke: "rgba(52,211,153,0.45)" },
  air:   { fill: "rgba(147,197,253,0.10)", stroke: "rgba(147,197,253,0.45)" },
  water: { fill: "rgba(167,139,250,0.14)", stroke: "rgba(167,139,250,0.50)" },
};

const PLANETS = [
  { sym: "\u2609", deg: 22,  col: "#fb923c" }, // Sun
  { sym: "\u263D", deg: 78,  col: "#c4b5fd" }, // Moon
  { sym: "\u263F", deg: 105, col: "#34d399" }, // Mercury
  { sym: "\u2640", deg: 148, col: "#f472b6" }, // Venus
  { sym: "\u2642", deg: 215, col: "#f87171" }, // Mars
  { sym: "\u2643", deg: 268, col: "#fbbf24" }, // Jupiter
  { sym: "\u2644", deg: 322, col: "#94a3b8" }, // Saturn
];

const ASPECTS = [
  { a: 0, b: 2, col: "rgba(251,191,36,0.25)", dashed: false },
  { a: 1, b: 3, col: "rgba(96,165,250,0.22)",  dashed: true },
  { a: 0, b: 4, col: "rgba(52,211,153,0.22)",  dashed: true },
  { a: 2, b: 5, col: "rgba(52,211,153,0.18)",  dashed: true },
  { a: 4, b: 6, col: "rgba(248,113,113,0.28)", dashed: false },
  { a: 1, b: 5, col: "rgba(217,70,239,0.22)",  dashed: false },
  { a: 3, b: 6, col: "rgba(147,197,253,0.18)", dashed: true },
];

/* ── Layout ───────────────────────────────────────────── */

const S = 400;
const C = S / 2;
const RO = 185;   // outer radius
const RZI = 152;  // zodiac inner
const RHI = 78;   // house inner
const RP = 115;   // planet orbit
const RC = 30;    // core

/** Convert clock degrees (0 = top, CW) to [x, y] */
function polar(deg: number, r: number): [number, number] {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [C + r * Math.cos(rad), C + r * Math.sin(rad)];
}

/* ── Component ────────────────────────────────────────── */

export function NatalChartSvg() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    /* ── defs: filters & gradients ── */
    const defs = svg.append("defs");

    // planet glow filter
    const glow = defs
      .append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    glow.append("feGaussianBlur").attr("stdDeviation", "3.5").attr("result", "b");
    const gm = glow.append("feMerge");
    gm.append("feMergeNode").attr("in", "b");
    gm.append("feMergeNode").attr("in", "SourceGraphic");

    // soft glow for aspect lines
    const sg = defs
      .append("filter")
      .attr("id", "sglow")
      .attr("x", "-30%")
      .attr("y", "-30%")
      .attr("width", "160%")
      .attr("height", "160%");
    sg.append("feGaussianBlur").attr("stdDeviation", "1.5").attr("result", "b");
    const sm = sg.append("feMerge");
    sm.append("feMergeNode").attr("in", "b");
    sm.append("feMergeNode").attr("in", "SourceGraphic");

    // core radial gradient
    const cg = defs.append("radialGradient").attr("id", "coreG");
    cg.append("stop").attr("offset", "0%").attr("stop-color", "rgba(217,70,239,0.30)");
    cg.append("stop").attr("offset", "100%").attr("stop-color", "rgba(139,92,246,0.05)");

    // background radial gradient
    const bg = defs.append("radialGradient").attr("id", "bgG");
    bg.append("stop").attr("offset", "0%").attr("stop-color", "rgba(139,92,246,0.06)");
    bg.append("stop").attr("offset", "80%").attr("stop-color", "transparent");

    /* ── background glow ── */
    svg
      .append("circle")
      .attr("cx", C)
      .attr("cy", C)
      .attr("r", RO + 4)
      .attr("fill", "url(#bgG)");

    /* ── zodiac segments (coloured arcs) ── */
    const segAngle = (Math.PI * 2) / 12;
    const arcFn = d3.arc().innerRadius(RZI).outerRadius(RO);
    const zodiacG = svg.append("g");

    ZODIAC.forEach((z, i) => {
      const e = ELEM[z.element];

      // arc segment
      zodiacG
        .append("path")
        .attr(
          "d",
          arcFn({
            startAngle: i * segAngle,
            endAngle: (i + 1) * segAngle,
            innerRadius: RZI,
            outerRadius: RO,
          })
        )
        .attr("transform", `translate(${C},${C})`)
        .attr("fill", e.fill)
        .attr("stroke", e.stroke)
        .attr("stroke-width", 0.5);

      // zodiac symbol
      const [sx, sy] = polar(i * 30 + 15, (RZI + RO) / 2);
      zodiacG
        .append("text")
        .attr("x", sx)
        .attr("y", sy)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-size", 13)
        .attr("font-family", "serif")
        .attr("fill", e.stroke)
        .text(z.symbol);
    });

    /* ── structural circles ── */
    svg
      .append("circle")
      .attr("cx", C)
      .attr("cy", C)
      .attr("r", RO)
      .attr("fill", "none")
      .attr("stroke", "rgba(139,92,246,0.20)")
      .attr("stroke-width", 0.5);

    svg
      .append("circle")
      .attr("cx", C)
      .attr("cy", C)
      .attr("r", RZI)
      .attr("fill", "none")
      .attr("stroke", "rgba(139,92,246,0.25)")
      .attr("stroke-width", 1);

    svg
      .append("circle")
      .attr("cx", C)
      .attr("cy", C)
      .attr("r", RHI)
      .style("fill", "var(--card, rgba(15,15,46,0.95))")
      .attr("stroke", "rgba(139,92,246,0.35)")
      .attr("stroke-width", 1);

    /* ── house dividers ── */
    for (let i = 0; i < 12; i++) {
      const [x1, y1] = polar(i * 30, RHI);
      const [x2, y2] = polar(i * 30, RZI);
      svg
        .append("line")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke", "rgba(139,92,246,0.15)")
        .attr("stroke-width", 0.8);
    }

    /* ── degree ticks ── */
    for (let d = 0; d < 360; d += 5) {
      const major = d % 30 === 0;
      const mid = d % 10 === 0;
      const ri = major ? RZI - 6 : mid ? RZI - 4 : RZI - 2;
      const [x1, y1] = polar(d, ri);
      const [x2, y2] = polar(d, RZI);
      svg
        .append("line")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke", major ? "rgba(139,92,246,0.30)" : "rgba(139,92,246,0.10)")
        .attr("stroke-width", major ? 0.8 : 0.4);
    }

    /* ── aspect lines (glow) ── */
    const aspG = svg.append("g").attr("filter", "url(#sglow)");
    ASPECTS.forEach((asp) => {
      const [x1, y1] = polar(PLANETS[asp.a].deg, RHI - 4);
      const [x2, y2] = polar(PLANETS[asp.b].deg, RHI - 4);
      const line = aspG
        .append("line")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke", asp.col)
        .attr("stroke-width", asp.dashed ? 0.8 : 1);
      if (asp.dashed) line.attr("stroke-dasharray", "4,3");
    });

    /* ── planet orbit ring ── */
    svg
      .append("circle")
      .attr("cx", C)
      .attr("cy", C)
      .attr("r", RP)
      .attr("fill", "none")
      .attr("stroke", "rgba(139,92,246,0.08)")
      .attr("stroke-width", 0.5)
      .attr("stroke-dasharray", "2,4");

    /* ── planets with glow ── */
    PLANETS.forEach((p) => {
      const [px, py] = polar(p.deg, RP);

      // outer glow halo
      svg
        .append("circle")
        .attr("cx", px)
        .attr("cy", py)
        .attr("r", 15)
        .attr("fill", p.col)
        .attr("opacity", 0.12)
        .attr("filter", "url(#glow)");

      // planet disc
      svg
        .append("circle")
        .attr("cx", px)
        .attr("cy", py)
        .attr("r", 11)
        .attr("fill", "rgba(15,15,46,0.95)")
        .attr("stroke", p.col)
        .attr("stroke-width", 1.5)
        .attr("filter", "url(#glow)");

      // symbol
      svg
        .append("text")
        .attr("x", px)
        .attr("y", py)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-size", 10)
        .attr("font-family", "serif")
        .attr("fill", p.col)
        .text(p.sym);
    });

    /* ── ASC marker (left / 270°) ── */
    const [ax1, ay1] = polar(270, RZI);
    const [ax2, ay2] = polar(270, RHI + 6);
    svg
      .append("line")
      .attr("x1", ax1)
      .attr("y1", ay1)
      .attr("x2", ax2)
      .attr("y2", ay2)
      .attr("stroke", "rgba(217,70,239,0.7)")
      .attr("stroke-width", 2);
    svg
      .append("text")
      .attr("x", ax2 + 4)
      .attr("y", ay2)
      .attr("text-anchor", "start")
      .attr("dominant-baseline", "central")
      .attr("font-size", 8)
      .attr("font-weight", "bold")
      .attr("font-family", "sans-serif")
      .attr("fill", "rgba(217,70,239,0.9)")
      .text("ASC");

    /* ── core ── */
    svg
      .append("circle")
      .attr("cx", C)
      .attr("cy", C)
      .attr("r", RC)
      .attr("fill", "url(#coreG)")
      .attr("stroke", "rgba(217,70,239,0.5)")
      .attr("stroke-width", 1);

    /* ── animated pulse ring ── */
    const pulse = svg
      .append("circle")
      .attr("cx", C)
      .attr("cy", C)
      .attr("r", RC)
      .attr("fill", "none")
      .attr("stroke", "rgba(217,70,239,0.6)")
      .attr("stroke-width", 1)
      .node()!;

    const animR = document.createElementNS("http://www.w3.org/2000/svg", "animate");
    animR.setAttribute("attributeName", "r");
    animR.setAttribute("values", `${RC};${RC + 10};${RC}`);
    animR.setAttribute("dur", "3s");
    animR.setAttribute("repeatCount", "indefinite");
    pulse.appendChild(animR);

    const animO = document.createElementNS("http://www.w3.org/2000/svg", "animate");
    animO.setAttribute("attributeName", "opacity");
    animO.setAttribute("values", "0.6;0;0.6");
    animO.setAttribute("dur", "3s");
    animO.setAttribute("repeatCount", "indefinite");
    pulse.appendChild(animO);
  }, []);

  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-cosmic-500/20 blur-3xl" />
      <svg
        ref={ref}
        viewBox={`0 0 ${S} ${S}`}
        width="320"
        height="320"
        className="relative drop-shadow-[0_0_40px_rgba(139,92,246,0.5)]"
        aria-hidden="true"
      />
    </div>
  );
}
