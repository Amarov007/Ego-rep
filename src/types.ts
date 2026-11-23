export type Language = 'en' | 'ar';

export type ScreenId = 'forge' | 'tasks' | 'upgrade' | 'circle' | 'wallet' | 'ranks';

export type RepPillar = 'execute' | 'growth' | 'obsession';

export type TaskGroup = 'daily' | 'partners' | 'onetime';

export type TaskActionType =
  | 'telegram_channel'
  | 'external_link'
  | 'invite_friends'
  | 'daily_checkin'
  | 'connect_wallet';

export type TaskStatus = 'idle' | 'started' | 'verifying' | 'claimable' | 'completed';

export interface ForgeLevelConfig {
  level: number;
  nameEn: string;
  nameAr: string;
  costEgo: number;
  baseEgoPerHour: number;
  deltaEgoPerHour: number;
  xpReward: number;
}

export interface BoostPackConfig {
  id: string;
  tonAmount: number;
  multiplier: number;
  durationEn: string;
  durationAr: string;
  labelEn: string;
  labelAr: string;
  accentColor: string;
  xpReward: number;
}

export interface RankConfig {
  id: 'dust' | 'spark' | 'iron' | 'blade' | 'monolith' | 'ego';
  nameEn: string;
  nameAr: string;
  minXp: number;
  miningBonusPct: number;
  epithetEn: string;
  epithetAr: string;
}

export interface TaskItem {
  id: string;
  group: TaskGroup;
  type: TaskActionType;
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  rewardEgo: number;
  rewardXp: number;
  url?: string;
  requiredFriends?: number;
  status: TaskStatus;
}

export interface DepositRecord {
  id: string;
  packId: string;
  tonAmount: number;
  multiplier: number;
  txHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: number;
  confirmedAt?: number;
}

export interface ReferralMember {
  id: string;
  handle: string;
  tier: 1 | 2;
  joinedAt: number;
  egoMined: number;
  commissionEarned: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  handle: string;
  ego: number;
  xp: number;
  rankId: RankConfig['id'];
  isCurrentUser?: boolean;
}

export interface TelegramUserProfile {
  id: number;
  firstName: string;
  username?: string;
  photoUrl?: string;
  isTelegramEnv: boolean;
}

export interface DailyMiningPoint {
  dateKey: string;
  egoClaimed: number;
  claimsCount: number;
}

export interface GameState {
  hasSeenIntro: boolean;
  language: Language;
  userId: string;
  displayName: string;
  referralCode: string;
  referredByCode: string | null;
  egoBalance: number;
  lifetimeEgo: number;
  xp: number;
  forgeLevel: number;
  /** Timestamp (ms) when the current 6-hour forge mining cycle began. */
  lastClaimAt: number;
  /** Owned permanent boost pack IDs. */
  ownedBoostIds: string[];
  /** Daily discipline reps state (reset per UTC calendar day). */
  repsDateKey: string;
  repsCompleted: Record<RepPillar, boolean>;
  streakDays: number;
  streakAwardedToday: boolean;
  /** Task state map. */
  tasks: TaskItem[];
  /** Connected TON address (raw or friendly, cached for UI). */
  walletAddress: string | null;
  /** Deposit history. */
  deposits: DepositRecord[];
  /** Invited circle members. */
  referrals: ReferralMember[];
  /** Total EGO earned from friends' mining. */
  referralBonusEgo: number;
  /** 7-day rolling Forge mining history for the productivity sparkline. */
  dailyMiningHistory?: DailyMiningPoint[];
}
