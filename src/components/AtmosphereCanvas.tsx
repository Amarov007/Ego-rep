import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  tint: string;
}

/**
 * Ambient obsidian atmosphere:
 * - Slow drifting dust & ash stipples on canvas (respects prefers-reduced-motion)
 * - Subtle film grain overlay
 * - Deep studio vignette
 */
export const AtmosphereCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animId = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const count = Math.min(54, Math.max(26, Math.floor((width * height) / 14000)));
    const tints = [
      '237, 234, 228', // bone white
      '237, 234, 228',
      '237, 234, 228',
      '193, 18, 31',   // rare blood red speck
      '95, 227, 255',  // rare cold cyan speck
    ];

    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.14,
      vy: -(0.06 + Math.random() * 0.18),
      size: Math.random() < 0.8 ? 1 : 1.6,
      alpha: 0.08 + Math.random() * 0.24,
      tint: tints[Math.floor(Math.random() * tints.length)],
    }));

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        ctx.fillStyle = `rgba(${p.tint}, ${p.alpha})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
    };

    if (prefersReduced) {
      drawStatic();
      return () => {
        window.removeEventListener('resize', resize);
      };
    }

    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -4) {
          p.y = height + 4;
          p.x = Math.random() * width;
        }
        if (p.x < -4) p.x = width + 4;
        if (p.x > width + 4) p.x = -4;

        ctx.fillStyle = `rgba(${p.tint}, ${p.alpha})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      animId = window.requestAnimationFrame(tick);
    };

    animId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none w-full h-full"
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 z-[1] pointer-events-none ego-grain opacity-[0.055] mix-blend-overlay"
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 z-[2] pointer-events-none ego-vignette"
        aria-hidden="true"
      />
    </>
  );
};
