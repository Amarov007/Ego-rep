import React, { useMemo, useState } from 'react';
import { Dictionary } from '../i18n/translations';
import { DailyMiningPoint, Language } from '../types';
import { formatEgo, getTodayDateKey } from '../utils/gameMath';
import { haptics } from '../services/telegram';

interface ForgeSparklineProps {
  history: DailyMiningPoint[];
  /** Live uncollected EGO currently accumulating in today's Forge cycle */
  liveUnclaimedEgo: number;
  t: Dictionary;
  language: Language;
}

interface SparkDay {
  dateKey: string;
  shortLabel: string;
  fullLabel: string;
  claimedEgo: number;
  totalEgo: number;
  claimsCount: number;
  isToday: boolean;
}

/**
 * ForgeSparkline
 * Compact architectural 7-day mining activity sparkline embedded in the Forge screen.
 * Displays daily $EGO output, average baseline hairline, and live tap/hover day inspection.
 */
export const ForgeSparkline: React.FC<ForgeSparklineProps> = ({
  history,
  liveUnclaimedEgo,
  t,
  language,
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number>(6);

  const days = useMemo<SparkDay[]>(() => {
    const todayKey = getTodayDateKey();
    const map = new Map<string, DailyMiningPoint>();
    for (const item of history) {
      map.set(item.dateKey, item);
    }

    const now = new Date();
    const result: SparkDay[] = [];
    for (let offset = 6; offset >= 0; offset--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - offset));
      const key = d.toISOString().slice(0, 10);
      const isToday = key === todayKey;
      const entry = map.get(key);
      const claimedEgo = entry?.egoClaimed ?? 0;
      const totalEgo = isToday ? claimedEgo + liveUnclaimedEgo : claimedEgo;

      const shortLabel = isToday
        ? t.forge.sparklineToday
        : d.toLocaleDateString('en-US', { weekday: 'narrow', timeZone: 'UTC' });

      const fullLabel = isToday
        ? t.forge.sparklineToday
        : d.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
            month: 'short',
            day: '2-digit',
            timeZone: 'UTC',
          });

      result.push({
        dateKey: key,
        shortLabel,
        fullLabel,
        claimedEgo,
        totalEgo,
        claimsCount: entry?.claimsCount ?? 0,
        isToday,
      });
    }
    return result;
  }, [history, liveUnclaimedEgo, language, t.forge.sparklineToday]);

  const stats = useMemo(() => {
    const total7d = days.reduce((sum, d) => sum + d.totalEgo, 0);
    const avg = total7d / days.length;
    const maxVal = Math.max(10, ...days.map((d) => d.totalEgo));
    const minVal = Math.min(...days.map((d) => d.totalEgo));
    const prev = days[5]?.totalEgo ?? 0;
    const curr = days[6]?.totalEgo ?? 0;
    const deltaPct = prev > 0 ? Math.round(((curr - prev) / prev) * 100) : 0;

    return { total7d, avg, maxVal, minVal, deltaPct };
  }, [days]);

  const activeDay = days[selectedIdx] ?? days[6];

  // SVG geometry
  const width = 320;
  const height = 84;
  const padX = 14;
  const padTop = 12;
  const padBottom = 18;
  const plotH = height - padTop - padBottom;
  const stepX = (width - padX * 2) / 6;

  const yFor = (val: number) => {
    const range = Math.max(stats.maxVal * 1.12, 1);
    return padTop + plotH - (val / range) * plotH;
  };

  const points = days.map((d, i) => ({
    x: padX + i * stepX,
    y: yFor(d.totalEgo),
    day: d,
    idx: i,
  }));

  const polylineStr = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaStr = `${padX},${(padTop + plotH).toFixed(1)} ${polylineStr} ${(
    padX +
    6 * stepX
  ).toFixed(1)},${(padTop + plotH).toFixed(1)}`;
  const avgY = yFor(stats.avg);

  return (
    <div className="mt-4 ego-panel px-4 py-3.5">
      {/* Header Row */}
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2.5">
          <span className="font-mono-tech text-[10px] font-medium tracking-[0.22em] text-[#F2EFE9]/70">
            {t.forge.sparklineTitle}
          </span>
          <span
            className={`font-mono-tech text-[10px] font-medium tabular-nums ${
              stats.deltaPct >= 0 ? 'text-[#34D399]' : 'text-[#C1121F]'
            }`}
          >
            {stats.deltaPct >= 0 ? `+${stats.deltaPct}%` : `${stats.deltaPct}%`}
          </span>
        </div>

        <div className="font-mono-tech text-[11px] tabular-nums text-end">
          <span className="text-[#F2EFE9]/56">{activeDay.fullLabel}</span>
          <span className="mx-1.5 text-[#F2EFE9]/30">·</span>
          <span className="font-medium text-[#5FE3FF]">
            {formatEgo(activeDay.totalEgo, 1)}
          </span>
          <span className="text-[10px] text-[#F2EFE9]/48"> $EGO</span>
        </div>
      </div>

      {/* Sparkline SVG */}
      <div className="mt-2 relative" dir="ltr">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-[86px] overflow-visible select-none"
          role="img"
          aria-label={t.forge.sparklineTitle}
        >
          <defs>
            <linearGradient id="forge-spark-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5FE3FF" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#5FE3FF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Baseline hairline */}
          <line
            x1={padX - 4}
            y1={padTop + plotH}
            x2={width - padX + 4}
            y2={padTop + plotH}
            stroke="rgba(242,239,233,0.14)"
            strokeWidth="0.8"
          />

          {/* 7-day average dashed hairline */}
          <line
            x1={padX - 4}
            y1={avgY}
            x2={width - padX + 4}
            y2={avgY}
            stroke="rgba(242,239,233,0.22)"
            strokeWidth="0.7"
            strokeDasharray="2 4"
          />

          {/* Subtle gradient veil under sparkline */}
          <polygon points={areaStr} fill="url(#forge-spark-fill)" />

          {/* Main razor-thin sparkline stroke */}
          <polyline
            fill="none"
            stroke="#F2EFE9"
            strokeWidth="1.45"
            strokeLinejoin="miter"
            points={polylineStr}
          />

          {/* Interactive day stems, diamond markers, and x-axis labels */}
          {points.map(({ x, y, day, idx }) => {
            const isSel = idx === selectedIdx;
            return (
              <g
                key={day.dateKey}
                onClick={() => {
                  haptics.select();
                  setSelectedIdx(idx);
                }}
                onMouseEnter={() => setSelectedIdx(idx)}
                className="cursor-pointer"
              >
                {/* Wide touch hitbox */}
                <rect
                  x={x - stepX * 0.45}
                  y={0}
                  width={stepX * 0.9}
                  height={height}
                  fill="transparent"
                />

                {/* Vertical hairline drop stem on selected or today node */}
                {(isSel || day.isToday) && (
                  <line
                    x1={x}
                    y1={y + 3}
                    x2={x}
                    y2={padTop + plotH}
                    stroke={isSel ? 'rgba(95,227,255,0.52)' : 'rgba(242,239,233,0.22)'}
                    strokeWidth="0.9"
                  />
                )}

                {/* Diamond node */}
                <rect
                  x={x - (isSel ? 2.8 : 2)}
                  y={y - (isSel ? 2.8 : 2)}
                  width={isSel ? 5.6 : 4}
                  height={isSel ? 5.6 : 4}
                  transform={`rotate(45 ${x} ${y})`}
                  fill={isSel ? '#5FE3FF' : day.isToday ? '#F2EFE9' : '#050506'}
                  stroke={isSel || day.isToday ? '#5FE3FF' : 'rgba(242,239,233,0.75)'}
                  strokeWidth="1"
                />

                {/* Day label */}
                <text
                  x={x}
                  y={height - 3}
                  textAnchor="middle"
                  fill={isSel ? '#F2EFE9' : 'rgba(242,239,233,0.48)'}
                  fontSize="8.5"
                  fontWeight={isSel ? '600' : '400'}
                  fontFamily="JetBrains Mono, monospace"
                >
                  {day.shortLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer Telemetry Strip */}
      <div className="mt-1 pt-2.5 border-t border-hairline flex items-center justify-between gap-2 font-mono-tech text-[10px] text-[#F2EFE9]/58">
        <span className="tabular-nums">
          {t.forge.sparklineTotal}:{' '}
          <strong className="font-medium text-[#F2EFE9]">{formatEgo(stats.total7d, 0)}</strong>
        </span>
        <span className="tabular-nums">
          {t.forge.sparklineAvg}:{' '}
          <strong className="font-medium text-[#F2EFE9]">{formatEgo(stats.avg, 0)}</strong>
        </span>
        <span className="tabular-nums text-end">
          {activeDay.claimsCount} {t.forge.sparklineClaims}
        </span>
      </div>
    </div>
  );
};
