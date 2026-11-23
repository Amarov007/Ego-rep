import React, { useEffect, useRef, useState } from 'react';
import { Dictionary } from '../i18n/translations';
import { Language } from '../types';
import { sound } from '../services/sound';
import { haptics } from '../services/telegram';
import { IconSoundOff, IconSoundOn } from './Icons';

interface IntroScreenProps {
  t: Dictionary;
  language: Language;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onToggleLanguage: () => void;
  onEnter: () => void;
}

/**
 * First-Launch Intro Screen
 * Three vertical light beams (bone white / blood red / electric blue)
 * rising above craggy obsidian water and crowned by sculpted E · G · O typography.
 */
export const IntroScreen: React.FC<IntroScreenProps> = ({
  t,
  language,
  soundEnabled,
  onToggleSound,
  onToggleLanguage,
  onEnter,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stage, setStage] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setStage(1), 180),
      window.setTimeout(() => setStage(2), 620),
      window.setTimeout(() => setStage(3), 1040),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

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

    const beams = [
      { offset: -0.145, rgb: '242, 239, 233', glow: '242, 239, 233', phase: 0.0 },
      { offset: 0.0, rgb: '193, 18, 31', glow: '193, 18, 31', phase: 1.4 },
      { offset: 0.145, rgb: '45, 107, 255', glow: '45, 107, 255', phase: 2.8 },
    ];

    const renderFrame = (timeMs: number) => {
      const tSec = timeMs * 0.001;
      ctx.clearRect(0, 0, width, height);

      const horizonY = height * 0.64;
      const beamSpan = Math.min(width * 0.72, 340);

      for (const b of beams) {
        const bx = width * 0.5 + b.offset * beamSpan * 2.1;
        const breathe = prefersReduced ? 1 : 0.86 + Math.sin(tSec * 0.9 + b.phase) * 0.14;

        const aura = ctx.createRadialGradient(bx, horizonY - 12, 2, bx, horizonY - 12, 128);
        aura.addColorStop(0, `rgba(${b.glow}, ${0.38 * breathe})`);
        aura.addColorStop(0.45, `rgba(${b.glow}, ${0.12 * breathe})`);
        aura.addColorStop(1, 'rgba(5, 5, 6, 0)');
        ctx.fillStyle = aura;
        ctx.fillRect(bx - 135, horizonY - 145, 270, 165);

        const beamTop = height * 0.34;
        const beamGrad = ctx.createLinearGradient(bx, horizonY, bx, beamTop);
        beamGrad.addColorStop(0, `rgba(${b.rgb}, ${0.98 * breathe})`);
        beamGrad.addColorStop(0.55, `rgba(${b.rgb}, ${0.46 * breathe})`);
        beamGrad.addColorStop(1, `rgba(${b.rgb}, 0)`);

        ctx.fillStyle = beamGrad;
        ctx.globalAlpha = 0.28;
        ctx.fillRect(bx - 5.5, beamTop, 11, horizonY - beamTop);

        ctx.globalAlpha = 1;
        ctx.fillRect(bx - 1.1, beamTop + 16, 2.2, horizonY - beamTop - 16);
      }

      ctx.fillStyle = '#050506';
      ctx.beginPath();
      ctx.moveTo(0, horizonY + 4);
      const ridgeSteps = 28;
      for (let i = 0; i <= ridgeSteps; i++) {
        const rx = (width / ridgeSteps) * i;
        const distFromCenter = Math.abs(rx - width * 0.5) / (width * 0.5);
        const crag =
          Math.sin(i * 1.9) * 9 +
          Math.cos(i * 3.7) * 6 +
          distFromCenter * 22;
        ctx.lineTo(rx, horizonY - Math.max(0, crag * 0.65));
      }
      ctx.lineTo(width, horizonY + 10);
      ctx.lineTo(0, horizonY + 10);
      ctx.closePath();
      ctx.fill();

      const waterGrad = ctx.createLinearGradient(0, horizonY, 0, height);
      waterGrad.addColorStop(0, 'rgba(7, 7, 10, 0.96)');
      waterGrad.addColorStop(1, 'rgba(5, 5, 6, 1)');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, horizonY + 2, width, height - horizonY);

      const rippleRows = 44;
      const waterDepth = height - horizonY;
      for (const b of beams) {
        const bx = width * 0.5 + b.offset * beamSpan * 2.1;
        for (let r = 0; r < rippleRows; r++) {
          const frac = r / rippleRows;
          const ry = horizonY + 6 + Math.pow(frac, 1.25) * (waterDepth * 0.85);
          const drift = prefersReduced
            ? Math.sin(r * 1.3) * 4
            : Math.sin(tSec * 1.6 + r * 0.72 + b.phase) * (3 + frac * 14);
          const segWidth = (4 + frac * 26) * (0.65 + 0.35 * Math.cos(r * 2.1 + b.phase));
          const segAlpha = Math.max(0, (1 - frac) * 0.66);

          ctx.fillStyle = `rgba(${b.rgb}, ${segAlpha.toFixed(3)})`;
          ctx.fillRect(bx + drift - segWidth * 0.5, ry, segWidth, 1.4);
        }
      }

      if (!prefersReduced) {
        animId = window.requestAnimationFrame(renderFrame);
      }
    };

    animId = window.requestAnimationFrame(renderFrame);

    return () => {
      window.cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleEnter = () => {
    if (exiting) return;
    haptics.introEnter();
    sound.enter();
    setExiting(true);
    window.setTimeout(() => {
      onEnter();
    }, 480);
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#050506] flex flex-col justify-between overflow-hidden transition-opacity duration-500 ${
        exiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      />

      {/* Top minimal bar */}
      <div className="relative z-10 pt-safe px-6 flex items-center justify-between">
        <span className="font-mono-tech text-[11px] font-medium tracking-editorial text-[#F2EFE9]/62">
          E G O · R E P
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            aria-pressed={soundEnabled}
            className="ego-btn-secondary min-h-[38px] min-w-[38px] flex items-center justify-center text-[#F2EFE9]/82 hover:text-[#F2EFE9] cursor-pointer"
          >
            {soundEnabled ? <IconSoundOn /> : <IconSoundOff />}
          </button>
          <button
            type="button"
            onClick={onToggleLanguage}
            className="ego-btn-secondary min-h-[38px] px-3.5 flex items-center justify-center font-mono-tech text-[11px] font-medium tracking-[0.14em] text-[#F2EFE9]/86 hover:text-[#F2EFE9] cursor-pointer"
          >
            {language === 'en' ? 'عربي' : 'EN'}
          </button>
        </div>
      </div>

      {/* Center-upper editorial E · G · O triad */}
      <div className="relative z-10 flex flex-col items-center px-6 -mt-20">
        <div
          className={`grid grid-cols-3 gap-6 sm:gap-12 w-full max-w-[360px] transition-all duration-700 ${
            stage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
        >
          <div className="flex flex-col items-center text-center">
            <span className="font-editorial text-[56px] sm:text-[66px] leading-none font-normal text-[#F2EFE9]">
              E
            </span>
            <span className="mt-2.5 font-mono-tech text-[11px] font-medium tracking-[0.18em] text-[#F2EFE9]/90">
              {t.intro.execute}
            </span>
            <span className="mt-2.5 block w-9 h-[1.5px] bg-[#F2EFE9]/80" />
          </div>

          <div className="flex flex-col items-center text-center">
            <span className="font-editorial text-[56px] sm:text-[66px] leading-none font-normal text-[#C1121F]">
              G
            </span>
            <span className="mt-2.5 font-mono-tech text-[11px] font-medium tracking-[0.18em] text-[#E62836]">
              {t.intro.growth}
            </span>
            <span className="mt-2.5 block w-9 h-[1.5px] bg-[#C1121F]" />
          </div>

          <div className="flex flex-col items-center text-center">
            <span className="font-editorial text-[56px] sm:text-[66px] leading-none font-normal text-[#2D6BFF]">
              O
            </span>
            <span className="mt-2.5 font-mono-tech text-[11px] font-medium tracking-[0.18em] text-[#5C8FFF]">
              {t.intro.obsession}
            </span>
            <span className="mt-2.5 block w-9 h-[1.5px] bg-[#2D6BFF]" />
          </div>
        </div>

        <p
          className={`mt-8 font-mono-tech text-[11px] font-medium tracking-[0.3em] text-[#F2EFE9]/68 transition-opacity duration-700 ${
            stage >= 2 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {t.intro.subtitle}
        </p>
      </div>

      {/* Bottom ENTER modern rounded interactive trigger */}
      <div
        className={`relative z-10 pb-safe px-6 mb-8 flex flex-col items-center transition-all duration-700 ${
          stage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
      >
        <button
          type="button"
          onClick={handleEnter}
          className="ego-btn-primary group relative w-full max-w-[270px] min-h-[54px] !rounded-full border-[#F2EFE9]/45 hover:border-[#F2EFE9] flex items-center justify-center cursor-pointer"
        >
          <span className="font-mono-tech text-[12px] font-semibold tracking-[0.34em] text-[#F2EFE9]">
            {t.intro.enter}
          </span>
        </button>
      </div>
    </div>
  );
};
