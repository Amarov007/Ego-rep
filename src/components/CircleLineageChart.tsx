import React, { useMemo, useState } from 'react';
import { Dictionary } from '../i18n/translations';
import { Language, ReferralMember } from '../types';
import { formatEgo } from '../utils/gameMath';
import { haptics } from '../services/telegram';

interface CircleLineageChartProps {
  referrals: ReferralMember[];
  t: Dictionary;
  language: Language;
}

type ChartViewMode = 'timeline' | 'tier';

interface DayBucket {
  key: string;
  label: string;
  fullLabel: string;
  tier1Count: number;
  tier2Count: number;
  commissionEgo: number;
  cumulativeMembers: number;
}

/**
 * CircleLineageChart
 * Editorial architectural SVG visualization of referral distribution:
 * - OVER TIME: 7-day hairline stem chart stacked by Tier 1 / Tier 2 with cumulative lineage line
 * - BY TIER: Sharp comparative distribution of headcount & $EGO yield across Tier 1 (10%) and Tier 2 (3%)
 */
export const CircleLineageChart: React.FC<CircleLineageChartProps> = ({
  referrals,
  t,
  language,
}) => {
  const [mode, setMode] = useState<ChartViewMode>('timeline');
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(6);
  const [selectedTier, setSelectedTier] = useState<1 | 2>(1);

  const tierStats = useMemo(() => {
    const l1 = referrals.filter((r) => r.tier === 1);
    const l2 = referrals.filter((r) => r.tier === 2);
    const totalCount = referrals.length;
    const l1Yield = l1.reduce((sum, r) => sum + r.commissionEarned, 0);
    const l2Yield = l2.reduce((sum, r) => sum + r.commissionEarned, 0);
    const totalYield = l1Yield + l2Yield;
    const l1Mined = l1.reduce((sum, r) => sum + r.egoMined, 0);
    const l2Mined = l2.reduce((sum, r) => sum + r.egoMined, 0);

    return {
      l1Count: l1.length,
      l2Count: l2.length,
      totalCount,
      l1CountPct: totalCount > 0 ? Math.round((l1.length / totalCount) * 100) : 0,
      l2CountPct: totalCount > 0 ? Math.round((l2.length / totalCount) * 100) : 0,
      l1Yield,
      l2Yield,
      totalYield,
      l1YieldPct: totalYield > 0 ? Math.round((l1Yield / totalYield) * 100) : 0,
      l2YieldPct: totalYield > 0 ? Math.round((l2Yield / totalYield) * 100) : 0,
      l1AvgYield: l1.length > 0 ? l1Yield / l1.length : 0,
      l2AvgYield: l2.length > 0 ? l2Yield / l2.length : 0,
      l1Mined,
      l2Mined,
    };
  }, [referrals]);

  const timelineBuckets = useMemo<DayBucket[]>(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    const windowStart = startOfToday - 6 * dayMs;

    // Count members who joined before the 7-day window as baseline cumulative total
    let runningTotal = referrals.filter((r) => r.joinedAt < windowStart).length;

    const buckets: DayBucket[] = [];
    for (let i = 0; i < 7; i++) {
      const dayStart = windowStart + i * dayMs;
      const dayEnd = dayStart + dayMs;
      const d = new Date(dayStart);

      const inDay = referrals.filter((r) => r.joinedAt >= dayStart && r.joinedAt < dayEnd);
      const tier1Count = inDay.filter((r) => r.tier === 1).length;
      const tier2Count = inDay.filter((r) => r.tier === 2).length;
      const commissionEgo = inDay.reduce((sum, r) => sum + r.commissionEarned, 0);

      runningTotal += tier1Count + tier2Count;

      const shortDay =
        i === 6
          ? language === 'ar'
            ? 'اليوم'
            : 'NOW'
          : d.toLocaleDateString('en-US', { day: '2-digit' });

      const fullLabel = d.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
        month: 'short',
        day: '2-digit',
      });

      buckets.push({
        key: `${dayStart}`,
        label: shortDay,
        fullLabel,
        tier1Count,
        tier2Count,
        commissionEgo,
        cumulativeMembers: runningTotal,
      });
    }
    return buckets;
  }, [referrals, language]);

  const maxDailyCount = Math.max(
    2,
    ...timelineBuckets.map((b) => b.tier1Count + b.tier2Count)
  );
  const maxCumulative = Math.max(1, ...timelineBuckets.map((b) => b.cumulativeMembers));
  const activeBucket = timelineBuckets[selectedDayIdx] ?? timelineBuckets[timelineBuckets.length - 1];

  // SVG chart coordinates for the 7-day timeline
  const chartW = 320;
  const chartH = 112;
  const padX = 18;
  const padTop = 16;
  const padBottom = 22;
  const plotH = chartH - padTop - padBottom;
  const stepX = (chartW - padX * 2) / 6;

  const polylinePoints = timelineBuckets
    .map((b, idx) => {
      const x = padX + idx * stepX;
      const y = padTop + plotH - (b.cumulativeMembers / maxCumulative) * (plotH - 6);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const activeTierData =
    selectedTier === 1
      ? {
          title: t.circle.chartTier1Label,
          count: tierStats.l1Count,
          countPct: tierStats.l1CountPct,
          yieldEgo: tierStats.l1Yield,
          yieldPct: tierStats.l1YieldPct,
          avgYield: tierStats.l1AvgYield,
          accent: '#2D6BFF',
        }
      : {
          title: t.circle.chartTier2Label,
          count: tierStats.l2Count,
          countPct: tierStats.l2CountPct,
          yieldEgo: tierStats.l2Yield,
          yieldPct: tierStats.l2YieldPct,
          avgYield: tierStats.l2AvgYield,
          accent: '#C1121F',
        };

  return (
    <div className="mt-6 ego-panel p-4">
      {/* Header + Mode Switch */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-hairline">
        <span className="font-mono-tech text-[10px] font-medium tracking-[0.22em] text-[#F2EFE9]/74">
          {t.circle.chartTitle}
        </span>

        <div className="flex items-center gap-1 p-0.5 rounded-full bg-[#060609] border border-hairline">
          {(['timeline', 'tier'] as const).map((tab) => {
            const isActive = mode === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  if (mode !== tab) {
                    haptics.toggle(tab === 'tier');
                    setMode(tab);
                  } else {
                    haptics.impactOccurred('soft');
                  }
                }}
                className={`min-h-[28px] px-3 rounded-full font-mono-tech text-[10px] font-medium tracking-[0.14em] whitespace-nowrap transition-all cursor-pointer active:scale-[0.96] ${
                  isActive
                    ? 'bg-[#2D6BFF]/22 text-[#F2EFE9] border border-[#2D6BFF]/60'
                    : 'border border-transparent text-[#F2EFE9]/54 hover:text-[#F2EFE9]/85'
                }`}
              >
                {tab === 'timeline' ? t.circle.chartOverTime : t.circle.chartByTier}
              </button>
            );
          })}
        </div>
      </div>

      {mode === 'timeline' ? (
        <div className="mt-3">
          {/* Active Day Inspection Readout */}
          <div className="flex items-baseline justify-between gap-3 font-mono-tech text-[11px]">
            <div className="flex items-baseline gap-2.5">
              <span className="text-[#F2EFE9] font-medium">{activeBucket.fullLabel}</span>
              <span className="text-[#F2EFE9]/40">·</span>
              <span className="tabular-nums text-[#5C8FFF] font-medium">
                L1:{activeBucket.tier1Count}
              </span>
              <span className="tabular-nums text-[#E62836] font-medium">
                L2:{activeBucket.tier2Count}
              </span>
            </div>

            <div className="tabular-nums font-medium text-[#5FE3FF] text-end">
              {activeBucket.commissionEgo > 0
                ? `+${formatEgo(activeBucket.commissionEgo, 1)} $EGO`
                : `${activeBucket.cumulativeMembers} ${t.circle.chartTotalUnit}`}
            </div>
          </div>

          {/* 7-Day Architectural Stem & Cumulative Lineage Polyline SVG */}
          <div className="mt-2.5 relative" dir="ltr">
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full h-[126px] overflow-visible select-none"
              role="img"
              aria-label={t.circle.chartTitle}
            >
              {/* Subtle horizontal reference grid hairlines */}
              <line
                x1={padX - 6}
                y1={padTop}
                x2={chartW - padX + 6}
                y2={padTop}
                stroke="rgba(237,234,228,0.06)"
                strokeWidth="0.75"
              />
              <line
                x1={padX - 6}
                y1={padTop + plotH * 0.5}
                x2={chartW - padX + 6}
                y2={padTop + plotH * 0.5}
                stroke="rgba(237,234,228,0.06)"
                strokeWidth="0.75"
                strokeDasharray="2 4"
              />
              <line
                x1={padX - 6}
                y1={padTop + plotH}
                x2={chartW - padX + 6}
                y2={padTop + plotH}
                stroke="rgba(237,234,228,0.16)"
                strokeWidth="0.9"
              />

              {/* Cumulative Lineage Trend Line */}
              <polyline
                fill="none"
                stroke="#5FE3FF"
                strokeWidth="1"
                strokeOpacity="0.58"
                points={polylinePoints}
              />

              {/* Stacked Vertical Day Columns (Tier 1 Blue/Bone + Tier 2 Blood Red) */}
              {timelineBuckets.map((bucket, idx) => {
                const x = padX + idx * stepX;
                const isSelected = idx === selectedDayIdx;
                const totalInDay = bucket.tier1Count + bucket.tier2Count;
                const l1Height = (bucket.tier1Count / maxDailyCount) * (plotH - 12);
                const l2Height = (bucket.tier2Count / maxDailyCount) * (plotH - 12);
                const baseY = padTop + plotH;
                const cumY =
                  padTop + plotH - (bucket.cumulativeMembers / maxCumulative) * (plotH - 6);

                return (
                  <g
                    key={bucket.key}
                    onClick={() => {
                      haptics.select();
                      setSelectedDayIdx(idx);
                    }}
                    onMouseEnter={() => setSelectedDayIdx(idx)}
                    className="cursor-pointer"
                  >
                    {/* Wide invisible touch target column */}
                    <rect
                      x={x - stepX * 0.45}
                      y={padTop - 6}
                      width={stepX * 0.9}
                      height={plotH + padBottom + 6}
                      fill="transparent"
                    />

                    {/* Selected vertical hairline guide */}
                    {isSelected && (
                      <line
                        x1={x}
                        y1={padTop - 4}
                        x2={x}
                        y2={baseY}
                        stroke="rgba(237,234,228,0.16)"
                        strokeWidth="0.75"
                      />
                    )}

                    {/* Tier 1 Bar (Electric Blue light edge + Bone core) */}
                    {l1Height > 0 && (
                      <>
                        <rect
                          x={x - 5}
                          y={baseY - l1Height}
                          width={10}
                          height={l1Height}
                          fill={isSelected ? 'rgba(45,107,255,0.42)' : 'rgba(45,107,255,0.22)'}
                          stroke="#2D6BFF"
                          strokeWidth="0.8"
                        />
                        <line
                          x1={x - 5}
                          y1={baseY - l1Height}
                          x2={x + 5}
                          y2={baseY - l1Height}
                          stroke="#EDEAE4"
                          strokeWidth="1.2"
                        />
                      </>
                    )}

                    {/* Tier 2 Bar stacked above Tier 1 (Blood Red light edge) */}
                    {l2Height > 0 && (
                      <>
                        <rect
                          x={x - 5}
                          y={baseY - l1Height - l2Height - (l1Height > 0 ? 2 : 0)}
                          width={10}
                          height={l2Height}
                          fill={isSelected ? 'rgba(193,18,31,0.45)' : 'rgba(193,18,31,0.24)'}
                          stroke="#C1121F"
                          strokeWidth="0.8"
                        />
                        <line
                          x1={x - 5}
                          y1={baseY - l1Height - l2Height - (l1Height > 0 ? 2 : 0)}
                          x2={x + 5}
                          y2={baseY - l1Height - l2Height - (l1Height > 0 ? 2 : 0)}
                          stroke="#C1121F"
                          strokeWidth="1.3"
                        />
                      </>
                    )}

                    {/* Minimal base tick for zero-join days */}
                    {totalInDay === 0 && (
                      <line
                        x1={x - 3}
                        y1={baseY - 1}
                        x2={x + 3}
                        y2={baseY - 1}
                        stroke="rgba(237,234,228,0.22)"
                        strokeWidth="1"
                      />
                    )}

                    {/* Cumulative lineage node diamond */}
                    <rect
                      x={x - 2}
                      y={cumY - 2}
                      width={4}
                      height={4}
                      transform={`rotate(45 ${x} ${cumY})`}
                      fill={isSelected ? '#EDEAE4' : '#050506'}
                      stroke="#5FE3FF"
                      strokeWidth="1"
                    />

                    {/* X-Axis Day Label */}
                    <text
                      x={x}
                      y={chartH - 3}
                      textAnchor="middle"
                      fill={isSelected ? '#F2EFE9' : 'rgba(242,239,233,0.58)'}
                      fontSize="9.5"
                      fontWeight={isSelected ? '600' : '400'}
                      fontFamily="JetBrains Mono, monospace"
                      letterSpacing="0.8"
                    >
                      {bucket.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Minimal Typographic Legend */}
          <div className="mt-1 pt-2.5 border-t border-hairline flex flex-wrap items-center justify-between gap-2 font-mono-tech text-[10px] tracking-[0.14em] text-[#F2EFE9]/64">
            <div className="flex items-center gap-3.5">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-[2px] bg-[#2D6BFF]" />
                <span>L1 · 10%</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-[2px] bg-[#C1121F]" />
                <span>L2 · 3%</span>
              </span>
            </div>
            <span className="flex items-center gap-1.5 text-[#5FE3FF]">
              <span className="inline-block w-3 h-[1.5px] bg-[#5FE3FF]" />
              <span>{t.circle.chartCumulative}</span>
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-3.5 space-y-4">
          {/* Interactive Tier Selector Bar (Headcount Share) */}
          <div>
            <div className="flex items-baseline justify-between font-mono-tech text-[9px] tracking-[0.2em] text-[#EDEAE4]/45">
              <span>{t.circle.chartHeadcountShare}</span>
              <span className="tabular-nums text-[#EDEAE4]/75">
                {tierStats.l1CountPct}% / {tierStats.l2CountPct}%
              </span>
            </div>

            <div className="mt-2 h-[10px] w-full border border-hairline bg-[#050506] flex overflow-hidden">
              <button
                type="button"
                aria-label={t.circle.chartTier1Label}
                onClick={() => {
                  haptics.select();
                  setSelectedTier(1);
                }}
                style={{ width: `${Math.max(tierStats.l1CountPct, tierStats.l1Count > 0 ? 8 : 0)}%` }}
                className={`h-full transition-opacity cursor-pointer border-e border-[#050506] ${
                  selectedTier === 1 ? 'bg-[#2D6BFF]/75 opacity-100' : 'bg-[#2D6BFF]/35 opacity-70'
                }`}
              />
              <button
                type="button"
                aria-label={t.circle.chartTier2Label}
                onClick={() => {
                  haptics.select();
                  setSelectedTier(2);
                }}
                style={{ width: `${Math.max(tierStats.l2CountPct, tierStats.l2Count > 0 ? 8 : 0)}%` }}
                className={`h-full transition-opacity cursor-pointer ${
                  selectedTier === 2 ? 'bg-[#C1121F]/80 opacity-100' : 'bg-[#C1121F]/35 opacity-70'
                }`}
              />
            </div>
          </div>

          {/* Commission Yield Share Bar */}
          <div>
            <div className="flex items-baseline justify-between font-mono-tech text-[9px] tracking-[0.2em] text-[#EDEAE4]/45">
              <span>{t.circle.chartYieldShare}</span>
              <span className="tabular-nums text-[#5FE3FF]">
                {tierStats.l1YieldPct}% / {tierStats.l2YieldPct}%
              </span>
            </div>

            <div className="mt-2 h-[6px] w-full border border-hairline bg-[#050506] flex overflow-hidden">
              <div
                style={{ width: `${tierStats.l1YieldPct}%` }}
                className="h-full bg-[#EDEAE4]/80 border-e border-[#050506]"
              />
              <div
                style={{ width: `${tierStats.l2YieldPct}%` }}
                className="h-full bg-[#C1121F]/80"
              />
            </div>
          </div>

          {/* Two Interactive Tier Rows */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {([1, 2] as const).map((tierNum) => {
              const isSel = selectedTier === tierNum;
              const isT1 = tierNum === 1;
              const count = isT1 ? tierStats.l1Count : tierStats.l2Count;
              const yieldVal = isT1 ? tierStats.l1Yield : tierStats.l2Yield;
              const accent = isT1 ? '#2D6BFF' : '#C1121F';

              return (
                <button
                  key={tierNum}
                  type="button"
                  onClick={() => {
                    haptics.select();
                    setSelectedTier(tierNum);
                  }}
                  className={`relative p-3.5 rounded-xl border text-start transition-all cursor-pointer active:scale-[0.97] overflow-hidden ${
                    isSel
                      ? 'border-[#F2EFE9]/50 bg-[#12121B]'
                      : 'border-hairline bg-[#060609] hover:border-[#F2EFE9]/30'
                  }`}
                >
                  <span
                    className="absolute top-0 inset-x-3 h-[2px] rounded-full"
                    style={{ backgroundColor: accent, opacity: isSel ? 1 : 0.35 }}
                    aria-hidden="true"
                  />
                  <div className="font-mono-tech text-[9px] tracking-[0.18em] text-[#EDEAE4]/50">
                    {isT1 ? t.circle.tier1 : t.circle.tier2}
                  </div>
                  <div className="mt-1.5 flex items-baseline justify-between gap-2">
                    <span className="font-editorial text-[24px] leading-none text-[#EDEAE4] tabular-nums">
                      {String(count).padStart(2, '0')}
                    </span>
                    <span className="font-mono-tech text-[10px] tabular-nums text-[#5FE3FF]">
                      +{formatEgo(yieldVal, 1)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Tier Detail Strip */}
          <div className="pt-2.5 border-t border-hairline flex items-center justify-between font-mono-tech text-[10px]">
            <span className="text-[#EDEAE4]/55" style={{ color: activeTierData.accent }}>
              {activeTierData.title}
            </span>
            <span className="tabular-nums text-[#EDEAE4]/80">
              {t.circle.chartAvgYield}: +{formatEgo(activeTierData.avgYield, 1)} $EGO
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
