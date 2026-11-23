import React, { useState } from 'react';
import { RANKS } from '../config';
import { Dictionary } from '../i18n/translations';
import { GameState, Language, RankConfig } from '../types';
import { formatEgo, getOverallXpLineProgress, getRankForXp } from '../utils/gameMath';
import { haptics } from '../services/telegram';
import { IconBack } from './Icons';

interface RanksScreenProps {
  state: GameState;
  t: Dictionary;
  language: Language;
  onBack: () => void;
}

/**
 * Ranks Screen (Interactive Ascension Spine)
 * - Huge editorial current rank display
 * - Vertical luminous XP hairline spine
 * - Tapping any tier inspects exact XP gap and unlocked mining bonus
 */
export const RanksScreen: React.FC<RanksScreenProps> = ({ state, t, language, onBack }) => {
  const { current, next, index: currentIndex } = getRankForXp(state.xp);
  const overallProgress = getOverallXpLineProgress(state.xp);
  const [inspectedId, setInspectedId] = useState<RankConfig['id']>(current.id);

  const orderedRanks = [...RANKS].reverse();
  const inspectedRank = RANKS.find((r) => r.id === inspectedId) ?? current;
  const inspectedXpDelta = inspectedRank.minXp - state.xp;

  return (
    <div className="w-full max-w-4xl mx-auto px-5 pt-4 pb-28">
      {/* Sub-view Back Strip */}
      <div className="flex items-center justify-between pb-4 border-b border-hairline">
        <button
          type="button"
          onClick={() => {
            haptics.toggle(false);
            onBack();
          }}
          className="ego-btn-secondary min-h-[38px] px-4 flex items-center gap-2 font-mono-tech text-[11px] font-medium tracking-[0.2em] text-[#F2EFE9]/88 hover:text-[#F2EFE9] cursor-pointer"
        >
          <IconBack className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
          <span>{t.header.back}</span>
        </button>

        <span className="font-mono-tech text-[11px] font-medium tracking-[0.26em] text-[#F2EFE9]/62">
          {t.ranks.title}
        </span>
      </div>

      {/* HUGE Current Rank Display */}
      <section className="relative ego-keylight py-8 border-b border-hairline overflow-hidden">
        <div className="font-mono-tech text-[11px] font-medium tracking-[0.26em] text-[#F2EFE9]/60">
          {t.ranks.currentRank} · 0{currentIndex + 1} / 0{RANKS.length}
        </div>

        <h1 className="mt-2.5 font-editorial text-[70px] sm:text-[98px] leading-[0.88] font-normal tracking-[-0.03em] text-[#F2EFE9] -ms-1">
          {language === 'ar' ? current.nameAr : current.nameEn}
        </h1>

        <p className="mt-4 font-body text-[13px] text-[#F2EFE9]/72">
          {language === 'ar' ? current.epithetAr : current.epithetEn}
        </p>

        <div className="mt-6 ego-panel px-4 py-4 grid grid-cols-3 gap-4 font-mono-tech">
          <div>
            <div className="text-[10px] tracking-[0.2em] text-[#F2EFE9]/55">
              {t.ranks.xpTotal}
            </div>
            <div className="mt-1 text-[17px] font-medium tabular-nums text-[#F2EFE9]">
              {formatEgo(state.xp)}
            </div>
          </div>

          <div>
            <div className="text-[10px] tracking-[0.2em] text-[#F2EFE9]/55">
              {t.ranks.miningBonus}
            </div>
            <div className="mt-1 text-[17px] font-medium tabular-nums text-[#5FE3FF]">
              +{current.miningBonusPct}%
            </div>
          </div>

          <div className="text-end">
            <div className="text-[10px] tracking-[0.2em] text-[#F2EFE9]/55">
              {t.ranks.nextRank}
            </div>
            <div className="mt-1 text-[15px] font-medium tabular-nums text-[#F2EFE9]/90">
              {next
                ? `${formatEgo(Math.max(0, next.minXp - state.xp))} XP`
                : t.ranks.maxRankReached}
            </div>
          </div>
        </div>
      </section>

      {/* VERTICAL SPINE LADDER (Interactive Tier Selection) */}
      <section className="mt-8">
        <div className="flex items-baseline justify-between mb-6">
          <span className="font-mono-tech text-[11px] font-medium tracking-[0.26em] text-[#F2EFE9]/68">
            {t.ranks.ladderTitle}
          </span>
          <span className="font-mono-tech text-[11px] tabular-nums text-[#5FE3FF]">
            {language === 'ar' ? inspectedRank.nameAr : inspectedRank.nameEn.toUpperCase()} ·{' '}
            {inspectedXpDelta <= 0
              ? language === 'ar'
                ? 'مكتسب'
                : 'UNLOCKED'
              : `+${formatEgo(inspectedXpDelta)} XP`}
          </span>
        </div>

        <div className="relative ps-10 sm:ps-14">
          {/* Thin Vertical Background Axis */}
          <div
            className="absolute start-3 sm:start-5 top-3 bottom-3 w-[1px] bg-[#F2EFE9]/18"
            aria-hidden="true"
          />

          {/* Illuminated Vertical XP Progress Line */}
          <div
            className="absolute start-3 sm:start-5 bottom-3 w-[2px] transition-all duration-700"
            style={{
              height: `calc((100% - 24px) * ${overallProgress / 100})`,
              background:
                'linear-gradient(0deg, #F2EFE9 0%, #5FE3FF 58%, #C1121F 100%)',
              boxShadow: '0 0 12px rgba(95, 227, 255, 0.5)',
            }}
            aria-hidden="true"
          />

          <div className="space-y-4">
            {orderedRanks.map((rank) => {
              const rankIdx = RANKS.findIndex((r) => r.id === rank.id);
              const isCurrent = rank.id === current.id;
              const isReached = state.xp >= rank.minXp;
              const isInspected = rank.id === inspectedId;

              return (
                <button
                  key={rank.id}
                  type="button"
                  onClick={() => {
                    haptics.select();
                    setInspectedId(rank.id);
                  }}
                  className={`relative w-full text-start flex items-baseline justify-between gap-4 py-4 px-4 -ms-3 rounded-xl border transition-all cursor-pointer active:scale-[0.985] ${
                    isInspected
                      ? 'border-[#F2EFE9]/32 bg-[#F2EFE9]/[0.055]'
                      : 'border-transparent hover:border-hairline hover:bg-[#F2EFE9]/[0.025]'
                  } ${isCurrent ? 'opacity-100' : isReached ? 'opacity-88' : 'opacity-56'}`}
                >
                  {/* Node tick mark along the vertical XP axis */}
                  <span
                    className="absolute -start-[20px] sm:-start-[28px] top-[24px] w-[10px] h-[1.5px]"
                    style={{
                      backgroundColor: isCurrent
                        ? '#C1121F'
                        : isReached
                        ? '#F2EFE9'
                        : 'rgba(242,239,233,0.3)',
                    }}
                    aria-hidden="true"
                  />

                  <div className="min-w-0">
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono-tech text-[11px] tabular-nums text-[#F2EFE9]/55">
                        0{rankIdx + 1}
                      </span>
                      <span
                        className={`font-editorial leading-none font-normal ${
                          isCurrent
                            ? 'text-[36px] sm:text-[44px] text-[#F2EFE9]'
                            : 'text-[26px] sm:text-[30px] text-[#F2EFE9]/92'
                        }`}
                      >
                        {language === 'ar' ? rank.nameAr : rank.nameEn}
                      </span>
                    </div>
                    <p className="mt-1.5 ps-7 font-body text-[12px] text-[#F2EFE9]/64">
                      {language === 'ar' ? rank.epithetAr : rank.epithetEn}
                    </p>
                  </div>

                  <div className="text-end shrink-0 font-mono-tech">
                    <div className="text-[12px] font-medium tabular-nums text-[#F2EFE9]">
                      {formatEgo(rank.minXp)} XP
                    </div>
                    <div
                      className={`mt-1 text-[11px] tabular-nums ${
                        isReached ? 'text-[#5FE3FF]' : 'text-[#F2EFE9]/54'
                      }`}
                    >
                      +{rank.miningBonusPct}% RATE
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
