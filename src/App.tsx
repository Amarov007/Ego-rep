import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { TRANSLATIONS } from './i18n/translations';
import { verifyDeposit } from './services/api';
import { sound } from './services/sound';
import { storageService } from './services/storage';
import {
  bindTelegramBackButton,
  getStartParam,
  getTelegramUser,
  haptics,
  initTelegramApp,
} from './services/telegram';
import { getTonConnectUI, sendTonDepositTransaction } from './services/tonConnect';
import { BoostPackConfig, GameState, RepPillar, ScreenId, TaskItem } from './types';
import { formatEgo, getRankForXp } from './utils/gameMath';
import { AtmosphereCanvas } from './components/AtmosphereCanvas';
import { BottomNav } from './components/BottomNav';
import { CircleScreen } from './components/CircleScreen';
import { ForgeScreen } from './components/ForgeScreen';
import { IconRank, IconSoundOff, IconSoundOn } from './components/Icons';
import { IntroScreen } from './components/IntroScreen';
import { RanksScreen } from './components/RanksScreen';
import { ScanlinePulse } from './components/ScanlinePulse';
import { SignalToast, SignalToastData } from './components/SignalToast';
import { TasksScreen } from './components/TasksScreen';
import { UpgradeScreen } from './components/UpgradeScreen';
import { WalletScreen } from './components/WalletScreen';

export default function App() {
  const [state, setState] = useState<GameState | null>(null);
  const [screen, setScreen] = useState<ScreenId>('forge');
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => sound.isEnabled());

  // Claim, Rank-Up & Toast feedback states
  const [claimPulseKey, setClaimPulseKey] = useState(0);
  const [lastClaimDelta, setLastClaimDelta] = useState<number | null>(null);
  const [scanlineState, setScanlineState] = useState<{
    key: number;
    variant: 'claim' | 'rankup';
  }>({ key: 0, variant: 'claim' });
  const [toast, setToast] = useState<SignalToastData | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const toastCounterRef = useRef<number>(0);

  // Wallet & Deposit states
  const [isPreviewWallet, setIsPreviewWallet] = useState(false);
  const [pendingPackId, setPendingPackId] = useState<string | null>(null);
  const [preselectedPackId, setPreselectedPackId] = useState<string | null>(null);
  const [depositFeedback, setDepositFeedback] = useState<{
    tone: 'pending' | 'confirmed' | 'error';
    message: string;
  } | null>(null);

  const stateRef = useRef<GameState | null>(null);
  stateRef.current = state;

  const showToast = useCallback(
    (label: string, detail?: string, accent: SignalToastData['accent'] = 'bone') => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
      toastCounterRef.current += 1;
      setToast({ id: toastCounterRef.current, label, detail, accent });
      toastTimerRef.current = window.setTimeout(() => {
        setToast(null);
      }, 2400);
    },
    []
  );

  // 1. Initialize Telegram WebApp SDK and load persisted game state
  useEffect(() => {
    initTelegramApp();
    const user = getTelegramUser();
    const startParam = getStartParam();

    let mounted = true;
    storageService.loadState(user, startParam).then((loaded) => {
      if (mounted) {
        setState(loaded);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  // 2. Subscribe to @tonconnect/ui wallet status changes & errors
  useEffect(() => {
    const ui = getTonConnectUI();
    if (!ui) return;

    const unsubscribe = ui.onStatusChange(
      (wallet) => {
        const address = wallet?.account?.address ?? null;
        if (address) {
          setIsPreviewWallet(false);
          setDepositFeedback(null);
        }
        setState((prev) => {
          if (!prev) return prev;
          if (prev.walletAddress === address) return prev;
          const next: GameState = { ...prev, walletAddress: address };
          storageService.saveState(next);
          return next;
        });
      },
      (err) => {
        haptics.notificationOccurred('warning');
        sound.error();
        const isManifestIssue =
          err instanceof Error && /manifest/i.test(err.message);
        const isAr = stateRef.current?.language === 'ar';
        setDepositFeedback({
          tone: 'error',
          message: isManifestIssue
            ? isAr
              ? 'تعذر التحقق من بيانات المحفظة. أعد المحاولة أو استخدم محفظة المعاينة.'
              : 'Wallet manifest could not be verified. Retry or use Preview Wallet.'
            : isAr
            ? 'تم إلغاء الاتصال بالمحفظة أو فشل.'
            : 'Wallet connection was cancelled or failed.',
        });
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // 3. Sync HTML lang and dir attributes for English / Arabic RTL
  useEffect(() => {
    if (!state) return;
    document.documentElement.lang = state.language;
    document.documentElement.dir = state.language === 'ar' ? 'rtl' : 'ltr';
  }, [state?.language]);

  // 4. Live ticking passive-mining clock (every 250ms for smooth uncollected decimals)
  useEffect(() => {
    const interval = window.setInterval(() => {
      setNowMs(Date.now());
    }, 250);
    return () => window.clearInterval(interval);
  }, []);

  // 5. Bind Telegram native BackButton when viewing Ranks sub-screen
  useEffect(() => {
    return bindTelegramBackButton(screen === 'ranks', () => {
      haptics.tap();
      setScreen('forge');
    });
  }, [screen]);

  const triggerScanline = useCallback((variant: 'claim' | 'rankup') => {
    setScanlineState((prev) => ({ key: prev.key + 1, variant }));
  }, []);

  const handleToggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      haptics.toggle(next, false);
      sound.setEnabled(next);
      return next;
    });
  }, []);

  const handleToggleLanguage = useCallback(() => {
    setState((prev) => {
      if (!prev) return prev;
      const nextLang = prev.language === 'en' ? 'ar' : 'en';
      haptics.toggle(nextLang === 'ar');
      const next: GameState = { ...prev, language: nextLang };
      storageService.saveState(next);
      return next;
    });
  }, []);

  const handleEnterFromIntro = useCallback(() => {
    setState((prev) => {
      if (!prev) return prev;
      const next: GameState = { ...prev, hasSeenIntro: true };
      storageService.saveState(next);
      return next;
    });
  }, []);

  // FORGE: Claim accumulated $EGO
  const handleClaimForge = useCallback(async () => {
    const current = stateRef.current;
    if (!current) return;
    const { nextState, claimedAmount, xpGained, rankedUp } = await storageService.claimForge(
      current
    );
    if (claimedAmount <= 0) return;

    setState(nextState);
    setNowMs(Date.now());
    setLastClaimDelta(claimedAmount);
    setClaimPulseKey((k) => k + 1);
    triggerScanline(rankedUp ? 'rankup' : 'claim');
    if (rankedUp) {
      haptics.rankAscend();
      sound.rankUp();
    } else {
      haptics.forgeClaim();
      sound.claim();
    }

    const isAr = nextState.language === 'ar';
    if (rankedUp) {
      const rank = getRankForXp(nextState.xp).current;
      showToast(
        isAr ? `ترقية الرتبة · ${rank.nameAr}` : `RANK ASCENDED · ${rank.nameEn.toUpperCase()}`,
        `+${formatEgo(claimedAmount, 2)} $EGO`,
        'red'
      );
    } else {
      showToast(
        isAr ? 'تم استلام الصهر' : 'FORGE CLAIMED',
        `+${formatEgo(claimedAmount, 2)} $EGO · +${xpGained} XP`,
        'cyan'
      );
    }

    window.setTimeout(() => {
      setLastClaimDelta(null);
    }, 2600);
  }, [showToast, triggerScanline]);

  // FORGE: Interactive Monolith Strike feedback while charging
  const handleMonolithStrike = useCallback(() => {
    const current = stateRef.current;
    if (!current) return;
    haptics.monolithStrike();
    sound.strike();
    const isAr = current.language === 'ar';
    showToast(
      isAr ? 'الفرن قيد الشحن النشط' : 'FORGE RESONATING',
      `LVL 0${current.forgeLevel}`,
      'cyan'
    );
  }, [showToast]);

  // FORGE: Complete a daily Rep pillar (Execute / Growth / Obsession)
  const handleCompleteRep = useCallback(
    async (pillar: RepPillar) => {
      const current = stateRef.current;
      if (!current) return;
      const { nextState, rankedUp, completedAllThreeNow } = await storageService.toggleRep(
        current,
        pillar
      );
      setState(nextState);
      const isAr = nextState.language === 'ar';

      if (rankedUp) {
        triggerScanline('rankup');
        haptics.rankAscend();
        sound.rankUp();
        const rank = getRankForXp(nextState.xp).current;
        showToast(
          isAr ? `ترقية الرتبة · ${rank.nameAr}` : `RANK ASCENDED · ${rank.nameEn.toUpperCase()}`,
          `+${nextState.xp - current.xp} XP`,
          'red'
        );
      } else if (completedAllThreeNow) {
        haptics.triadComplete();
        sound.triadComplete();
        showToast(
          isAr ? 'اكتملت التكرارات الثلاثة' : 'DAILY TRIAD COMPLETE',
          `DAY ${String(nextState.streakDays).padStart(2, '0')} · +60 XP`,
          'terminal'
        );
      } else {
        haptics.repPillar(pillar);
        sound.rep(pillar);
        showToast(
          isAr ? 'تم تثبيت التكرار' : `${pillar.toUpperCase()} LOGGED`,
          '+20 XP',
          pillar === 'growth' ? 'red' : pillar === 'obsession' ? 'blue' : 'bone'
        );
      }
    },
    [showToast, triggerScanline]
  );

  // TASKS: Start -> Verify -> Claim
  const handleStartTask = useCallback(async (task: TaskItem) => {
    const current = stateRef.current;
    if (!current) return;
    const nextStatus = task.type === 'daily_checkin' ? 'claimable' : 'started';
    const { nextState } = await storageService.updateTaskStatus(current, task.id, nextStatus);
    setState(nextState);
  }, []);

  const handleVerifyTask = useCallback(async (task: TaskItem) => {
    const current = stateRef.current;
    if (!current) return;
    const { nextState: verifyingState } = await storageService.updateTaskStatus(
      current,
      task.id,
      'verifying'
    );
    setState(verifyingState);

    window.setTimeout(async () => {
      const latest = stateRef.current;
      if (!latest) return;
      const { nextState: claimableState } = await storageService.updateTaskStatus(
        latest,
        task.id,
        'claimable'
      );
      setState(claimableState);
      haptics.verifyReady();
    }, 1050);
  }, []);

  const handleClaimTask = useCallback(
    async (task: TaskItem) => {
      const current = stateRef.current;
      if (!current) return;
      const { nextState, rankedUp } = await storageService.updateTaskStatus(
        current,
        task.id,
        'completed',
        true
      );
      setState(nextState);
      if (rankedUp) {
        haptics.rankAscend();
        sound.rankUp();
      } else {
        haptics.notificationOccurred('success');
        sound.confirm();
      }
      const isAr = nextState.language === 'ar';
      showToast(
        isAr ? 'تم استلام مكافأة المهمة' : 'DIRECTIVE CLAIMED',
        `+${formatEgo(task.rewardEgo)} $EGO`,
        rankedUp ? 'red' : 'cyan'
      );
      if (rankedUp) {
        triggerScanline('rankup');
      }
    },
    [showToast, triggerScanline]
  );

  // UPGRADE: Forge Level Upgrade
  const handleUpgradeForge = useCallback(
    async (targetLevel: number) => {
      const current = stateRef.current;
      if (!current) return;
      const { nextState, rankedUp, ok } = await storageService.upgradeForge(
        current,
        targetLevel
      );
      if (!ok) return;
      setState(nextState);
      if (rankedUp) {
        haptics.rankAscend();
        sound.rankUp();
      } else {
        haptics.forgeUpgrade();
        sound.upgrade();
      }
      const isAr = nextState.language === 'ar';
      showToast(
        isAr ? `تمت ترقية الفرن إلى 0${targetLevel}` : `FORGE ELEVATED · LVL 0${targetLevel}`,
        `+${nextState.xp - current.xp} XP`,
        rankedUp ? 'red' : 'cyan'
      );
      if (rankedUp) {
        triggerScanline('rankup');
      }
    },
    [showToast, triggerScanline]
  );

  // WALLET: Connect via @tonconnect/ui
  const handleConnectTonWallet = useCallback(async () => {
    const ui = getTonConnectUI();
    if (!ui) {
      haptics.notificationOccurred('error');
      sound.error();
      setDepositFeedback({
        tone: 'error',
        message: 'TON Connect unavailable in this environment. Use Preview Wallet.',
      });
      return;
    }
    try {
      await ui.openModal();
    } catch {
      haptics.notificationOccurred('error');
      sound.error();
      setDepositFeedback({
        tone: 'error',
        message: 'Wallet modal could not open. Use Preview Wallet below.',
      });
    }
  }, []);

  // WALLET: Preview session wallet for testing full deposit flow in desktop browsers
  const handleConnectPreviewWallet = useCallback(() => {
    setIsPreviewWallet(true);
    setDepositFeedback(null);
    setState((prev) => {
      if (!prev) return prev;
      const previewAddress = 'UQB7x9K2mN4pQ8vR1sT6wY0zA3cE5gH7jL9nP2qS4uV8wX7k';
      const next: GameState = { ...prev, walletAddress: previewAddress };
      storageService.saveState(next);
      return next;
    });
    haptics.notificationOccurred('success');
    sound.confirm();
    showToast(
      stateRef.current?.language === 'ar' ? 'تم ربط محفظة المعاينة' : 'PREVIEW WALLET LINKED',
      'TON',
      'cyan'
    );
  }, [showToast]);

  // WALLET: Disconnect
  const handleDisconnectWallet = useCallback(async () => {
    haptics.impactOccurred('soft');
    sound.tap();
    const ui = getTonConnectUI();
    if (ui && ui.connected) {
      try {
        await ui.disconnect();
      } catch {
        // Ignore disconnect error
      }
    }
    setIsPreviewWallet(false);
    setDepositFeedback(null);
    setState((prev) => {
      if (!prev) return prev;
      const next: GameState = { ...prev, walletAddress: null };
      storageService.saveState(next);
      return next;
    });
  }, []);

  // WALLET / UPGRADE: Execute TON Deposit + Mock Backend Verification
  const handleDepositBoost = useCallback(
    async (pack: BoostPackConfig) => {
      const current = stateRef.current;
      if (!current || pendingPackId) return;

      const t = TRANSLATIONS[current.language];
      setPendingPackId(pack.id);
      setDepositFeedback({
        tone: 'pending',
        message: `${t.wallet.txPending} · ${pack.tonAmount} TON`,
      });

      try {
        const { txHash } = await sendTonDepositTransaction({
          tonAmount: pack.tonAmount,
          packId: pack.id,
          userId: current.userId,
          isPreviewWallet,
        });

        const depositId = `dep_${Date.now()}`;
        const pendingRecord = {
          id: depositId,
          packId: pack.id,
          tonAmount: pack.tonAmount,
          multiplier: pack.multiplier,
          txHash,
          status: 'pending' as const,
          createdAt: Date.now(),
        };

        const withPending = await storageService.addPendingDeposit(
          stateRef.current || current,
          pendingRecord
        );
        setState(withPending);

        const verification = await verifyDeposit(txHash, pack.id);
        const { nextState, rankedUp } = await storageService.finalizeDeposit(
          stateRef.current || withPending,
          depositId,
          verification.verified
        );
        setState(nextState);

        if (verification.verified) {
          if (rankedUp) {
            haptics.rankAscend();
            sound.rankUp();
          } else {
            haptics.forgeUpgrade();
            sound.upgrade();
          }
          setDepositFeedback({
            tone: 'confirmed',
            message: `${t.wallet.txConfirmed} · ×${pack.multiplier.toFixed(1)}`,
          });
          showToast(
            nextState.language === 'ar' ? 'تم تفعيل المضاعف الدائم' : 'TON BOOST ACTIVATED',
            `×${pack.multiplier.toFixed(1)}`,
            'terminal'
          );
          triggerScanline(rankedUp ? 'rankup' : 'claim');
        } else {
          haptics.notificationOccurred('warning');
          sound.error();
          setDepositFeedback({
            tone: 'error',
            message: verification.reason || t.wallet.txFailed,
          });
        }
      } catch (err) {
        haptics.notificationOccurred('error');
        sound.error();
        const msg =
          err instanceof Error && err.message ? err.message : t.wallet.txFailed;
        setDepositFeedback({ tone: 'error', message: msg });
      } finally {
        setPendingPackId(null);
      }
    },
    [isPreviewWallet, pendingPackId, showToast, triggerScanline]
  );

  const handleSelectBoostFromUpgrade = useCallback((pack: BoostPackConfig) => {
    setPreselectedPackId(pack.id);
    setScreen('wallet');
  }, []);

  if (!state) {
    return (
      <div className="min-h-[100dvh] bg-[#050506] flex items-center justify-center">
        <span className="font-mono-tech text-[11px] font-medium tracking-[0.34em] text-[#F2EFE9]/55">
          E G O · R E P
        </span>
      </div>
    );
  }

  const t = TRANSLATIONS[state.language];
  const { current: currentRank } = getRankForXp(state.xp);
  const pendingTasksCount = state.tasks.filter((task) => task.status !== 'completed').length;

  return (
    <div className="relative min-h-[100dvh] bg-[#050506] text-[#F2EFE9] flex flex-col">
      {/* Ambient Dust Particles, Film Grain & Vignette */}
      <AtmosphereCanvas />

      {/* Glitch/Scanline Pulse strictly on Claim & Rank-Up */}
      <ScanlinePulse triggerKey={scanlineState.key} variant={scanlineState.variant} />

      {/* Sleek Editorial Hairline Signal Toast */}
      <SignalToast toast={toast} />

      {/* First-Launch Intro Screen */}
      {!state.hasSeenIntro && (
        <IntroScreen
          t={t}
          language={state.language}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onToggleLanguage={handleToggleLanguage}
          onEnter={handleEnterFromIntro}
        />
      )}

      {/* Minimal Sticky Top Bar */}
      <header className="sticky top-0 z-30 bg-[#050506]/92 backdrop-blur-sm border-b border-hairline pt-safe">
        <div className="max-w-5xl mx-auto px-4 sm:px-5 h-[52px] flex items-center justify-between gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => {
              haptics.tap();
              setScreen('forge');
            }}
            className="font-mono-tech text-[12px] font-medium tracking-[0.26em] sm:tracking-[0.3em] text-[#F2EFE9] whitespace-nowrap shrink-0 cursor-pointer"
          >
            EGO REP
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                haptics.toggle(screen !== 'ranks');
                setScreen((prev) => (prev === 'ranks' ? 'forge' : 'ranks'));
              }}
              className={`min-h-[36px] px-2.5 sm:px-3 rounded-full border flex items-center gap-1.5 sm:gap-2 font-mono-tech text-[11px] font-medium tracking-[0.12em] sm:tracking-[0.14em] whitespace-nowrap transition-all cursor-pointer active:scale-[0.96] ${
                screen === 'ranks'
                  ? 'border-[#C1121F]/75 bg-[#C1121F]/14 text-[#F2EFE9]'
                  : 'border-[#F2EFE9]/16 bg-[#F2EFE9]/[0.04] text-[#F2EFE9]/88 hover:border-[#F2EFE9]/42 hover:bg-[#F2EFE9]/[0.08]'
              }`}
            >
              <IconRank className="w-3.5 h-3.5 text-[#5FE3FF]" />
              <span>
                {state.language === 'ar'
                  ? currentRank.nameAr
                  : currentRank.nameEn.toUpperCase()}
              </span>
              <span className="text-[#F2EFE9]/56 tabular-nums">{state.xp} XP</span>
            </button>

            <button
              type="button"
              onClick={handleToggleSound}
              aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
              aria-pressed={soundEnabled}
              className={`min-h-[36px] min-w-[36px] px-2 rounded-full border flex items-center justify-center transition-all cursor-pointer active:scale-[0.96] ${
                soundEnabled
                  ? 'border-[#F2EFE9]/18 bg-[#F2EFE9]/[0.05] text-[#F2EFE9]/86 hover:border-[#F2EFE9]/42 hover:text-[#F2EFE9]'
                  : 'border-[#F2EFE9]/12 bg-transparent text-[#F2EFE9]/42 hover:border-[#F2EFE9]/30 hover:text-[#F2EFE9]/75'
              }`}
            >
              {soundEnabled ? (
                <IconSoundOn className="w-4 h-4" />
              ) : (
                <IconSoundOff className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={handleToggleLanguage}
              aria-label="Toggle language"
              className="ego-btn-secondary min-h-[36px] min-w-[40px] px-2.5 flex items-center justify-center font-mono-tech text-[11px] font-medium tracking-[0.12em] text-[#F2EFE9]/86 hover:text-[#F2EFE9] cursor-pointer"
            >
              {state.language === 'en' ? 'عربي' : 'EN'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Stage with smooth cinematic screen transitions */}
      <main className="relative z-10 flex-1 w-full">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={screen}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            {screen === 'forge' && (
              <ForgeScreen
                state={state}
                nowMs={nowMs}
                t={t}
                language={state.language}
                claimPulseKey={claimPulseKey}
                lastClaimDelta={lastClaimDelta}
                onClaim={handleClaimForge}
                onCompleteRep={handleCompleteRep}
                onMonolithStrike={handleMonolithStrike}
                onUpgradeForge={handleUpgradeForge}
                onOpenUpgrade={() => setScreen('upgrade')}
                onOpenRanks={() => setScreen('ranks')}
              />
            )}

            {screen === 'tasks' && (
              <TasksScreen
                state={state}
                t={t}
                language={state.language}
                onStartTask={handleStartTask}
                onVerifyTask={handleVerifyTask}
                onClaimTask={handleClaimTask}
                onNavigateWallet={() => setScreen('wallet')}
                onNavigateCircle={() => setScreen('circle')}
              />
            )}

            {screen === 'upgrade' && (
              <UpgradeScreen
                state={state}
                t={t}
                language={state.language}
                pendingPackId={pendingPackId}
                onUpgradeForge={handleUpgradeForge}
                onSelectBoostPack={handleSelectBoostFromUpgrade}
              />
            )}

            {screen === 'circle' && (
              <CircleScreen
                state={state}
                t={t}
                language={state.language}
                onCopiedLink={() => {
                  haptics.notificationOccurred('success');
                  sound.confirm();
                  showToast(
                    state.language === 'ar' ? 'تم نسخ رابط الدعوة' : 'INVITE LINK COPIED',
                    state.referralCode,
                    'cyan'
                  );
                }}
              />
            )}

            {screen === 'wallet' && (
              <WalletScreen
                state={state}
                t={t}
                language={state.language}
                isPreviewWallet={isPreviewWallet}
                pendingPackId={pendingPackId}
                depositFeedback={depositFeedback}
                preselectedPackId={preselectedPackId}
                onConnectTonWallet={handleConnectTonWallet}
                onConnectPreviewWallet={handleConnectPreviewWallet}
                onDisconnectWallet={handleDisconnectWallet}
                onDepositBoost={handleDepositBoost}
              />
            )}

            {screen === 'ranks' && (
              <RanksScreen
                state={state}
                t={t}
                language={state.language}
                onBack={() => setScreen('forge')}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 5-Tab Bottom Navigation */}
      <BottomNav
        activeScreen={screen}
        onSelect={setScreen}
        t={t}
        pendingTasksCount={pendingTasksCount}
      />
    </div>
  );
}
