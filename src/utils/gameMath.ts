import { APP_CONFIG, BOOST_PACKS, FORGE_LEVELS, RANKS } from '../config';
import { GameState, RankConfig } from '../types';

export function getTodayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getRankForXp(xp: number): {
  current: RankConfig;
  next: RankConfig | null;
  index: number;
  progressPct: number;
} {
  let idx = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].minXp) {
      idx = i;
    }
  }
  const current = RANKS[idx];
  const next = idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
  const progressPct = next
    ? Math.min(100, Math.max(0, ((xp - current.minXp) / (next.minXp - current.minXp)) * 100))
    : 100;

  return { current, next, index: idx, progressPct };
}

export function getOverallXpLineProgress(xp: number): number {
  const maxXp = RANKS[RANKS.length - 1].minXp;
  if (xp >= maxXp) return 100;
  // Distribute evenly across segments between rank tiers so the vertical ladder aligns with milestones
  for (let i = 0; i < RANKS.length - 1; i++) {
    const start = RANKS[i].minXp;
    const end = RANKS[i + 1].minXp;
    if (xp >= start && xp < end) {
      const segProgress = (xp - start) / (end - start);
      const segmentSpan = 100 / (RANKS.length - 1);
      return i * segmentSpan + segProgress * segmentSpan;
    }
  }
  return 0;
}

export function getTonBoostMultiplier(ownedBoostIds: string[]): number {
  if (!ownedBoostIds.length) return 1;
  const ownedPacks = BOOST_PACKS.filter((p) => ownedBoostIds.includes(p.id));
  if (!ownedPacks.length) return 1;
  const highest = Math.max(...ownedPacks.map((p) => p.multiplier));
  const extraCount = ownedPacks.length - 1;
  return Number((highest + extraCount * 0.15).toFixed(2));
}

export function getStreakMultiplier(streakDays: number, allThreeToday: boolean): number {
  const activeDays = allThreeToday ? Math.max(1, streakDays) : streakDays;
  if (activeDays <= 0) return 1;
  const bonus = Math.min(APP_CONFIG.REPS.MAX_STREAK_BONUS, activeDays * APP_CONFIG.REPS.STREAK_BONUS_PER_DAY);
  return Number((1 + bonus).toFixed(2));
}

export function getReferralSpeedMultiplier(directFriendsCount: number): number {
  const pct = Math.min(
    APP_CONFIG.REFERRAL.MAX_FRIEND_SPEED_BONUS_PCT,
    directFriendsCount * APP_CONFIG.REFERRAL.SPEED_BONUS_PER_FRIEND_PCT
  );
  return Number((1 + pct / 100).toFixed(2));
}

export interface MiningRateBreakdown {
  baseEgoPerHour: number;
  tonMultiplier: number;
  streakMultiplier: number;
  referralMultiplier: number;
  rankMultiplier: number;
  totalMultiplier: number;
  effectiveEgoPerHour: number;
}

export function calculateMiningRate(state: GameState): MiningRateBreakdown {
  const levelCfg = FORGE_LEVELS.find((l) => l.level === state.forgeLevel) ?? FORGE_LEVELS[0];
  const baseEgoPerHour = levelCfg.baseEgoPerHour;
  const tonMultiplier = getTonBoostMultiplier(state.ownedBoostIds);
  const allThree =
    state.repsCompleted.execute && state.repsCompleted.growth && state.repsCompleted.obsession;
  const streakMultiplier = getStreakMultiplier(state.streakDays, allThree);
  const tier1Friends = state.referrals.filter((r) => r.tier === 1).length;
  const referralMultiplier = getReferralSpeedMultiplier(tier1Friends);
  const { current: rank } = getRankForXp(state.xp);
  const rankMultiplier = Number((1 + rank.miningBonusPct / 100).toFixed(2));

  const totalMultiplier = Number(
    (tonMultiplier * streakMultiplier * referralMultiplier * rankMultiplier).toFixed(2)
  );
  const effectiveEgoPerHour = Number((baseEgoPerHour * totalMultiplier).toFixed(2));

  return {
    baseEgoPerHour,
    tonMultiplier,
    streakMultiplier,
    referralMultiplier,
    rankMultiplier,
    totalMultiplier,
    effectiveEgoPerHour,
  };
}

export function calculateForgeCharge(state: GameState, nowMs: number = Date.now()) {
  const elapsedSeconds = Math.max(0, (nowMs - state.lastClaimAt) / 1000);
  const clampedSeconds = Math.min(APP_CONFIG.CLAIM_INTERVAL_SECONDS, elapsedSeconds);
  const remainingSeconds = Math.max(0, APP_CONFIG.CLAIM_INTERVAL_SECONDS - elapsedSeconds);
  const progress = Math.min(1, clampedSeconds / APP_CONFIG.CLAIM_INTERVAL_SECONDS);
  const isFull = remainingSeconds <= 0;

  const { effectiveEgoPerHour } = calculateMiningRate(state);
  const accumulatedEgo = (effectiveEgoPerHour / 3600) * clampedSeconds;
  const canClaim = elapsedSeconds >= APP_CONFIG.MIN_CLAIM_SECONDS && accumulatedEgo >= 0.05;

  return {
    elapsedSeconds,
    remainingSeconds,
    progress,
    isFull,
    accumulatedEgo,
    canClaim,
  };
}

export function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  return [hrs, mins, secs].map((n) => String(n).padStart(2, '0')).join(':');
}

export function formatEgo(value: number, decimals = 0): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPayback(costEgo: number, deltaEgoPerHour: number, hoursUnit: string, daysUnit: string): string {
  if (costEgo <= 0 || deltaEgoPerHour <= 0) return '—';
  const hours = costEgo / deltaEgoPerHour;
  if (hours < 48) {
    return `${hours.toFixed(1)}${hoursUnit}`;
  }
  return `${(hours / 24).toFixed(1)}${daysUnit}`;
}
