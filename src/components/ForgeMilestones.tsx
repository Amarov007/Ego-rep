import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { FORGE_LEVELS } from '../config';
import { Dictionary } from '../i18n/translations';
import { GameState, Language } from '../types';
import { formatEgo, getRankForXp } from '../utils/gameMath';
import { haptics } from '../services/telegram';
import { IconCheck } from './Icons';

interface ForgeMilestonesProps {
  state: GameState;
  t: Dictionary;
  language: Language;
  onUpgradeForge: (targetLevel: number) => void;
  onOpenUpgrade: () => void;
  onOpenRanks: () => void;
}

/**
 * ForgeMilestones
 * Clean minimalist timeline visualizing upcoming Forge Level ($EGO) and Rank (XP)
 * requirements with interactive node selection and one-tap rounded upgrade CTA.
 */
export const ForgeMilestones: React.FC<ForgeMilestonesProps> = ({
  state,
  t,
  language,
  onUpgradeForge,
  onOpenUpgrade,
  onOpenRanks,
}) => {
  const upcomingLevels = FORGE_LEVELS.filter((l) => l.level >= state.forgeLevel).slice(0, 4);
  const nextLevel = FORGE_LEVELS.find((l) => l.level === state.forgeLevel + 1) ?? null;
  const { current: currentRank, next: nextRank, progressPct: rankPct } = getRankForXp(state.xp);

  const [selectedLevel, setSelectedLevel] = useState<number>(
    nextLevel?.level ?? state.forgeLevel
  );

  const effectiveSelectedLevel = upcomingLevels.some((l) => l.level === selectedLevel)
    ? selectedLevel
    : nextLevel?.level ?? state.forgeLevel;

  const inspected =
    FORGE_LEVELS.find((l) => l.level === effectiveSelectedLevel) ?? upcomingLevels[0];

  const prefersReducedMotion = useReducedMotion();
  const egoProgressPct =
    nextLevel && nextLevel.costEgo > 0
      ? Math.min(100, Math.round((state.egoBalance / nextLevel.costEgo) * 100))
      : 100;
  const rankProgressPct = Math.min(100, Math.round(rankPct));
  const timelineFillPct =
    upcomingLevels.length > 1
      ? (egoProgressPct / 100) * (100 / (upcomingLevels.length - 1))
      : 100;
  const canUpgradeNext = nextLevel !== null && state.egoBalance >= nextLevel.costEgo;
  const remainingForInspected = Math.max(0, inspected.costEgo - state.egoBalance);

  return (
    <section className="mt-4 ego-panel p-4">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-hairline">
        <div className="flex items-center gap-2.5">
          <span className="font-mono-tech text-[10px] font-medium tracking-[0.22em] text-[#F2EFE9]/74">
            {t.forge.milestonesTitle}
          </span>
          <span className="font-mono-tech text-[10px] tabular-nums text-[#5FE3FF]">
            LVL 0{state.forgeLevel}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            haptics.select();
            onOpenUpgrade();
          }}
          className="ego-btn-secondary min-h-[30px] px-3 font-mono-tech text-[10px] font-medium tracking-[0.14em] text-[#F2EFE9]/82 cursor-pointer whitespace-nowrap"
        >
          {t.forge.milestonesViewAll}
        </button>
      </div>

      {/* Minimalist Horizontal Milestone Timeline */}
      <div className="mt-4 relative">
        {/* Continuous Hairline Track */}
        <div
          className="absolute top-[13px] inset-x-5 h-[1.5px] bg-[#F2EFE9]/14"
          aria-hidden="true"
        />

        {/* Progress Segment illuminating from zero along the milestone rail */}
        {upcomingLevels.length > 1 && (
          <div
            className="absolute top-[13px] inset-x-5 h-[1.5px] pointer-events-none"
            aria-hidden="true"
          >
            <motion.div
              className="relative h-full rounded-full"
              initial={prefersReducedMotion ? false : { width: '0%', opacity: 0.35 }}
              animate={{ width: `${timelineFillPct}%`, opacity: 1 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.85,
                delay: prefersReducedMotion ? 0 : 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                background: 'linear-gradient(90deg, #F2EFE9, #5FE3FF)',
                boxShadow: '0 0 8px rgba(95, 227, 255, 0.45)',
              }}
            />
          </div>
        )}

        {/* Interactive Timeline Nodes */}
        <div
          className="relative grid gap-1.5"
          style={{ gridTemplateColumns: `repeat(${upcomingLevels.length}, minmax(0, 1fr))` }}
        >
          {upcomingLevels.map((lvl) => {
            const isCurrent = lvl.level === state.forgeLevel;
            const isNext = lvl.level === state.forgeLevel + 1;
            const isSelected = lvl.level === inspected.level;
            const isReady = isNext && state.egoBalance >= lvl.costEgo;

            return (
              <button
                key={lvl.level}
                type="button"
                onClick={() => {
                  haptics.select();
                  setSelectedLevel(lvl.level);
                }}
                className="group flex flex-col items-center text-center cursor-pointer focus-visible:outline-none py-0.5"
              >
                {/* Node Circle */}
                <span
                  className={`relative z-10 w-[26px] h-[26px] rounded-full border flex items-center justify-center font-mono-tech text-[10px] font-medium tabular-nums transition-all duration-200 ${
                    isCurrent
                      ? 'bg-[#F2EFE9] border-[#F2EFE9] text-[#050506]'
                      : isReady
                      ? 'bg-[#10232C] border-[#5FE3FF] text-[#5FE3FF] shadow-[0_0_12px_rgba(95,227,255,0.35)]'
                      : isSelected
                      ? 'bg-[#161822] border-[#F2EFE9]/80 text-[#F2EFE9]'
                      : 'bg-[#08080C] border-[#F2EFE9]/24 text-[#F2EFE9]/58 group-hover:border-[#F2EFE9]/55'
                  }`}
                >
                  {isCurrent ? <IconCheck className="w-3 h-3" /> : `0${lvl.level}`}
                </span>

                {/* Node Level Name & Cost */}
                <span
                  className={`mt-2 font-body text-[11px] font-medium leading-tight truncate max-w-full px-1 transition-colors ${
                    isSelected || isCurrent ? 'text-[#F2EFE9]' : 'text-[#F2EFE9]/56'
                  }`}
                >
                  {language === 'ar' ? lvl.nameAr : lvl.nameEn.split(' ')[0]}
                </span>
                <span
                  className={`mt-0.5 font-mono-tech text-[9.5px] tabular-nums ${
                    isCurrent
                      ? 'text-[#34D399]'
                      : isReady
                      ? 'text-[#5FE3FF]'
                      : 'text-[#F2EFE9]/48'
                  }`}
                >
                  {isCurrent ? `${lvl.baseEgoPerHour}/h` : `${formatEgo(lvl.costEgo)}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Milestone Requirement Detail + Direct Upgrade Action */}
      <div className="mt-4 pt-3.5 border-t border-hairline">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-mono-tech text-[11px] font-medium text-[#F2EFE9] tabular-nums">
                LVL 0{inspected.level}
              </span>
              <span className="font-body text-[12px] text-[#F2EFE9]/74 truncate">
                {language === 'ar' ? inspected.nameAr : inspected.nameEn}
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 font-mono-tech text-[10.5px] tabular-nums">
              <span className="text-[#5FE3FF]">+{inspected.deltaEgoPerHour} EGO/HR</span>
              <span className="text-[#F2EFE9]/28" aria-hidden="true">
                ·
              </span>
              <span className="text-[#F2EFE9]/78">+{inspected.xpReward} XP</span>
              {inspected.level > state.forgeLevel && (
                <>
                  <span className="text-[#F2EFE9]/28" aria-hidden="true">
                    ·
                  </span>
                  <span
                    className={
                      remainingForInspected === 0 ? 'text-[#34D399]' : 'text-[#F2EFE9]/58'
                    }
                  >
                    {remainingForInspected === 0
                      ? t.forge.milestonesReady
                      : `${formatEgo(remainingForInspected, 0)} $EGO ${t.forge.milestonesRemaining}`}
                  </span>
                </>
              )}
            </div>
          </div>

          {canUpgradeNext && nextLevel && (
            <button
              type="button"
              onClick={() => {
                onUpgradeForge(nextLevel.level);
              }}
              className="ego-btn-primary shrink-0 min-h-[38px] px-4 rounded-full font-mono-tech text-[10px] font-medium tracking-[0.16em] text-[#F2EFE9] cursor-pointer whitespace-nowrap"
            >
              {t.forge.milestonesUpgradeNow} · 0{nextLevel.level}
            </button>
          )}
        </div>

        {/* Dual Progress Bars: Next Forge ($EGO) & Next Rank (XP) */}
        <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* EGO Requirement Progress */}
          <div className="rounded-xl bg-[#07070B] border border-hairline px-3 py-2.5">
            <div className="flex items-center justify-between font-mono-tech text-[10px]">
              <span className="text-[#F2EFE9]/58">
                {nextLevel ? `LVL 0${nextLevel.level} · $EGO` : t.forge.milestonesMaxLevel}
              </span>
              <span className="tabular-nums text-[#F2EFE9] font-medium">
                {nextLevel
                  ? `${formatEgo(Math.min(state.egoBalance, nextLevel.costEgo), 0)} / ${formatEgo(
                      nextLevel.costEgo,
                      0
                    )}`
                  : 'MAX'}
              </span>
            </div>
            <div className="mt-2 h-[4px] w-full rounded-full bg-[#F2EFE9]/10 overflow-hidden">
              <motion.div
                className="relative h-full rounded-full"
                initial={prefersReducedMotion ? false : { width: '0%', opacity: 0.45 }}
                animate={{ width: `${egoProgressPct}%`, opacity: 1 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.9,
                  delay: prefersReducedMotion ? 0 : 0.22,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  background: canUpgradeNext
                    ? '#34D399'
                    : 'linear-gradient(90deg, #2D6BFF, #5FE3FF)',
                  boxShadow: canUpgradeNext
                    ? '0 0 10px rgba(52, 211, 153, 0.45)'
                    : '0 0 10px rgba(95, 227, 255, 0.35)',
                }}
              >
                {egoProgressPct > 4 && (
                  <span
                    className="absolute inset-y-0 end-0 w-[3px] rounded-full bg-[#F2EFE9]/90"
                    aria-hidden="true"
                  />
                )}
              </motion.div>
            </div>
          </div>

          {/* XP Rank Requirement Progress */}
          <button
            type="button"
            onClick={() => {
              haptics.select();
              onOpenRanks();
            }}
            className="rounded-xl bg-[#07070B] border border-hairline hover:border-hairline-strong px-3 py-2.5 text-start transition-colors cursor-pointer active:scale-[0.985]"
          >
            <div className="flex items-center justify-between font-mono-tech text-[10px]">
              <span className="text-[#F2EFE9]/58 truncate">
                {nextRank
                  ? `${t.forge.milestonesNextRank} · ${
                      language === 'ar' ? nextRank.nameAr : nextRank.nameEn.toUpperCase()
                    }`
                  : language === 'ar'
                  ? currentRank.nameAr
                  : currentRank.nameEn.toUpperCase()}
              </span>
              <span className="tabular-nums text-[#F2EFE9] font-medium shrink-0 ms-2">
                {nextRank ? `${formatEgo(state.xp)} / ${formatEgo(nextRank.minXp)}` : 'MAX'}
              </span>
            </div>
            <div className="mt-2 h-[4px] w-full rounded-full bg-[#F2EFE9]/10 overflow-hidden">
              <motion.div
                className="relative h-full rounded-full"
                initial={prefersReducedMotion ? false : { width: '0%', opacity: 0.45 }}
                animate={{ width: `${rankProgressPct}%`, opacity: 1 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.95,
                  delay: prefersReducedMotion ? 0 : 0.34,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  background: 'linear-gradient(90deg, #C1121F, #F2EFE9)',
                  boxShadow: '0 0 10px rgba(193, 18, 31, 0.4)',
                }}
              >
                {rankProgressPct > 4 && (
                  <span
                    className="absolute inset-y-0 end-0 w-[3px] rounded-full bg-[#F2EFE9]"
                    aria-hidden="true"
                  />
                )}
              </motion.div>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};
