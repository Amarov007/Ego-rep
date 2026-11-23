import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Dictionary } from '../i18n/translations';
import { GameState, Language, RepPillar } from '../types';
import {
  calculateForgeCharge,
  calculateMiningRate,
  formatCountdown,
  formatEgo,
} from '../utils/gameMath';
import { haptics } from '../services/telegram';
import { CountUpNumber } from './CountUpNumber';
import { ForgeMilestones } from './ForgeMilestones';
import { ForgeMonolith } from './ForgeMonolith';
import { ForgeSparkline } from './ForgeSparkline';
import { IconCheck } from './Icons';

interface ForgeScreenProps {
  state: GameState;
  nowMs: number;
  t: Dictionary;
  language: Language;
  claimPulseKey: number;
  lastClaimDelta: number | null;
  onClaim: () => void;
  onCompleteRep: (pillar: RepPillar) => void;
  onMonolithStrike: () => void;
  onUpgradeForge: (targetLevel: number) => void;
  onOpenUpgrade: () => void;
  onOpenRanks: () => void;
}

const REP_PILLARS: {
  id: RepPillar;
  letter: string;
  labelKey: 'repExecute' | 'repGrowth' | 'repObsession';
  accent: string;
  dimGlow: string;
}[] = [
  {
    id: 'execute',
    letter: 'E',
    labelKey: 'repExecute',
    accent: '#F2EFE9',
    dimGlow: 'rgba(242, 239, 233, 0.16)',
  },
  {
    id: 'growth',
    letter: 'G',
    labelKey: 'repGrowth',
    accent: '#C1121F',
    dimGlow: 'rgba(193, 18, 31, 0.28)',
  },
  {
    id: 'obsession',
    letter: 'O',
    labelKey: 'repObsession',
    accent: '#2D6BFF',
    dimGlow: 'rgba(45, 107, 255, 0.28)',
  },
];

/**
 * Forge (Home Screen)
 * Sculpted balance, interactive basalt monolith, modern rounded interactive CTAs,
 * Daily Reps strips, 7-Day Mining Sparkline, and Forge Milestones timeline.
 */
export const ForgeScreen: React.FC<ForgeScreenProps> = ({
  state,
  nowMs,
  t,
  language,
  claimPulseKey,
  lastClaimDelta,
  onClaim,
  onCompleteRep,
  onMonolithStrike,
  onUpgradeForge,
  onOpenUpgrade,
  onOpenRanks,
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const rate = calculateMiningRate(state);
  const charge = calculateForgeCharge(state, nowMs);
  const completedRepsCount = Object.values(state.repsCompleted).filter(Boolean).length;
  const allThreeDone = completedRepsCount === 3;

  const handleClaimClick = () => {
    if (!charge.canClaim) return;
    onClaim();
  };

  const monolithHint = charge.isFull
    ? language === 'ar'
      ? 'اضغط على المسلّة أو استلم الآن'
      : 'TAP MONOLITH OR CLAIM BELOW'
    : language === 'ar'
    ? 'اضغط على المسلّة لاختبار الرنين'
    : 'TAP MONOLITH TO RESONATE';

  return (
    <div className="w-full max-w-5xl mx-auto px-5 pt-5 pb-28 lg:grid lg:grid-cols-12 lg:gap-12 lg:items-start">
      {/* LEFT / PRIMARY EDITORIAL COLUMN */}
      <div className="lg:col-span-7 flex flex-col">
        {/* Giant Balance Header */}
        <section className="relative ego-keylight pt-2 pb-5 border-b border-hairline">
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono-tech text-[11px] font-medium tracking-[0.24em] text-[#F2EFE9]/68">
              {t.forge.balanceLabel}
            </span>
            <span className="font-mono-tech text-[11px] font-medium tracking-[0.18em] text-[#34D399] whitespace-nowrap">
              {t.forge.miningActive}
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline gap-3.5 overflow-hidden">
            <h1 className="font-editorial text-[56px] sm:text-[72px] leading-[0.94] font-normal tracking-[-0.025em] text-[#F2EFE9]">
              <CountUpNumber value={state.egoBalance} decimals={2} />
            </h1>
            {lastClaimDelta !== null && (
              <span
                key={`claim-delta-${claimPulseKey}`}
                className="font-mono-tech text-[13px] font-medium text-[#5FE3FF] whitespace-nowrap transition-opacity duration-700"
              >
                +{formatEgo(lastClaimDelta, 2)}
              </span>
            )}
          </div>

          {/* Hourly rate & rounded interactive multiplier inspector trigger */}
          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 font-mono-tech text-[12px] text-[#F2EFE9]/78">
              <span className="tabular-nums font-medium text-[#F2EFE9]">
                +{formatEgo(rate.effectiveEgoPerHour, 1)}{' '}
                <span className="text-[#F2EFE9]/58 font-normal">{t.forge.perHour}</span>
              </span>
              <span className="text-[#F2EFE9]/25" aria-hidden="true">
                /
              </span>
              <span className="tabular-nums text-[#F2EFE9]/72">
                {t.forge.levelShort} 0{state.forgeLevel}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                haptics.toggle(!showBreakdown);
                setShowBreakdown((v) => !v);
              }}
              aria-expanded={showBreakdown}
              className="ego-btn-secondary min-h-[34px] px-3.5 font-mono-tech text-[11px] font-medium tabular-nums text-[#5FE3FF] cursor-pointer whitespace-nowrap"
            >
              ×{rate.totalMultiplier.toFixed(2)} {showBreakdown ? '−' : '+'}
            </button>
          </div>

          {/* Expandable Multiplier Breakdown */}
          <AnimatePresence initial={false}>
            {showBreakdown && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-3.5 pt-3 border-t border-hairline grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-tech text-[11px]">
                  <div>
                    <div className="text-[10px] tracking-[0.16em] text-[#F2EFE9]/52">
                      {language === 'ar' ? 'الأساس' : 'BASE'}
                    </div>
                    <div className="mt-1 text-[#F2EFE9] tabular-nums">
                      {rate.baseEgoPerHour}/hr
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-[0.16em] text-[#F2EFE9]/52">
                      {language === 'ar' ? 'السلسلة' : 'STREAK'}
                    </div>
                    <div className="mt-1 text-[#F2EFE9] tabular-nums">
                      ×{rate.streakMultiplier.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-[0.16em] text-[#F2EFE9]/52">
                      {language === 'ar' ? 'حزم TON' : 'TON BOOST'}
                    </div>
                    <div className="mt-1 text-[#5FE3FF] tabular-nums">
                      ×{rate.tonMultiplier.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-[0.16em] text-[#F2EFE9]/52">
                      {language === 'ar' ? 'الدائرة والرتبة' : 'CIRCLE · RANK'}
                    </div>
                    <div className="mt-1 text-[#F2EFE9] tabular-nums">
                      ×{(rate.referralMultiplier * rate.rankMultiplier).toFixed(2)}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* THE INTERACTIVE FORGE MONOLITH */}
        <section className="relative my-3">
          <ForgeMonolith
            progress={charge.progress}
            forgeLevel={state.forgeLevel}
            claimPulseKey={claimPulseKey}
            isFull={charge.isFull}
            onStrike={() => {
              if (charge.isFull) {
                handleClaimClick();
              } else {
                onMonolithStrike();
              }
            }}
            hintLabel={monolithHint}
          />

          {/* Live ticking uncollected figure + 6h cycle countdown */}
          <div className="mt-2 ego-panel px-4 py-3.5 flex items-end justify-between gap-4">
            <div>
              <div className="font-mono-tech text-[10px] font-medium tracking-[0.2em] text-[#F2EFE9]/58">
                {t.forge.unclaimedLabel}
              </div>
              <div className="mt-1 font-mono-tech text-[22px] leading-none font-medium tabular-nums text-[#F2EFE9]">
                +{formatEgo(charge.accumulatedEgo, 4)}{' '}
                <span className="text-[11px] font-normal text-[#F2EFE9]/55">$EGO</span>
              </div>
            </div>

            <div className="text-end">
              <div className="font-mono-tech text-[10px] font-medium tracking-[0.2em] text-[#F2EFE9]/58">
                {charge.isFull ? t.forge.tankFull : t.forge.nextCycle}
              </div>
              <div
                className={`mt-1 font-mono-tech text-[17px] leading-none font-medium tabular-nums ${
                  charge.isFull ? 'text-[#5FE3FF]' : 'text-[#F2EFE9]/88'
                }`}
              >
                {charge.isFull ? '00:00:00' : formatCountdown(charge.remainingSeconds)}
              </div>
            </div>
          </div>

          {/* Primary Rounded Interactive CLAIM CTA */}
          <div className="mt-3">
            <button
              type="button"
              onClick={handleClaimClick}
              disabled={!charge.canClaim}
              className={`group relative w-full min-h-[56px] rounded-2xl overflow-hidden flex items-center justify-between px-6 transition-all duration-300 cursor-pointer disabled:cursor-not-allowed ${
                charge.canClaim
                  ? charge.isFull
                    ? 'ego-btn-primary border-[#5FE3FF]/75'
                    : 'ego-btn-primary border-[#F2EFE9]/35'
                  : 'border border-hairline bg-[#09090D] opacity-55'
              }`}
            >
              {/* Subtle animated horizontal fill reflection reflecting current charge */}
              <span
                className="pointer-events-none absolute inset-y-0 start-0 transition-all duration-500"
                style={{
                  width: `${Math.round(charge.progress * 100)}%`,
                  background: charge.isFull
                    ? 'linear-gradient(90deg, rgba(45,107,255,0.16), rgba(95,227,255,0.2))'
                    : 'linear-gradient(90deg, rgba(242,239,233,0.06), rgba(95,227,255,0.08))',
                }}
                aria-hidden="true"
              />

              <span className="relative z-10 font-mono-tech text-[12px] font-semibold tracking-[0.26em] text-[#F2EFE9]">
                {charge.canClaim ? t.forge.claimReady : t.forge.forging}
              </span>

              <span className="relative z-10 font-mono-tech text-[13px] font-medium tabular-nums text-[#F2EFE9]">
                {charge.canClaim
                  ? `+${formatEgo(charge.accumulatedEgo, 2)} $EGO`
                  : formatCountdown(charge.remainingSeconds)}
              </span>
            </button>
          </div>
        </section>

        {/* Forge Milestones Timeline (Upcoming Level EGO / Rank XP Requirements) */}
        <ForgeMilestones
          state={state}
          t={t}
          language={language}
          onUpgradeForge={onUpgradeForge}
          onOpenUpgrade={onOpenUpgrade}
          onOpenRanks={onOpenRanks}
        />
      </div>

      {/* RIGHT / SECONDARY EDITORIAL COLUMN (Daily Reps + Multipliers + 7-Day Sparkline) */}
      <aside className="lg:col-span-5 mt-8 lg:mt-1 flex flex-col">
        {/* Streak Header */}
        <div className="flex items-end justify-between pb-3.5 border-b border-hairline">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono-tech text-[11px] font-medium tracking-[0.24em] text-[#F2EFE9]/78">
                {t.forge.dailyRepsTitle}
              </span>
              <span className="font-mono-tech text-[11px] tabular-nums text-[#5FE3FF]">
                {completedRepsCount}/3
              </span>
            </div>
            <p className="mt-1 font-body text-[12px] text-[#F2EFE9]/62">
              {allThreeDone ? t.forge.allThreeComplete : t.forge.completeAllThree}
            </p>
          </div>

          <div className="text-end shrink-0">
            <div className="font-mono-tech text-[10px] tracking-[0.2em] text-[#F2EFE9]/55">
              {t.forge.streakLabel}
            </div>
            <div className="mt-0.5 font-editorial text-[30px] leading-none text-[#F2EFE9] tabular-nums">
              {String(state.streakDays).padStart(2, '0')}{' '}
              <span className="font-mono-tech text-[11px] tracking-[0.14em] text-[#F2EFE9]/62">
                {t.forge.daysUnit}
              </span>
            </div>
          </div>
        </div>

        {/* 3 Tall Rounded Interactive Daily Rep Strips */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {REP_PILLARS.map((pillar) => {
            const done = state.repsCompleted[pillar.id];
            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => {
                  if (!done) {
                    onCompleteRep(pillar.id);
                  }
                }}
                disabled={done}
                className={`group relative h-[168px] sm:h-[182px] rounded-2xl border flex flex-col justify-between p-3.5 text-start transition-all duration-300 overflow-hidden cursor-pointer disabled:cursor-default ${
                  done
                    ? 'border-[#F2EFE9]/28 bg-[#0E0E15]'
                    : 'border-hairline bg-[#09090D] hover:border-[#F2EFE9]/48 hover:bg-[#101018] active:scale-[0.96]'
                }`}
              >
                {/* Vertical light beam rising from base */}
                <span
                  className="absolute inset-x-0 bottom-0 transition-all duration-700 pointer-events-none"
                  style={{
                    height: done ? '100%' : '20%',
                    background: `linear-gradient(0deg, ${pillar.dimGlow} 0%, transparent 90%)`,
                    opacity: done ? 1 : 0.52,
                  }}
                  aria-hidden="true"
                />

                {/* Top accent light line */}
                <span
                  className="absolute top-0 inset-x-4 h-[2px] rounded-full transition-opacity duration-400"
                  style={{
                    backgroundColor: pillar.accent,
                    opacity: done ? 1 : 0.35,
                  }}
                  aria-hidden="true"
                />

                <div className="relative z-10 flex items-start justify-between">
                  <span
                    className="font-editorial text-[36px] leading-none font-normal transition-colors duration-400"
                    style={{ color: done ? pillar.accent : 'rgba(242,239,233,0.84)' }}
                  >
                    {pillar.letter}
                  </span>
                  {done && <IconCheck className="w-4 h-4 text-[#F2EFE9] mt-1" />}
                </div>

                <div className="relative z-10">
                  <div
                    className="font-mono-tech text-[11px] font-medium tracking-[0.14em] leading-tight transition-colors duration-300"
                    style={{ color: done ? pillar.accent : '#F2EFE9' }}
                  >
                    {t.forge[pillar.labelKey]}
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-hairline flex items-center justify-between font-mono-tech text-[10px] tracking-[0.12em] text-[#F2EFE9]/68">
                    <span>{done ? t.forge.repDone : t.forge.repTap}</span>
                    <span className="tabular-nums text-[#F2EFE9]/82">+20</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Quiet 3-Metric Multiplier Bar */}
        <div className="mt-4 ego-panel px-4 py-3.5 grid grid-cols-3 gap-2 font-mono-tech">
          <div>
            <div className="text-[10px] tracking-[0.16em] text-[#F2EFE9]/54">
              {language === 'ar' ? 'السلسلة' : 'STREAK'}
            </div>
            <div className="mt-1 text-[13px] font-medium text-[#F2EFE9] tabular-nums">
              ×{rate.streakMultiplier.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-[10px] tracking-[0.16em] text-[#F2EFE9]/54">
              {language === 'ar' ? 'دعم TON' : 'TON BOOST'}
            </div>
            <div className="mt-1 text-[13px] font-medium text-[#5FE3FF] tabular-nums">
              ×{rate.tonMultiplier.toFixed(2)}
            </div>
          </div>
          <div className="text-end">
            <div className="text-[10px] tracking-[0.16em] text-[#F2EFE9]/54">
              {language === 'ar' ? 'الدائرة' : 'CIRCLE'}
            </div>
            <div className="mt-1 text-[13px] font-medium text-[#F2EFE9] tabular-nums">
              ×{rate.referralMultiplier.toFixed(2)}
            </div>
          </div>
        </div>

        {/* 7-Day Mining Activity Sparkline */}
        <ForgeSparkline
          history={state.dailyMiningHistory ?? []}
          liveUnclaimedEgo={charge.accumulatedEgo}
          t={t}
          language={language}
        />
      </aside>
    </div>
  );
};
