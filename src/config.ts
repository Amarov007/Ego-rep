import { BoostPackConfig, ForgeLevelConfig, RankConfig } from './types';

/**
 * EGO REP — Central Configuration
 * Replace DEPOSIT_ADDRESS and BOT_USERNAME before production deployment.
 */
export const APP_CONFIG = {
  /** Destination TON wallet address for Boost Pack deposits (placeholder — replace with your treasury wallet). */
  DEPOSIT_ADDRESS: 'UQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJKZ',

  /** Telegram bot username without leading @ (used for t.me referral links). */
  BOT_USERNAME: 'EgoRepBot',

  /** Forge mining tank duration in seconds (6 hours). */
  CLAIM_INTERVAL_SECONDS: 6 * 60 * 60,

  /** Minimum seconds before an early partial claim can be triggered after a fresh cycle starts. */
  MIN_CLAIM_SECONDS: 15,

  /** Referral reward percentages. */
  REFERRAL: {
    /** Level 1: Direct invitee mining commission (10%). */
    TIER1_COMMISSION_PCT: 10,
    /** Level 2: Invitee-of-invitee commission (3%). */
    TIER2_COMMISSION_PCT: 3,
    /** Permanent mining speed bonus per direct invited friend (+5% each, capped at +100%). */
    SPEED_BONUS_PER_FRIEND_PCT: 5,
    MAX_FRIEND_SPEED_BONUS_PCT: 100,
    /** Instant XP granted per new friend. */
    XP_PER_FRIEND: 45,
  },

  /** Daily 3-Rep discipline streak configuration. */
  REPS: {
    XP_PER_REP: 20,
    BONUS_XP_ALL_THREE: 40,
    /** Each consecutive day completing all 3 reps adds +5% mining multiplier (up to +50%). */
    STREAK_BONUS_PER_DAY: 0.05,
    MAX_STREAK_BONUS: 0.5,
  },

  /** TON Connect manifest path (served from /public/tonconnect-manifest.json on public deployments). */
  TON_MANIFEST_PATH: '/tonconnect-manifest.json',

  /**
   * Publicly reachable, CORS-enabled fallback manifest for localhost and auth-gated
   * preview URLs where external TON wallets cannot anonymously fetch /tonconnect-manifest.json.
   * Override with VITE_TON_MANIFEST_URL in production.
   */
  TON_PREVIEW_MANIFEST_URL:
    'https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json',
} as const;

/**
 * Forge Upgrade Ladder
 * Each level adds permanent base EGO/hour output.
 */
export const FORGE_LEVELS: ForgeLevelConfig[] = [
  { level: 1, nameEn: 'Raw Basalt', nameAr: 'بازلت خام', costEgo: 0, baseEgoPerHour: 24, deltaEgoPerHour: 24, xpReward: 0 },
  { level: 2, nameEn: 'Hairline Fracture', nameAr: 'صدع أول', costEgo: 320, baseEgoPerHour: 42, deltaEgoPerHour: 18, xpReward: 40 },
  { level: 3, nameEn: 'Bound Monolith', nameAr: 'مسلّة مقيّدة', costEgo: 840, baseEgoPerHour: 72, deltaEgoPerHour: 30, xpReward: 75 },
  { level: 4, nameEn: 'Iron Seam', nameAr: 'عرق الحديد', costEgo: 1950, baseEgoPerHour: 120, deltaEgoPerHour: 48, xpReward: 120 },
  { level: 5, nameEn: 'Crimson Tension', nameAr: 'شدّ قرمزي', costEgo: 4400, baseEgoPerHour: 196, deltaEgoPerHour: 76, xpReward: 190 },
  { level: 6, nameEn: 'Cold Core', nameAr: 'قلب بارد', costEgo: 9800, baseEgoPerHour: 320, deltaEgoPerHour: 124, xpReward: 280 },
  { level: 7, nameEn: 'Shattered Kiln', nameAr: 'فرن متصدع', costEgo: 21500, baseEgoPerHour: 520, deltaEgoPerHour: 200, xpReward: 420 },
  { level: 8, nameEn: 'Obsidian Spire', nameAr: 'برج السبج', costEgo: 48000, baseEgoPerHour: 860, deltaEgoPerHour: 340, xpReward: 650 },
];

/**
 * TON Deposit Boost Packs
 * Permanent multipliers: highest owned pack sets base multiplier, plus +0.15x resonance per additional pack.
 */
export const BOOST_PACKS: BoostPackConfig[] = [
  {
    id: 'pack_1_ton',
    tonAmount: 1,
    multiplier: 1.2,
    durationEn: 'PERMANENT',
    durationAr: 'دائم',
    labelEn: 'Spark Catalyst',
    labelAr: 'محفّز الشرارة',
    accentColor: '#EDEAE4',
    xpReward: 120,
  },
  {
    id: 'pack_5_ton',
    tonAmount: 5,
    multiplier: 1.8,
    durationEn: 'PERMANENT',
    durationAr: 'دائم',
    labelEn: 'Crimson Binding',
    labelAr: 'رباط قرمزي',
    accentColor: '#C1121F',
    xpReward: 340,
  },
  {
    id: 'pack_10_ton',
    tonAmount: 10,
    multiplier: 2.5,
    durationEn: 'PERMANENT',
    durationAr: 'دائم',
    labelEn: 'Cold Aperture',
    labelAr: 'فتحة زرقاء',
    accentColor: '#2D6BFF',
    xpReward: 700,
  },
  {
    id: 'pack_50_ton',
    tonAmount: 50,
    multiplier: 5.0,
    durationEn: 'PERMANENT',
    durationAr: 'دائم',
    labelEn: 'Obsidian Sovereign',
    labelAr: 'سيادة السبج',
    accentColor: '#5FE3FF',
    xpReward: 2000,
  },
];

/**
 * Rank Progression Ladder
 * Dust → Spark → Iron → Blade → Monolith → Ego
 */
export const RANKS: RankConfig[] = [
  { id: 'dust', nameEn: 'Dust', nameAr: 'غبار', minXp: 0, miningBonusPct: 0, epithetEn: 'Unformed weight', epithetAr: 'ثقل غير متشكّل' },
  { id: 'spark', nameEn: 'Spark', nameAr: 'شرارة', minXp: 200, miningBonusPct: 5, epithetEn: 'First ignition', epithetAr: 'اشتعال أول' },
  { id: 'iron', nameEn: 'Iron', nameAr: 'حديد', minXp: 650, miningBonusPct: 12, epithetEn: 'Tempered under pressure', epithetAr: 'صلب تحت الضغط' },
  { id: 'blade', nameEn: 'Blade', nameAr: 'نصل', minXp: 1600, miningBonusPct: 22, epithetEn: 'Cut without hesitation', epithetAr: 'حسم بلا تردد' },
  { id: 'monolith', nameEn: 'Monolith', nameAr: 'مسلّة', minXp: 3800, miningBonusPct: 35, epithetEn: 'Immovable discipline', epithetAr: 'انضباط لا يتزحزح' },
  { id: 'ego', nameEn: 'Ego', nameAr: 'إيغو', minXp: 8500, miningBonusPct: 55, epithetEn: 'Absolute signal', epithetAr: 'إشارة مطلقة' },
];
