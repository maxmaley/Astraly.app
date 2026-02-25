"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  twinkleSpeed: number;
  phase: number;
}

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let stars: Star[] = [];

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
      generate();
    }

    function generate() {
      if (!canvas) return;
      const density = Math.floor((canvas.width * canvas.height) / 4000);
      stars = Array.from({ length: Math.min(density, 300) }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.8 + 0.3,
        baseOpacity: Math.random() * 0.6 + 0.2,
        twinkleSpeed: Math.random() * 0.015 + 0.003,
        phase: Math.random() * Math.PI * 2,
      }));
    }

    function draw(t: number) {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const s of stars) {
        const opacity = s.baseOpacity * (0.5 + 0.5 * Math.sin(t * s.twinkleSpeed + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${opacity})`;
        ctx.fill();
      }

      // A few larger bright stars with a glow
      for (const s of stars.slice(0, 20)) {
        const opacity = 0.4 * Math.abs(Math.sin(t * s.twinkleSpeed * 0.5 + s.phase));
        const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 4);
        grd.addColorStop(0, `rgba(167,139,250,${opacity})`);
        grd.addColorStop(1, "rgba(167,139,250,0)");
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(document.documentElement);
    animId = requestAnimationFrame(draw);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 opacity-70"
      aria-hidden="true"
    />
  );
}
