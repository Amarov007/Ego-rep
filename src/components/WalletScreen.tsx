import React, { useState } from 'react';
import { APP_CONFIG, BOOST_PACKS } from '../config';
import { Dictionary } from '../i18n/translations';
import { BoostPackConfig, GameState, Language } from '../types';
import { shortenTonAddress } from '../services/tonConnect';
import { haptics } from '../services/telegram';
import { IconTon } from './Icons';

interface WalletScreenProps {
  state: GameState;
  t: Dictionary;
  language: Language;
  isPreviewWallet: boolean;
  pendingPackId: string | null;
  depositFeedback: { tone: 'pending' | 'confirmed' | 'error'; message: string } | null;
  preselectedPackId: string | null;
  onConnectTonWallet: () => void;
  onConnectPreviewWallet: () => void;
  onDisconnectWallet: () => void;
  onDepositBoost: (pack: BoostPackConfig) => void;
}

/**
 * Wallet Screen
 * High-contrast editorial settlement panel with TON Connect, boost selector,
 * deposit history ledger, and disabled Withdraw row ("OPENS AFTER LAUNCH").
 */
export const WalletScreen: React.FC<WalletScreenProps> = ({
  state,
  t,
  language,
  isPreviewWallet,
  pendingPackId,
  depositFeedback,
  preselectedPackId,
  onConnectTonWallet,
  onConnectPreviewWallet,
  onDisconnectWallet,
  onDepositBoost,
}) => {
  const defaultPack =
    BOOST_PACKS.find((p) => p.id === preselectedPackId && !state.ownedBoostIds.includes(p.id)) ||
    BOOST_PACKS.find((p) => !state.ownedBoostIds.includes(p.id)) ||
    BOOST_PACKS[0];

  const [selectedPackId, setSelectedPackId] = useState<string>(defaultPack.id);

  React.useEffect(() => {
    if (preselectedPackId) {
      setSelectedPackId(preselectedPackId);
    }
  }, [preselectedPackId]);

  const selectedPack = BOOST_PACKS.find((p) => p.id === selectedPackId) ?? BOOST_PACKS[0];
  const isSelectedOwned = state.ownedBoostIds.includes(selectedPack.id);
  const isBusy = pendingPackId !== null;

  return (
    <div className="w-full max-w-5xl mx-auto px-5 pt-5 pb-28">
      {/* Header */}
      <header className="pb-5 border-b border-hairline">
        <h1 className="font-editorial text-[38px] sm:text-[46px] leading-none font-normal text-[#F2EFE9]">
          {t.wallet.title}
        </h1>
        <p className="mt-2.5 font-body text-[13px] text-[#F2EFE9]/66 max-w-md leading-relaxed">
          {t.wallet.subtitle}
        </p>
      </header>

      <div className="mt-6 lg:grid lg:grid-cols-12 lg:gap-10">
        {/* LEFT COLUMN: Wallet Connection + Deposit Panel */}
        <section className="lg:col-span-6 space-y-5">
          {/* TON Connect Panel */}
          <div className="ego-panel p-5">
            <div className="flex items-center justify-between font-mono-tech text-[10px] font-medium tracking-[0.22em] text-[#F2EFE9]/60">
              <span>
                {state.walletAddress ? t.wallet.connectedLabel : t.wallet.notConnected}
              </span>
              {isPreviewWallet && state.walletAddress && (
                <span className="text-[#5FE3FF]">{t.wallet.demoBadge}</span>
              )}
            </div>

            {state.walletAddress ? (
              <div className="mt-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <IconTon className="w-4 h-4 text-[#5FE3FF] shrink-0" />
                  <span
                    dir="ltr"
                    className="font-mono-tech text-[16px] font-medium text-[#F2EFE9] truncate"
                  >
                    {shortenTonAddress(state.walletAddress)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onDisconnectWallet}
                  className="ego-btn-secondary min-h-[38px] px-4 hover:border-[#C1121F]/80 font-mono-tech text-[10px] font-medium tracking-[0.18em] text-[#F2EFE9]/84 hover:text-[#F2EFE9] cursor-pointer shrink-0"
                >
                  {t.wallet.disconnect}
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    haptics.impactOccurred('rigid');
                    onConnectTonWallet();
                  }}
                  className="ego-btn-primary w-full min-h-[52px] font-mono-tech text-[11px] font-semibold tracking-[0.22em] text-[#F2EFE9] flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <IconTon className="w-4 h-4 text-[#5FE3FF]" />
                  <span>{t.wallet.connectWallet}</span>
                </button>

                <button
                  type="button"
                  onClick={onConnectPreviewWallet}
                  className="ego-btn-secondary w-full min-h-[42px] !rounded-xl font-mono-tech text-[11px] font-medium tracking-[0.16em] text-[#F2EFE9]/74 hover:text-[#F2EFE9] cursor-pointer"
                >
                  {t.wallet.demoWallet}
                </button>
              </div>
            )}
          </div>

          {/* TON Deposit Panel */}
          <div className="ego-panel p-5">
            <div className="flex items-baseline justify-between pb-3 border-b border-hairline gap-2">
              <h2 className="font-mono-tech text-[11px] font-medium tracking-[0.24em] text-[#F2EFE9]/82">
                {t.wallet.depositTitle}
              </h2>
              <span className="font-mono-tech text-[10px] text-[#F2EFE9]/52" dir="ltr">
                {t.wallet.destinationLabel} · {shortenTonAddress(APP_CONFIG.DEPOSIT_ADDRESS)}
              </span>
            </div>

            <p className="mt-2.5 font-body text-[12px] text-[#F2EFE9]/64">
              {t.wallet.depositSubtitle}
            </p>

            {/* 4 Boost Pack Selector Grid */}
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {BOOST_PACKS.map((pack) => {
                const isSelected = pack.id === selectedPack.id;
                const isOwned = state.ownedBoostIds.includes(pack.id);

                return (
                  <button
                    key={pack.id}
                    type="button"
                    onClick={() => {
                      haptics.select();
                      setSelectedPackId(pack.id);
                    }}
                    className={`relative p-3.5 rounded-xl border text-start transition-all cursor-pointer active:scale-[0.97] overflow-hidden ${
                      isSelected
                        ? 'border-[#F2EFE9]/72 bg-[#14141D] shadow-[inset_0_1px_0_rgba(242,239,233,0.12)]'
                        : 'border-hairline bg-[#07070B] hover:border-[#F2EFE9]/35'
                    } ${isOwned ? 'opacity-60' : ''}`}
                  >
                    <span
                      className="absolute top-0 inset-x-3 h-[2px] rounded-full"
                      style={{
                        backgroundColor: pack.accentColor,
                        opacity: isSelected ? 1 : 0.35,
                      }}
                      aria-hidden="true"
                    />

                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-mono-tech text-[13px] font-medium text-[#F2EFE9] tabular-nums">
                        {pack.tonAmount} TON
                      </span>
                      <span
                        className="font-editorial text-[22px] leading-none tabular-nums"
                        style={{ color: pack.accentColor }}
                      >
                        ×{pack.multiplier.toFixed(1)}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between font-mono-tech text-[10px] tracking-[0.14em] text-[#F2EFE9]/62">
                      <span className="truncate">
                        {language === 'ar' ? pack.durationAr : pack.durationEn}
                      </span>
                      {isOwned && (
                        <span className="text-[#5FE3FF] font-medium">{t.upgrade.activated}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Transaction Status Banner */}
            {depositFeedback && (
              <div
                className={`mt-4 px-4 py-3 rounded-xl border font-mono-tech text-[11px] font-medium tracking-[0.14em] flex items-center justify-between gap-3 ${
                  depositFeedback.tone === 'pending'
                    ? 'border-[#5FE3FF]/50 bg-[#5FE3FF]/[0.07] text-[#5FE3FF]'
                    : depositFeedback.tone === 'confirmed'
                    ? 'border-[#34D399]/50 bg-[#34D399]/[0.07] text-[#34D399]'
                    : 'border-[#C1121F]/60 bg-[#C1121F]/[0.09] text-[#F2EFE9]'
                }`}
              >
                <span>{depositFeedback.message}</span>
                {depositFeedback.tone === 'pending' && (
                  <span className="animate-ego-breathe tracking-[0.3em]">···</span>
                )}
              </div>
            )}

            {/* Submit TON Deposit Button */}
            <button
              type="button"
              disabled={isBusy || isSelectedOwned}
              onClick={() => {
                if (!state.walletAddress) {
                  haptics.impactOccurred('rigid');
                  onConnectTonWallet();
                  return;
                }
                haptics.impactOccurred('heavy');
                onDepositBoost(selectedPack);
              }}
              className={`mt-4 w-full min-h-[52px] rounded-2xl border font-mono-tech text-[11px] font-semibold tracking-[0.22em] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed ${
                isBusy
                  ? 'border-[#5FE3FF]/60 text-[#5FE3FF] bg-[#0C1016]'
                  : isSelectedOwned
                  ? 'border-hairline bg-[#08080C] text-[#F2EFE9]/48'
                  : 'ego-btn-primary text-[#F2EFE9]'
              }`}
            >
              {isBusy ? (
                <span>{t.wallet.txPending}</span>
              ) : isSelectedOwned ? (
                <span>{t.upgrade.activated}</span>
              ) : !state.walletAddress ? (
                <span>{t.wallet.connectWallet}</span>
              ) : (
                <>
                  <IconTon className="w-4 h-4 text-[#5FE3FF]" />
                  <span>
                    {t.wallet.sendTon} · {selectedPack.tonAmount} TON
                  </span>
                </>
              )}
            </button>

            {/* Required Disclaimer */}
            <p className="mt-3.5 font-body text-[11px] text-[#F2EFE9]/56">
              {t.wallet.disclaimer}
            </p>
          </div>
        </section>

        {/* RIGHT COLUMN: Withdraw (Disabled) + Deposit History */}
        <section className="lg:col-span-6 mt-8 lg:mt-0 space-y-6">
          {/* Disabled Withdraw Row */}
          <div
            aria-disabled="true"
            className="rounded-2xl border border-hairline bg-[#08080C] px-5 py-4 flex items-center justify-between gap-4 opacity-65 select-none"
          >
            <div>
              <div className="font-mono-tech text-[11px] font-medium tracking-[0.22em] text-[#F2EFE9]/82">
                {t.wallet.withdrawLabel}
              </div>
              <div className="mt-1 font-mono-tech text-[12px] text-[#F2EFE9]/56 tabular-nums">
                {state.egoBalance.toLocaleString('en-US', { maximumFractionDigits: 0 })} $EGO
              </div>
            </div>
            <span className="font-mono-tech text-[10px] font-medium tracking-[0.18em] text-[#F2EFE9]/68 whitespace-nowrap">
              {t.wallet.withdrawStatus}
            </span>
          </div>

          {/* Deposit History Ledger */}
          <div>
            <div className="pb-2.5 border-b border-hairline-strong flex items-center justify-between font-mono-tech text-[11px] font-medium tracking-[0.24em] text-[#F2EFE9]/78">
              <span>{t.wallet.historyTitle}</span>
              <span className="tabular-nums">{state.deposits.length}</span>
            </div>

            {state.deposits.length === 0 ? (
              <p className="py-6 font-body text-[13px] text-[#F2EFE9]/54">
                {t.wallet.noHistory}
              </p>
            ) : (
              <div className="divide-y divide-[#F2EFE9]/10 font-mono-tech text-[12px]">
                {state.deposits.map((dep) => {
                  const dateStr = new Date(dep.createdAt).toLocaleDateString(
                    language === 'ar' ? 'ar-EG' : 'en-US',
                    { month: 'short', day: '2-digit' }
                  );

                  return (
                    <div
                      key={dep.id}
                      className="py-3.5 px-2 -mx-2 hover:bg-[#F2EFE9]/[0.025] transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-2.5">
                          <span className="text-[#F2EFE9] font-medium tabular-nums">
                            {dep.tonAmount} TON
                          </span>
                          <span className="text-[#5FE3FF] font-medium tabular-nums">
                            ×{dep.multiplier.toFixed(1)}
                          </span>
                          <span className="text-[11px] text-[#F2EFE9]/55">{dateStr}</span>
                        </div>
                        <div
                          dir="ltr"
                          className="mt-1 text-[11px] text-[#F2EFE9]/52 truncate max-w-[210px]"
                        >
                          {shortenTonAddress(dep.txHash)}
                        </div>
                      </div>

                      <span
                        className={`shrink-0 text-[10px] font-medium tracking-[0.2em] ${
                          dep.status === 'confirmed'
                            ? 'text-[#34D399]'
                            : dep.status === 'pending'
                            ? 'text-[#5FE3FF]'
                            : 'text-[#C1121F]'
                        }`}
                      >
                        {dep.status === 'confirmed'
                          ? t.wallet.txConfirmed
                          : dep.status === 'pending'
                          ? t.wallet.txPending
                          : t.wallet.txFailed}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
