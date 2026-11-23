import { APP_CONFIG, BOOST_PACKS, FORGE_LEVELS } from '../config';
import {
  DailyMiningPoint,
  DepositRecord,
  GameState,
  LeaderboardEntry,
  RepPillar,
  TaskItem,
  TelegramUserProfile,
} from '../types';
import { calculateForgeCharge, getRankForXp, getTodayDateKey } from '../utils/gameMath';

const STORAGE_KEY = 'ego_rep_state_v1';

function buildSeedTasks(): TaskItem[] {
  return [
    {
      id: 'daily_checkin',
      group: 'daily',
      type: 'daily_checkin',
      titleEn: 'Daily Presence Check-In',
      titleAr: 'تسجيل الحضور اليومي',
      subtitleEn: 'Confirm your daily forge attendance',
      subtitleAr: 'أكّد حضورك اليومي أمام الفرن',
      rewardEgo: 120,
      rewardXp: 25,
      status: 'idle',
    },
    {
      id: 'daily_signal_read',
      group: 'daily',
      type: 'external_link',
      titleEn: 'Read Today’s EGO Dispatch',
      titleAr: 'قراءة نشرة إيغو اليومية',
      subtitleEn: 'Open the studio manifesto dispatch',
      subtitleAr: 'افتح نشرة الاستوديو اليومية',
      rewardEgo: 160,
      rewardXp: 30,
      url: 'https://t.me/telegram',
      status: 'idle',
    },
    {
      id: 'partner_channel_core',
      group: 'partners',
      type: 'telegram_channel',
      titleEn: 'Join EGO REP Broadcast',
      titleAr: 'الانضمام لقناة إيغو ريب',
      subtitleEn: 'Official Telegram channel for forge epochs',
      subtitleAr: 'القناة الرسمية لتحديثات الفرن',
      rewardEgo: 400,
      rewardXp: 65,
      url: 'https://t.me/telegram',
      status: 'idle',
    },
    {
      id: 'partner_ton_foundation',
      group: 'partners',
      type: 'external_link',
      titleEn: 'Explore TON Ecosystem Portal',
      titleAr: 'استكشاف بوابة شبكة TON',
      subtitleEn: 'Inspect the settlement network behind boosts',
      subtitleAr: 'اطّلع على البنية التحتية لشبكة TON',
      rewardEgo: 320,
      rewardXp: 50,
      url: 'https://ton.org',
      status: 'idle',
    },
    {
      id: 'partner_monolith_archive',
      group: 'partners',
      type: 'external_link',
      titleEn: 'Follow Monolith Studio Journal',
      titleAr: 'متابعة أرشيف استوديو مونوليث',
      subtitleEn: 'Partner design & architecture collective',
      subtitleAr: 'شريك التصميم والعمارة البصرية',
      rewardEgo: 280,
      rewardXp: 45,
      url: 'https://t.me/telegram',
      status: 'completed',
    },
    {
      id: 'onetime_connect_wallet',
      group: 'onetime',
      type: 'connect_wallet',
      titleEn: 'Bind TON Wallet',
      titleAr: 'ربط محفظة TON',
      subtitleEn: 'Link a TON Connect wallet in the Wallet tab',
      subtitleAr: 'اربط محفظتك عبر TON Connect في قسم المحفظة',
      rewardEgo: 650,
      rewardXp: 110,
      status: 'idle',
    },
    {
      id: 'onetime_invite_3',
      group: 'onetime',
      type: 'invite_friends',
      titleEn: 'Induct 3 Operators into Circle',
      titleAr: 'دعوة 3 أعضاء إلى الدائرة',
      subtitleEn: 'Direct Level-1 referrals count toward induction',
      subtitleAr: 'الدعوات المباشرة من المستوى الأول تُحتسب تلقائياً',
      rewardEgo: 900,
      rewardXp: 160,
      requiredFriends: 3,
      status: 'idle',
    },
    {
      id: 'onetime_invite_10',
      group: 'onetime',
      type: 'invite_friends',
      titleEn: 'Induct 10 Operators into Circle',
      titleAr: 'دعوة 10 أعضاء إلى الدائرة',
      subtitleEn: 'Expand lineage for permanent speed compounding',
      subtitleAr: 'وسّع دائرتك لمضاعفة سرعة التعدين',
      rewardEgo: 3200,
      rewardXp: 420,
      requiredFriends: 10,
      status: 'idle',
    },
  ];
}

function buildSeedMiningHistory(): DailyMiningPoint[] {
  const now = new Date();
  const seedCurve = [
    { ego: 186, claims: 2 },
    { ego: 244, claims: 3 },
    { ego: 218, claims: 2 },
    { ego: 312, claims: 3 },
    { ego: 368, claims: 4 },
    { ego: 410, claims: 4 },
    { ego: 194, claims: 1 }, // Today before current full tank is claimed
  ];

  return seedCurve.map((entry, idx) => {
    const offset = 6 - idx;
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - offset));
    return {
      dateKey: d.toISOString().slice(0, 10),
      egoClaimed: entry.ego,
      claimsCount: entry.claims,
    };
  });
}

function buildSeedState(user: TelegramUserProfile, startParam: string | null): GameState {
  const now = Date.now();
  const codeBase = (user.username || user.firstName || 'EGO')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 4);
  const referralCode = `${codeBase || 'EGO'}${String(user.id).slice(-4)}`;

  // Seed lastClaimAt 6 hours ago so first visit opens with a fully charged glowing Forge ready to CLAIM
  const fullChargeStart = now - APP_CONFIG.CLAIM_INTERVAL_SECONDS * 1000;

  const referrals = [
    {
      id: 'ref_1',
      handle: '@sora_v',
      tier: 1 as const,
      joinedAt: now - 1000 * 60 * 60 * 126,
      egoMined: 2140,
      commissionEarned: 214,
    },
    {
      id: 'ref_2',
      handle: '@m_haddad',
      tier: 1 as const,
      joinedAt: now - 1000 * 60 * 60 * 98,
      egoMined: 1680,
      commissionEarned: 168,
    },
    {
      id: 'ref_3',
      handle: '@noor_k',
      tier: 1 as const,
      joinedAt: now - 1000 * 60 * 60 * 28,
      egoMined: 940,
      commissionEarned: 94,
    },
    {
      id: 'ref_4',
      handle: '@voss_09',
      tier: 2 as const,
      joinedAt: now - 1000 * 60 * 60 * 52,
      egoMined: 1850,
      commissionEarned: 55.5,
    },
    {
      id: 'ref_5',
      handle: '@t_almani',
      tier: 2 as const,
      joinedAt: now - 1000 * 60 * 60 * 4,
      egoMined: 1120,
      commissionEarned: 33.6,
    },
  ];

  // If arrived via referral start_param (different from own code), credit a welcome bonus
  const validReferral =
    startParam && startParam.toUpperCase() !== referralCode.toUpperCase()
      ? startParam.toUpperCase()
      : null;

  return {
    hasSeenIntro: false,
    language: 'en',
    userId: String(user.id),
    displayName: user.firstName,
    referralCode,
    referredByCode: validReferral,
    egoBalance: validReferral ? 1590 : 1440,
    lifetimeEgo: validReferral ? 2430 : 2280,
    xp: 740, // Places user cleanly inside IRON rank (650..1600 XP)
    forgeLevel: 2,
    lastClaimAt: fullChargeStart,
    ownedBoostIds: [],
    repsDateKey: getTodayDateKey(),
    repsCompleted: {
      execute: false,
      growth: false,
      obsession: false,
    },
    streakDays: 3,
    streakAwardedToday: false,
    tasks: buildSeedTasks(),
    walletAddress: null,
    deposits: [
      {
        id: 'dep_seed_0',
        packId: 'pack_1_ton',
        tonAmount: 1,
        multiplier: 1.2,
        txHash: '0x9a4f7c218b3d10fe84ab19c4d2e0771f',
        status: 'confirmed',
        createdAt: now - 1000 * 60 * 60 * 46,
        confirmedAt: now - 1000 * 60 * 60 * 46 + 14000,
      },
    ],
    referrals,
    referralBonusEgo: 565.1,
    dailyMiningHistory: buildSeedMiningHistory(),
  };
}

const MOCK_LEADERBOARD_OPERATORS: Omit<LeaderboardEntry, 'isCurrentUser'>[] = [
  { id: 'lb_1', name: 'A. Moreau', handle: '@amoreau', ego: 94210, xp: 9120, rankId: 'ego' },
  { id: 'lb_2', name: 'Tariq Z.', handle: '@tariqz', ego: 71840, xp: 5420, rankId: 'monolith' },
  { id: 'lb_3', name: 'K. Volkov', handle: '@volkov_k', ego: 58390, xp: 4180, rankId: 'monolith' },
  { id: 'lb_4', name: 'Hana Sato', handle: '@hanasato', ego: 34920, xp: 2490, rankId: 'blade' },
  { id: 'lb_5', name: 'L. Lindqvist', handle: '@lindqvist', ego: 21450, xp: 1840, rankId: 'blade' },
  { id: 'lb_6', name: 'Sami R.', handle: '@samir_01', ego: 9840, xp: 1120, rankId: 'iron' },
  { id: 'lb_7', name: 'Elena N.', handle: '@elena_noir', ego: 4120, xp: 810, rankId: 'iron' },
  { id: 'lb_8', name: 'D. Chen', handle: '@dchen_sys', ego: 1180, xp: 460, rankId: 'spark' },
  { id: 'lb_9', name: 'O. Farid', handle: '@ofarid', ego: 640, xp: 180, rankId: 'dust' },
];

/**
 * Async Storage Service
 * Uses localStorage under the hood while exposing the exact async contract
 * expected from a future REST API backend.
 */
export const storageService = {
  async loadState(user: TelegramUserProfile, startParam: string | null): Promise<GameState> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as GameState;
        const today = getTodayDateKey();
        // Roll over daily reps & daily tasks if calendar day changed
        if (parsed.repsDateKey !== today) {
          const completedAllYesterday =
            parsed.repsCompleted.execute &&
            parsed.repsCompleted.growth &&
            parsed.repsCompleted.obsession;
          parsed.repsDateKey = today;
          parsed.repsCompleted = { execute: false, growth: false, obsession: false };
          parsed.streakAwardedToday = false;
          if (!completedAllYesterday) {
            parsed.streakDays = 0;
          }
          parsed.tasks = parsed.tasks.map((t) =>
            t.group === 'daily' ? { ...t, status: 'idle' } : t
          );
        }
        // Apply start_param referral if not already linked
        if (
          startParam &&
          !parsed.referredByCode &&
          startParam.toUpperCase() !== parsed.referralCode.toUpperCase()
        ) {
          parsed.referredByCode = startParam.toUpperCase();
          parsed.egoBalance += 150;
          parsed.lifetimeEgo += 150;
          parsed.xp += 30;
        }
        // Backfill 7-day mining history for existing persisted sessions
        if (!parsed.dailyMiningHistory || parsed.dailyMiningHistory.length === 0) {
          parsed.dailyMiningHistory = buildSeedMiningHistory();
        }
        // Sync display name from Telegram when available
        if (user.isTelegramEnv && user.firstName) {
          parsed.displayName = user.firstName;
        }
        await this.saveState(parsed);
        return parsed;
      }
    } catch {
      // Fallback to fresh seed if localStorage is corrupt or restricted
    }

    const seeded = buildSeedState(user, startParam);
    // Reflect the seeded confirmed 1 TON boost in ownedBoostIds? Keep ownedBoostIds empty initially
    // so users can activate any pack fresh, or include pack_1_ton so ledger & boosts match cleanly:
    seeded.ownedBoostIds = ['pack_1_ton'];
    await this.saveState(seeded);
    return seeded;
  },

  async saveState(state: GameState): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors in restricted webviews
    }
  },

  async claimForge(state: GameState): Promise<{
    nextState: GameState;
    claimedAmount: number;
    xpGained: number;
    rankedUp: boolean;
  }> {
    const now = Date.now();
    const { accumulatedEgo, canClaim } = calculateForgeCharge(state, now);
    if (!canClaim) {
      return { nextState: state, claimedAmount: 0, xpGained: 0, rankedUp: false };
    }

    const prevRank = getRankForXp(state.xp).current.id;
    const claimedAmount = Number(accumulatedEgo.toFixed(2));
    const xpGained = Math.max(10, Math.round(claimedAmount * 0.25));
    const nextXp = state.xp + xpGained;
    const nextRank = getRankForXp(nextXp).current.id;

    const todayKey = getTodayDateKey();
    const existingHistory = state.dailyMiningHistory?.length
      ? [...state.dailyMiningHistory]
      : buildSeedMiningHistory();
    const todayIdx = existingHistory.findIndex((item) => item.dateKey === todayKey);
    if (todayIdx >= 0) {
      existingHistory[todayIdx] = {
        ...existingHistory[todayIdx],
        egoClaimed: Number((existingHistory[todayIdx].egoClaimed + claimedAmount).toFixed(2)),
        claimsCount: existingHistory[todayIdx].claimsCount + 1,
      };
    } else {
      existingHistory.push({
        dateKey: todayKey,
        egoClaimed: claimedAmount,
        claimsCount: 1,
      });
    }
    const trimmedHistory = existingHistory.slice(-14);

    const nextState: GameState = {
      ...state,
      egoBalance: Number((state.egoBalance + claimedAmount).toFixed(2)),
      lifetimeEgo: Number((state.lifetimeEgo + claimedAmount).toFixed(2)),
      xp: nextXp,
      lastClaimAt: now,
      dailyMiningHistory: trimmedHistory,
    };

    await this.saveState(nextState);
    return {
      nextState,
      claimedAmount,
      xpGained,
      rankedUp: nextRank !== prevRank,
    };
  },

  async toggleRep(
    state: GameState,
    pillar: RepPillar
  ): Promise<{ nextState: GameState; rankedUp: boolean; completedAllThreeNow: boolean }> {
    if (state.repsCompleted[pillar]) {
      return { nextState: state, rankedUp: false, completedAllThreeNow: false };
    }

    const prevRank = getRankForXp(state.xp).current.id;
    const nextReps = { ...state.repsCompleted, [pillar]: true };
    const allThree = nextReps.execute && nextReps.growth && nextReps.obsession;
    const completedAllThreeNow = allThree && !state.streakAwardedToday;

    const xpGain =
      APP_CONFIG.REPS.XP_PER_REP + (completedAllThreeNow ? APP_CONFIG.REPS.BONUS_XP_ALL_THREE : 0);
    const nextXp = state.xp + xpGain;
    const nextRank = getRankForXp(nextXp).current.id;

    const nextState: GameState = {
      ...state,
      repsCompleted: nextReps,
      xp: nextXp,
      streakDays: completedAllThreeNow ? state.streakDays + 1 : state.streakDays,
      streakAwardedToday: completedAllThreeNow ? true : state.streakAwardedToday,
    };

    await this.saveState(nextState);
    return {
      nextState,
      rankedUp: nextRank !== prevRank,
      completedAllThreeNow,
    };
  },

  async upgradeForge(
    state: GameState,
    targetLevel: number
  ): Promise<{ nextState: GameState; rankedUp: boolean; ok: boolean }> {
    const cfg = FORGE_LEVELS.find((l) => l.level === targetLevel);
    if (!cfg || targetLevel !== state.forgeLevel + 1 || state.egoBalance < cfg.costEgo) {
      return { nextState: state, rankedUp: false, ok: false };
    }

    const prevRank = getRankForXp(state.xp).current.id;
    const nextXp = state.xp + cfg.xpReward;
    const nextRank = getRankForXp(nextXp).current.id;

    const nextState: GameState = {
      ...state,
      egoBalance: Number((state.egoBalance - cfg.costEgo).toFixed(2)),
      forgeLevel: targetLevel,
      xp: nextXp,
    };

    await this.saveState(nextState);
    return { nextState, rankedUp: nextRank !== prevRank, ok: true };
  },

  async updateTaskStatus(
    state: GameState,
    taskId: string,
    status: TaskItem['status'],
    grantReward = false
  ): Promise<{ nextState: GameState; rankedUp: boolean }> {
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task) return { nextState: state, rankedUp: false };

    const prevRank = getRankForXp(state.xp).current.id;
    const nextTasks = state.tasks.map((t) => (t.id === taskId ? { ...t, status } : t));
    const egoGain = grantReward && task.status !== 'completed' ? task.rewardEgo : 0;
    const xpGain = grantReward && task.status !== 'completed' ? task.rewardXp : 0;
    const nextXp = state.xp + xpGain;
    const nextRank = getRankForXp(nextXp).current.id;

    const nextState: GameState = {
      ...state,
      tasks: nextTasks,
      egoBalance: Number((state.egoBalance + egoGain).toFixed(2)),
      lifetimeEgo: Number((state.lifetimeEgo + egoGain).toFixed(2)),
      xp: nextXp,
    };

    await this.saveState(nextState);
    return { nextState, rankedUp: nextRank !== prevRank };
  },

  async addPendingDeposit(state: GameState, record: DepositRecord): Promise<GameState> {
    const nextState: GameState = {
      ...state,
      deposits: [record, ...state.deposits],
    };
    await this.saveState(nextState);
    return nextState;
  },

  async finalizeDeposit(
    state: GameState,
    depositId: string,
    verified: boolean
  ): Promise<{ nextState: GameState; rankedUp: boolean }> {
    const target = state.deposits.find((d) => d.id === depositId);
    if (!target) return { nextState: state, rankedUp: false };

    const pack = BOOST_PACKS.find((p) => p.id === target.packId);
    const prevRank = getRankForXp(state.xp).current.id;

    const nextDeposits = state.deposits.map((d) =>
      d.id === depositId
        ? {
            ...d,
            status: verified ? ('confirmed' as const) : ('failed' as const),
            confirmedAt: verified ? Date.now() : undefined,
          }
        : d
    );

    const nextOwned =
      verified && pack && !state.ownedBoostIds.includes(pack.id)
        ? [...state.ownedBoostIds, pack.id]
        : state.ownedBoostIds;

    const xpGain = verified && pack ? pack.xpReward : 0;
    const nextXp = state.xp + xpGain;
    const nextRank = getRankForXp(nextXp).current.id;

    const nextState: GameState = {
      ...state,
      deposits: nextDeposits,
      ownedBoostIds: nextOwned,
      xp: nextXp,
    };

    await this.saveState(nextState);
    return { nextState, rankedUp: nextRank !== prevRank };
  },

  async getLeaderboard(state: GameState): Promise<LeaderboardEntry[]> {
    const userRank = getRankForXp(state.xp).current.id;
    const currentUserEntry: LeaderboardEntry = {
      id: state.userId,
      name: state.displayName,
      handle: `@${state.referralCode.toLowerCase()}`,
      ego: Math.round(state.egoBalance),
      xp: state.xp,
      rankId: userRank,
      isCurrentUser: true,
    };

    return [...MOCK_LEADERBOARD_OPERATORS, currentUserEntry].sort((a, b) => b.ego - a.ego);
  },
};
