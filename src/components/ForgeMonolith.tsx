import React, { useState } from 'react';

interface ForgeMonolithProps {
  /** 0..1 charge fill ratio over the 6-hour forge cycle */
  progress: number;
  /** Current Forge level (1..8) intensifies internal fissure density */
  forgeLevel: number;
  /** Increments on Claim to fire the vertical beam eruption */
  claimPulseKey: number;
  /** Whether Forge is at 100% full charge */
  isFull: boolean;
  /** Optional tap handler when user strikes the monolith */
  onStrike?: () => void;
  /** Subtle prompt label below the monolith */
  hintLabel?: string;
}

/**
 * The Forge — Interactive Cracked Basalt Monolith
 * - Subtle 3D pointer tilt for tactile physical weight
 * - Tapping/striking triggers fissure flare, hairline shockwave ring, and haptics
 * - Rising fine light embers proportional to Forge charge
 * - Taut crimson red (#C1121F) ropes bound across chiseled dark basalt
 */
export const ForgeMonolith: React.FC<ForgeMonolithProps> = ({
  progress,
  forgeLevel,
  claimPulseKey,
  isFull,
  onStrike,
  hintLabel,
}) => {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [strikeKey, setStrikeKey] = useState(0);
  const [isPressed, setIsPressed] = useState(false);

  const clamped = Math.min(1, Math.max(0, progress));
  const crackOpacity = Math.min(1, 0.22 + clamped * 0.78 + (isPressed ? 0.18 : 0));
  const glowStrength = Math.min(0.85, 0.14 + clamped * 0.44 + (isPressed ? 0.2 : 0));
  const levelIntensity = Math.min(1, 0.42 + (forgeLevel - 1) * 0.09);

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: -ny * 5.5, ry: nx * 6.5 });
  };

  const handlePointerLeave = () => {
    setTilt({ rx: 0, ry: 0 });
    setIsPressed(false);
  };

  const handleStrike = () => {
    setStrikeKey((k) => k + 1);
    onStrike?.();
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center select-none py-2">
      <button
        type="button"
        onClick={handleStrike}
        onPointerMove={handlePointerMove}
        onPointerDown={() => setIsPressed(true)}
        onPointerUp={() => setIsPressed(false)}
        onPointerLeave={handlePointerLeave}
        aria-label="Strike The Forge monolith"
        className="group relative w-full flex items-center justify-center py-2 cursor-pointer focus-visible:outline-none"
        style={{ perspective: '900px' }}
      >
        {/* Architectural registration corner marks framing the monolith stage */}
        <span
          className="pointer-events-none absolute top-2 start-2 w-3 h-3 border-t border-s border-[#F2EFE9]/22 transition-colors duration-300 group-hover:border-[#5FE3FF]/55"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute top-2 end-2 w-3 h-3 border-t border-e border-[#F2EFE9]/22 transition-colors duration-300 group-hover:border-[#5FE3FF]/55"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute bottom-2 start-2 w-3 h-3 border-b border-s border-[#F2EFE9]/22 transition-colors duration-300 group-hover:border-[#C1121F]/65"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute bottom-2 end-2 w-3 h-3 border-b border-e border-[#F2EFE9]/22 transition-colors duration-300 group-hover:border-[#C1121F]/65"
          aria-hidden="true"
        />

        {/* Atmospheric backlight leaking from behind the monolith */}
        <div
          className="absolute inset-x-8 top-4 bottom-4 pointer-events-none transition-opacity duration-500 animate-ego-breathe"
          style={{
            opacity: glowStrength,
            background: isFull
              ? 'radial-gradient(ellipse 48% 66% at 50% 48%, rgba(95, 227, 255, 0.38), rgba(45, 107, 255, 0.16) 48%, transparent 74%)'
              : 'radial-gradient(ellipse 44% 62% at 50% 52%, rgba(45, 107, 255, 0.28), rgba(193, 18, 31, 0.12) 52%, transparent 74%)',
          }}
          aria-hidden="true"
        />

        {/* Tactile strike hairline resonance ring */}
        {strikeKey > 0 && (
          <span
            key={`strike-${strikeKey}`}
            className="pointer-events-none absolute w-[190px] h-[190px] border border-[#5FE3FF]/45 rounded-full animate-resonance-ring"
            aria-hidden="true"
          />
        )}

        {/* Claim vertical beam eruption */}
        {claimPulseKey > 0 && (
          <div
            key={`beam-${claimPulseKey}`}
            className="absolute inset-y-[-28px] left-1/2 -translate-x-1/2 w-[64px] pointer-events-none animate-beam-erupt z-20"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(45,107,255,0.32) 26%, rgba(95,227,255,0.82) 46%, rgba(242,239,233,1) 50%, rgba(95,227,255,0.82) 54%, rgba(193,18,31,0.36) 74%, transparent 100%)',
            }}
            aria-hidden="true"
          />
        )}

        {/* 3D Tiltable Monolith SVG */}
        <div
          className="relative z-10 transition-transform duration-300"
          style={{
            transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${
              isPressed ? 0.975 : 1
            })`,
            transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <svg
            viewBox="0 0 264 282"
            className="w-[244px] h-[260px] sm:w-[270px] sm:h-[286px] overflow-visible"
            role="img"
            aria-label="The Forge cracked stone monolith"
          >
            <defs>
              <filter id="monolith-stone" x="-5%" y="-5%" width="110%" height="110%">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.62"
                  numOctaves="4"
                  seed="7"
                  result="noise"
                />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0.20
                          0 0 0 0 0.20
                          0 0 0 0 0.22
                          0 0 0 0.36 0"
                  in="noise"
                  result="tintedNoise"
                />
                <feComposite in="tintedNoise" in2="SourceGraphic" operator="in" result="clippedNoise" />
                <feBlend in="SourceGraphic" in2="clippedNoise" mode="screen" />
              </filter>

              <filter id="crack-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur
                  stdDeviation={2 + clamped * 3.4 + (isPressed ? 1.5 : 0)}
                  result="blur"
                />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <linearGradient id="slab-front" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#24252B" />
                <stop offset="48%" stopColor="#14151A" />
                <stop offset="100%" stopColor="#08080B" />
              </linearGradient>

              <linearGradient id="slab-side" x1="0" y1="0" x2="1" y2="0.6">
                <stop offset="0%" stopColor="#31333B" />
                <stop offset="100%" stopColor="#0E0F13" />
              </linearGradient>

              <linearGradient id="slab-top" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3E4049" />
                <stop offset="100%" stopColor="#191A20" />
              </linearGradient>

              <linearGradient id="fissure-light" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#F2EFE9" />
                <stop offset="42%" stopColor="#5FE3FF" />
                <stop offset="80%" stopColor="#2D6BFF" />
                <stop offset="100%" stopColor={isFull ? '#F2EFE9' : '#2D6BFF'} />
              </linearGradient>

              <clipPath id="charge-fill-clip">
                <rect
                  x="40"
                  y={248 - clamped * 226}
                  width="184"
                  height={clamped * 226 + 4}
                />
              </clipPath>
            </defs>

            {/* Horizon & pedestal shadow */}
            <line
              x1="22"
              y1="254"
              x2="242"
              y2="254"
              stroke="rgba(242,239,233,0.16)"
              strokeWidth="0.8"
            />
            <ellipse cx="128" cy="254" rx="68" ry="5.5" fill="#000000" opacity="0.86" />

            {/* Vertical axis reference */}
            <line
              x1="128"
              y1="6"
              x2="128"
              y2="268"
              stroke="rgba(242,239,233,0.10)"
              strokeWidth="0.75"
              strokeDasharray="2 5"
            />

            {/* MONOLITH BODY */}
            <g filter="url(#monolith-stone)">
              <polygon
                points="74,38 96,22 90,246 68,236"
                fill="url(#slab-side)"
                stroke="rgba(242,239,233,0.18)"
                strokeWidth="0.7"
              />
              <polygon
                points="74,38 96,22 176,30 164,48"
                fill="url(#slab-top)"
                stroke="rgba(242,239,233,0.22)"
                strokeWidth="0.7"
              />
              <polygon
                points="96,22 176,30 186,244 90,246"
                fill="url(#slab-front)"
                stroke="rgba(242,239,233,0.16)"
                strokeWidth="0.75"
              />
              <path
                d="M106 62L148 54 M154 108L176 102 M98 164L126 159 M142 212L178 206"
                stroke="rgba(242,239,233,0.10)"
                strokeWidth="0.7"
              />
            </g>

            {/* DARK CARVED CRACKS */}
            <g stroke="#040405" strokeLinecap="square" fill="none">
              <path
                d="M136 28 L130 66 L144 94 L126 134 L140 172 L124 212 L132 245"
                strokeWidth="3.4"
              />
              <path d="M130 66 L106 82 L96 98" strokeWidth="2" />
              <path d="M144 94 L168 112 L178 118" strokeWidth="1.9" />
              <path d="M126 134 L102 148" strokeWidth="1.8" />
              <path d="M140 172 L170 184 L181 194" strokeWidth="2" />
            </g>

            {/* LUMINOUS LIGHT LEAKING THROUGH CRACKS */}
            <g
              clipPath="url(#charge-fill-clip)"
              filter="url(#crack-glow)"
              opacity={crackOpacity}
              className="transition-opacity duration-500"
            >
              <path
                d="M136 28 L130 66 L144 94 L126 134 L140 172 L124 212 L132 245"
                stroke="url(#fissure-light)"
                strokeWidth={1.6 + clamped * 1.5}
                fill="none"
              />
              <path
                d="M130 66 L106 82 L96 98"
                stroke="#5FE3FF"
                strokeWidth={1 + clamped * 0.65}
                opacity={levelIntensity}
                fill="none"
              />
              <path
                d="M144 94 L168 112 L178 118"
                stroke="#2D6BFF"
                strokeWidth={1 + clamped * 0.7}
                opacity={levelIntensity}
                fill="none"
              />
              <path
                d="M126 134 L102 148"
                stroke="#F2EFE9"
                strokeWidth={0.9 + clamped * 0.55}
                opacity={0.8}
                fill="none"
              />
              <path
                d="M140 172 L170 184 L181 194"
                stroke="#5FE3FF"
                strokeWidth={1 + clamped * 0.65}
                opacity={levelIntensity}
                fill="none"
              />
              <path
                d="M136 28 L130 66 L144 94 L126 134 L140 172 L124 212 L132 245"
                stroke="#F2EFE9"
                strokeWidth={0.65 + clamped * 0.6}
                opacity={0.65 + clamped * 0.35}
                fill="none"
              />
            </g>

            {/* Rising subtle light motes escaping the central fissure */}
            <g fill="#5FE3FF" opacity={0.25 + clamped * 0.55}>
              <rect x="131" y="138" width="1.6" height="1.6" className="animate-ember-rise" />
              <rect
                x="140"
                y="174"
                width="1.4"
                height="1.4"
                fill="#F2EFE9"
                className="animate-ember-rise"
                style={{ animationDelay: '1.1s' }}
              />
              <rect
                x="126"
                y="96"
                width="1.5"
                height="1.5"
                fill="#C1121F"
                className="animate-ember-rise"
                style={{ animationDelay: '2.2s' }}
              />
            </g>

            {/* TAUT BLOOD-RED ROPES BOUND ACROSS THE MONOLITH */}
            <g>
              <g stroke="#050506" strokeWidth="3.4" opacity="0.7" fill="none">
                <path d="M70 84 L94 78 L180 124" />
                <path d="M72 156 L92 150 L182 96" />
                <path d="M69 198 L91 194 L184 214" />
                <path d="M90 228 L181 164" />
              </g>
              <g stroke="#C1121F" strokeWidth="1.8" strokeLinecap="round" fill="none">
                <path d="M70 82 L94 76 L180 122" />
                <path d="M72 154 L92 148 L182 94" />
                <path d="M69 196 L91 192 L184 212" />
                <path d="M90 226 L181 162" />
              </g>
              <g stroke="#FF5E6A" strokeWidth="0.55" opacity="0.6" fill="none">
                <path d="M94 75.5 L180 121.5" />
                <path d="M92 147.5 L182 93.5" />
              </g>
            </g>

            {/* RIGHT VERTICAL HAIRLINE CHARGE GAUGE */}
            <g transform="translate(224, 34)">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="208"
                stroke="rgba(242,239,233,0.18)"
                strokeWidth="1.4"
              />
              <line
                x1="0"
                y1={208 - clamped * 208}
                x2="0"
                y2="208"
                stroke={isFull ? '#5FE3FF' : '#F2EFE9'}
                strokeWidth="2.4"
              />
              <line
                x1="-5"
                y1={208 - clamped * 208}
                x2="5"
                y2={208 - clamped * 208}
                stroke={isFull ? '#5FE3FF' : '#C1121F'}
                strokeWidth="1.4"
              />
              <text
                x="9"
                y={Math.min(206, Math.max(12, 208 - clamped * 208 + 3))}
                fill="#F2EFE9"
                fontSize="10.5"
                fontWeight="500"
                fontFamily="JetBrains Mono, monospace"
              >
                {Math.round(clamped * 100)}%
              </text>
            </g>

            {/* LEFT VERTICAL MONOLITH LEVEL INDEX */}
            <g transform="translate(32, 42)">
              <text
                x="0"
                y="0"
                fill="rgba(242,239,233,0.52)"
                fontSize="9.5"
                fontWeight="500"
                fontFamily="JetBrains Mono, monospace"
                letterSpacing="2.2"
                transform="rotate(-90 0 0) translate(-118, 0)"
              >
                MONOLITH · 0{forgeLevel}
              </text>
            </g>
          </svg>
        </div>
      </button>

      {hintLabel && (
        <span className="mt-0.5 font-mono-tech text-[10px] tracking-[0.2em] text-[#F2EFE9]/48">
          {hintLabel}
        </span>
      )}
    </div>
  );
};
