import { Language } from '../types';

export interface Dictionary {
  appName: string;
  intro: {
    execute: string;
    growth: string;
    obsession: string;
    enter: string;
    subtitle: string;
  };
  nav: {
    forge: string;
    tasks: string;
    upgrade: string;
    circle: string;
    wallet: string;
  };
  header: {
    rankLabel: string;
    back: string;
  };
  forge: {
    balanceLabel: string;
    miningActive: string;
    perHour: string;
    levelShort: string;
    claimReady: string;
    claimPartial: string;
    forging: string;
    nextCycle: string;
    tankFull: string;
    unclaimedLabel: string;
    dailyRepsTitle: string;
    streakLabel: string;
    daysUnit: string;
    allThreeComplete: string;
    completeAllThree: string;
    repExecute: string;
    repGrowth: string;
    repObsession: string;
    repDone: string;
    repTap: string;
    multiplierBreakdown: string;
    sparklineTitle: string;
    sparklineTotal: string;
    sparklineAvg: string;
    sparklineClaims: string;
    sparklineToday: string;
    milestonesTitle: string;
    milestonesNextRank: string;
    milestonesReady: string;
    milestonesRemaining: string;
    milestonesMaxLevel: string;
    milestonesViewAll: string;
    milestonesUpgradeNow: string;
  };
  tasks: {
    title: string;
    subtitle: string;
    groupDaily: string;
    groupPartners: string;
    groupOnetime: string;
    start: string;
    verify: string;
    verifying: string;
    claim: string;
    done: string;
    needFriends: string;
    needWallet: string;
    completedCount: string;
  };
  upgrade: {
    title: string;
    subtitle: string;
    forgeTableTitle: string;
    colLevel: string;
    colCost: string;
    colRate: string;
    colPayback: string;
    colAction: string;
    active: string;
    owned: string;
    upgrade: string;
    locked: string;
    insufficient: string;
    boostsTitle: string;
    boostsSubtitle: string;
    activate: string;
    activated: string;
    disclaimer: string;
    paybackHours: string;
    paybackDays: string;
    connectFirst: string;
  };
  circle: {
    title: string;
    subtitle: string;
    yourLink: string;
    copy: string;
    copied: string;
    share: string;
    invitedCount: string;
    bonusEarned: string;
    commissionRule: string;
    speedBonus: string;
    leaderboardTitle: string;
    colRank: string;
    colName: string;
    colBalance: string;
    invitedRoster: string;
    tier1: string;
    tier2: string;
    youTag: string;
    referredNotice: string;
    chartTitle: string;
    chartOverTime: string;
    chartByTier: string;
    chartCumulative: string;
    chartTotalUnit: string;
    chartHeadcountShare: string;
    chartYieldShare: string;
    chartTier1Label: string;
    chartTier2Label: string;
    chartAvgYield: string;
  };
  wallet: {
    title: string;
    subtitle: string;
    connectWallet: string;
    disconnect: string;
    demoWallet: string;
    demoBadge: string;
    connectedLabel: string;
    notConnected: string;
    depositTitle: string;
    depositSubtitle: string;
    sendTon: string;
    selectPack: string;
    txPending: string;
    txConfirmed: string;
    txFailed: string;
    historyTitle: string;
    noHistory: string;
    withdrawLabel: string;
    withdrawStatus: string;
    disclaimer: string;
    destinationLabel: string;
  };
  ranks: {
    title: string;
    currentRank: string;
    xpTotal: string;
    nextRank: string;
    maxRankReached: string;
    miningBonus: string;
    ladderTitle: string;
  };
}

export const TRANSLATIONS: Record<Language, Dictionary> = {
  en: {
    appName: 'EGO REP',
    intro: {
      execute: 'Execute',
      growth: 'Growth',
      obsession: 'Obsession',
      enter: 'ENTER',
      subtitle: 'T H E   F O R G E   A W A I T S',
    },
    nav: {
      forge: 'FORGE',
      tasks: 'TASKS',
      upgrade: 'UPGRADE',
      circle: 'CIRCLE',
      wallet: 'WALLET',
    },
    header: {
      rankLabel: 'RANK',
      back: 'BACK',
    },
    forge: {
      balanceLabel: '$EGO BALANCE',
      miningActive: 'MINING ACTIVE',
      perHour: 'EGO / HR',
      levelShort: 'LVL',
      claimReady: 'CLAIM',
      claimPartial: 'CLAIM',
      forging: 'FORGING',
      nextCycle: 'CYCLE REMAINING',
      tankFull: 'CAPACITY REACHED',
      unclaimedLabel: 'IN THE FORGE',
      dailyRepsTitle: 'DAILY REPS',
      streakLabel: 'STREAK',
      daysUnit: 'DAYS',
      allThreeComplete: 'STREAK MULTIPLIER ACTIVE',
      completeAllThree: 'COMPLETE ALL 3 FOR STREAK MULTIPLIER',
      repExecute: 'EXECUTE',
      repGrowth: 'GROWTH',
      repObsession: 'OBSESSION',
      repDone: 'LOGGED',
      repTap: 'MARK',
      multiplierBreakdown: 'OUTPUT',
      sparklineTitle: '7D MINING ACTIVITY',
      sparklineTotal: '7D TOTAL',
      sparklineAvg: 'DAILY AVG',
      sparklineClaims: 'CLAIMS',
      sparklineToday: 'NOW',
      milestonesTitle: 'FORGE MILESTONES',
      milestonesNextRank: 'NEXT RANK XP',
      milestonesReady: 'READY TO FORGE',
      milestonesRemaining: 'NEEDED',
      milestonesMaxLevel: 'PEAK FORGE LEVEL',
      milestonesViewAll: 'ALL LEVELS',
      milestonesUpgradeNow: 'FORGE NOW',
    },
    tasks: {
      title: 'DIRECTIVES',
      subtitle: 'Complete protocol tasks to expand output and rank XP.',
      groupDaily: 'DAILY',
      groupPartners: 'PARTNERS',
      groupOnetime: 'ONE-TIME',
      start: 'START',
      verify: 'VERIFY',
      verifying: 'CHECKING',
      claim: 'CLAIM',
      done: 'DONE',
      needFriends: 'INVITE REQUIRED',
      needWallet: 'CONNECT WALLET',
      completedCount: 'COMPLETED',
    },
    upgrade: {
      title: 'THE FORGE',
      subtitle: 'Reinforce base output with $EGO or permanent TON catalysts.',
      forgeTableTitle: 'FORGE LEVELS',
      colLevel: 'LVL',
      colCost: 'COST',
      colRate: '+EGO/HR',
      colPayback: 'PAYBACK',
      colAction: 'STATUS',
      active: 'CURRENT',
      owned: 'FORGED',
      upgrade: 'FORGE',
      locked: 'LOCKED',
      insufficient: 'LOW $EGO',
      boostsTitle: 'TON BOOST PACKS',
      boostsSubtitle: 'Permanent mining multipliers verified on TON.',
      activate: 'ACTIVATE',
      activated: 'ACTIVE',
      disclaimer: 'Deposits are final. Boosts are in-game items.',
      paybackHours: 'h',
      paybackDays: 'd',
      connectFirst: 'CONNECT IN WALLET',
    },
    circle: {
      title: 'THE CIRCLE',
      subtitle: 'Two-level lineage. 10% of direct mining, 3% of second tier.',
      yourLink: 'PERSONAL INVITE LINK',
      copy: 'COPY',
      copied: 'COPIED',
      share: 'SHARE',
      invitedCount: 'INVITED',
      bonusEarned: 'BONUS EARNED',
      commissionRule: '10% L1 · 3% L2 MINING',
      speedBonus: 'SPEED BONUS',
      leaderboardTitle: 'LEADERBOARD',
      colRank: 'NO.',
      colName: 'OPERATOR',
      colBalance: '$EGO',
      invitedRoster: 'LINEAGE ROSTER',
      tier1: 'L1 · 10%',
      tier2: 'L2 · 3%',
      youTag: 'YOU',
      referredNotice: 'LINKED VIA REFERRAL',
      chartTitle: 'LINEAGE DISTRIBUTION',
      chartOverTime: 'OVER TIME',
      chartByTier: 'BY TIER',
      chartCumulative: 'CUMULATIVE',
      chartTotalUnit: 'TOTAL',
      chartHeadcountShare: 'OPERATOR SHARE (L1 / L2)',
      chartYieldShare: 'YIELD CONTRIBUTION',
      chartTier1Label: 'TIER 1 · DIRECT',
      chartTier2Label: 'TIER 2 · EXTENDED',
      chartAvgYield: 'AVG / OPERATOR',
    },
    wallet: {
      title: 'WALLET',
      subtitle: 'TON Connect settlement layer for permanent Forge catalysts.',
      connectWallet: 'CONNECT TON WALLET',
      disconnect: 'DISCONNECT',
      demoWallet: 'USE PREVIEW WALLET',
      demoBadge: 'PREVIEW SESSION',
      connectedLabel: 'CONNECTED ADDRESS',
      notConnected: 'NO WALLET LINKED',
      depositTitle: 'TON DEPOSIT',
      depositSubtitle: 'Select a permanent boost pack and confirm in your wallet.',
      sendTon: 'SEND DEPOSIT',
      selectPack: 'SELECT BOOST PACK',
      txPending: 'PENDING VERIFICATION',
      txConfirmed: 'CONFIRMED',
      txFailed: 'FAILED',
      historyTitle: 'DEPOSIT LEDGER',
      noHistory: 'No deposits recorded.',
      withdrawLabel: 'WITHDRAW $EGO',
      withdrawStatus: 'OPENS AFTER LAUNCH',
      disclaimer: 'Deposits are final. Boosts are in-game items.',
      destinationLabel: 'TREASURY',
    },
    ranks: {
      title: 'ASCENSION',
      currentRank: 'CURRENT RANK',
      xpTotal: 'TOTAL XP',
      nextRank: 'NEXT TIER',
      maxRankReached: 'PEAK TIER REACHED',
      miningBonus: 'MINING BONUS',
      ladderTitle: 'LADDER',
    },
  },
  ar: {
    appName: 'إيغو ريب',
    intro: {
      execute: 'تنفيذ',
      growth: 'نمو',
      obsession: 'هوس',
      enter: 'دخول',
      subtitle: 'الفرن بانتظارك',
    },
    nav: {
      forge: 'الفرن',
      tasks: 'المهام',
      upgrade: 'الترقية',
      circle: 'الدائرة',
      wallet: 'المحفظة',
    },
    header: {
      rankLabel: 'الرتبة',
      back: 'رجوع',
    },
    forge: {
      balanceLabel: 'رصيد $EGO',
      miningActive: 'التعدين نشط',
      perHour: 'EGO / ساعة',
      levelShort: 'مستوى',
      claimReady: 'استلام',
      claimPartial: 'استلام',
      forging: 'قيد الصهر',
      nextCycle: 'المتبقي للدورة',
      tankFull: 'اكتملت السعة',
      unclaimedLabel: 'داخل الفرن',
      dailyRepsTitle: 'التكرارات اليومية',
      streakLabel: 'السلسلة',
      daysUnit: 'أيام',
      allThreeComplete: 'مضاعف السلسلة مفعّل',
      completeAllThree: 'أكمل الثلاثة لتفعيل مضاعف التعدين',
      repExecute: 'تنفيذ',
      repGrowth: 'نمو',
      repObsession: 'هوس',
      repDone: 'مكتمل',
      repTap: 'تثبيت',
      multiplierBreakdown: 'المضاعف',
      sparklineTitle: 'نشاط التعدين · 7 أيام',
      sparklineTotal: 'إجمالي 7 أيام',
      sparklineAvg: 'المتوسط اليومي',
      sparklineClaims: 'استلامات',
      sparklineToday: 'اليوم',
      milestonesTitle: 'محطات الفرن القادمة',
      milestonesNextRank: 'الرتبة التالية (XP)',
      milestonesReady: 'جاهز للترقية',
      milestonesRemaining: 'متبقي',
      milestonesMaxLevel: 'أقصى مستوى للفرن',
      milestonesViewAll: 'كل المستويات',
      milestonesUpgradeNow: 'ترقية الآن',
    },
    tasks: {
      title: 'المهام',
      subtitle: 'أنجز المهام لرفع سرعة التعدين ونقاط الخبرة.',
      groupDaily: 'يومية',
      groupPartners: 'الشركاء',
      groupOnetime: 'مرة واحدة',
      start: 'ابدأ',
      verify: 'تحقق',
      verifying: 'جاري التحقق',
      claim: 'استلام',
      done: 'تم',
      needFriends: 'يتطلب دعوة',
      needWallet: 'اربط المحفظة',
      completedCount: 'مكتمل',
    },
    upgrade: {
      title: 'الفرن',
      subtitle: 'ارفع الإنتاج الأساسي بعملة $EGO أو بمضاعفات TON الدائمة.',
      forgeTableTitle: 'مستويات الفرن',
      colLevel: 'مستوى',
      colCost: 'التكلفة',
      colRate: '+EGO/ساعة',
      colPayback: 'الاسترداد',
      colAction: 'الحالة',
      active: 'الحالي',
      owned: 'مُنجز',
      upgrade: 'ترقية',
      locked: 'مغلق',
      insufficient: 'رصيد أقل',
      boostsTitle: 'حزم مضاعفة TON',
      boostsSubtitle: 'مضاعفات تعدين دائمة موثقة على شبكة TON.',
      activate: 'تفعيل',
      activated: 'مفعّل',
      disclaimer: 'الإيداعات نهائية. المضاعفات عناصر داخل اللعبة.',
      paybackHours: 'س',
      paybackDays: 'ي',
      connectFirst: 'اربط المحفظة أولاً',
    },
    circle: {
      title: 'الدائرة',
      subtitle: 'نظام من مستويين. 10% من تعدين المباشرين و3% من المستوى الثاني.',
      yourLink: 'رابط الدعوة الشخصي',
      copy: 'نسخ',
      copied: 'تم النسخ',
      share: 'مشاركة',
      invitedCount: 'المدعوون',
      bonusEarned: 'العوائد المكتسبة',
      commissionRule: '10% مستوى 1 · 3% مستوى 2',
      speedBonus: 'سرعة إضافية',
      leaderboardTitle: 'المتصدرون',
      colRank: 'المركز',
      colName: 'الاسم',
      colBalance: '$EGO',
      invitedRoster: 'سجل الدائرة',
      tier1: 'مستوى 1 · 10%',
      tier2: 'مستوى 2 · 3%',
      youTag: 'أنت',
      referredNotice: 'مرتبط عبر دعوة',
      chartTitle: 'توزيع الدائرة',
      chartOverTime: 'عبر الزمن',
      chartByTier: 'حسب المستوى',
      chartCumulative: 'التراكمي',
      chartTotalUnit: 'إجمالي',
      chartHeadcountShare: 'نسبة الأعضاء (م1 / م2)',
      chartYieldShare: 'مساهمة العوائد',
      chartTier1Label: 'المستوى 1 · مباشر',
      chartTier2Label: 'المستوى 2 · ممتد',
      chartAvgYield: 'المتوسط / عضو',
    },
    wallet: {
      title: 'المحفظة',
      subtitle: 'طبقة TON Connect لتفعيل حزم المضاعفة الدائمة.',
      connectWallet: 'ربط محفظة TON',
      disconnect: 'فصل المحفظة',
      demoWallet: 'استخدام محفظة معاينة',
      demoBadge: 'جلسة معاينة',
      connectedLabel: 'العنوان المرتبط',
      notConnected: 'لا توجد محفظة مرتبطة',
      depositTitle: 'إيداع TON',
      depositSubtitle: 'اختر حزمة مضاعفة دائمة وأكّد المعاملة من محفظتك.',
      sendTon: 'إرسال الإيداع',
      selectPack: 'اختر حزمة',
      txPending: 'قيد التحقق',
      txConfirmed: 'مؤكّد',
      txFailed: 'فشل',
      historyTitle: 'سجل الإيداعات',
      noHistory: 'لا توجد إيداعات مسجلة.',
      withdrawLabel: 'سحب $EGO',
      withdrawStatus: 'يفتح بعد الإطلاق',
      disclaimer: 'الإيداعات نهائية. المضاعفات عناصر داخل اللعبة.',
      destinationLabel: 'الخزينة',
    },
    ranks: {
      title: 'الرتب',
      currentRank: 'الرتبة الحالية',
      xpTotal: 'إجمالي الخبرة',
      nextRank: 'الرتبة التالية',
      maxRankReached: 'أعلى رتبة',
      miningBonus: 'مكافأة التعدين',
      ladderTitle: 'السلم',
    },
  },
};
