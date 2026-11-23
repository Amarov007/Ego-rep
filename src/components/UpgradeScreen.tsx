import React from 'react';
import { BOOST_PACKS, FORGE_LEVELS } from '../config';
import { Dictionary } from '../i18n/translations';
import { BoostPackConfig, GameState, Language } from '../types';
import { calculateMiningRate, formatEgo, formatPayback } from '../utils/gameMath';
import { haptics } from '../services/telegram';
import { IconTon } from './Icons';

interface UpgradeScreenProps {
  state: GameState;
  t: Dictionary;
  language: Language;
  pendingPackId: string | null;
  onUpgradeForge: (targetLevel: number) => void;
  onSelectBoostPack: (pack: BoostPackConfig) => void;
}

/**
 * Upgrade Screen
 * 1) High-contrast editorial Forge levels table (Level, Cost, +EGO/hr, Payback)
 * 2) TON Boost Packs (1, 5, 10, 50 TON) with permanent multipliers and disclaimer
 */
export const UpgradeScreen: React.FC<UpgradeScreenProps> = ({
  state,
  t,
  language,
  pendingPackId,
  onUpgradeForge,
  onSelectBoostPack,
}) => {
  const rate = calculateMiningRate(state);

  return (
    <div className="w-full max-w-5xl mx-auto px-5 pt-5 pb-28">
      {/* Header */}
      <header className="pb-5 border-b border-hairline flex items-end justify-between gap-4">
        <div>
          <h1 className="font-editorial text-[38px] sm:text-[46px] leading-none font-normal text-[#F2EFE9]">
            {t.upgrade.title}
          </h1>
          <p className="mt-2.5 font-body text-[13px] text-[#F2EFE9]/66 max-w-md leading-relaxed">
            {t.upgrade.subtitle}
          </p>
        </div>

        <div className="text-end shrink-0 font-mono-tech">
          <div className="text-[10px] tracking-[0.2em] text-[#F2EFE9]/55">$EGO</div>
          <div className="mt-1 text-[18px] font-medium tabular-nums text-[#F2EFE9]">
            {formatEgo(state.egoBalance)}
          </div>
        </div>
      </header>

      <div className="mt-7 lg:grid lg:grid-cols-12 lg:gap-10">
        {/* FORGE LEVELS TABLE */}
        <section className="lg:col-span-7">
          <div className="flex items-center justify-between pb-2.5 border-b border-hairline-strong">
            <h2 className="font-mono-tech text-[11px] font-medium tracking-[0.24em] text-[#F2EFE9]/78">
              {t.upgrade.forgeTableTitle}
            </h2>
            <span className="font-mono-tech text-[11px] tabular-nums text-[#F2EFE9]/62">
              LVL 0{state.forgeLevel} · {rate.baseEgoPerHour} BASE/HR
            </span>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full border-collapse text-start">
              <thead>
                <tr className="border-b border-hairline font-mono-tech text-[10px] tracking-[0.18em] text-[#F2EFE9]/55">
                  <th className="py-3 pe-2 font-medium text-start">{t.upgrade.colLevel}</th>
                  <th className="py-3 px-2 font-medium text-end">{t.upgrade.colCost}</th>
                  <th className="py-3 px-2 font-medium text-end">{t.upgrade.colRate}</th>
                  <th className="py-3 px-2 font-medium text-end">{t.upgrade.colPayback}</th>
                  <th className="py-3 ps-2 font-medium text-end">{t.upgrade.colAction}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2EFE9]/10 font-mono-tech text-[12px]">
                {FORGE_LEVELS.map((lvl) => {
                  const isCurrent = lvl.level === state.forgeLevel;
                  const isOwned = lvl.level < state.forgeLevel;
                  const isNext = lvl.level === state.forgeLevel + 1;
                  const canAfford = state.egoBalance >= lvl.costEgo;
                  const effectiveDelta = lvl.deltaEgoPerHour * rate.totalMultiplier;
                  const payback = formatPayback(
                    lvl.costEgo,
                    effectiveDelta,
                    t.upgrade.paybackHours,
                    t.upgrade.paybackDays
                  );

                  return (
                    <tr
                      key={lvl.level}
                      className={`transition-colors ${
                        isCurrent
                          ? 'bg-[#F2EFE9]/[0.045]'
                          : isOwned
                          ? 'opacity-45'
                          : 'hover:bg-[#F2EFE9]/[0.025]'
                      }`}
                    >
                      <td className="py-3.5 pe-2">
                        <div className="flex items-baseline gap-2.5">
                          <span className="tabular-nums font-medium text-[#F2EFE9]">
                            0{lvl.level}
                          </span>
                          <span className="font-body text-[12px] text-[#F2EFE9]/72 truncate max-w-[105px] sm:max-w-[145px]">
                            {language === 'ar' ? lvl.nameAr : lvl.nameEn}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-2 text-end tabular-nums text-[#F2EFE9]/90">
                        {lvl.costEgo === 0 ? '—' : formatEgo(lvl.costEgo)}
                      </td>

                      <td className="py-3.5 px-2 text-end tabular-nums font-medium text-[#5FE3FF]">
                        +{lvl.deltaEgoPerHour}
                      </td>

                      <td className="py-3.5 px-2 text-end tabular-nums text-[#F2EFE9]/68">
                        {payback}
                      </td>

                      <td className="py-3.5 ps-2 text-end">
                        {isCurrent ? (
                          <span className="text-[10px] font-medium tracking-[0.18em] text-[#F2EFE9]">
                            {t.upgrade.active}
                          </span>
                        ) : isOwned ? (
                          <span className="text-[10px] tracking-[0.16em] text-[#F2EFE9]/55">
                            {t.upgrade.owned}
                          </span>
                        ) : isNext ? (
                          <button
                            type="button"
                            disabled={!canAfford}
                            onClick={() => {
                              onUpgradeForge(lvl.level);
                            }}
                            className={`min-h-[36px] px-4 rounded-full border text-[10px] font-medium tracking-[0.16em] whitespace-nowrap transition-all cursor-pointer disabled:cursor-not-allowed active:scale-[0.96] ${
                              canAfford
                                ? 'border-[#5FE3FF]/75 text-[#F2EFE9] bg-[#5FE3FF]/14 hover:bg-[#5FE3FF]/22 shadow-[0_0_14px_rgba(95,227,255,0.14)]'
                                : 'border-hairline bg-[#F2EFE9]/[0.02] text-[#F2EFE9]/45'
                            }`}
                          >
                            {canAfford ? t.upgrade.upgrade : t.upgrade.insufficient}
                          </button>
                        ) : (
                          <span className="text-[10px] tracking-[0.16em] text-[#F2EFE9]/38">
                            {t.upgrade.locked}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* TON BOOST PACKS */}
        <section className="lg:col-span-5 mt-10 lg:mt-0">
          <div className="pb-2.5 border-b border-hairline-strong flex items-baseline justify-between">
            <h2 className="font-mono-tech text-[11px] font-medium tracking-[0.24em] text-[#F2EFE9]/78">
              {t.upgrade.boostsTitle}
            </h2>
            <span className="font-mono-tech text-[12px] font-medium tabular-nums text-[#5FE3FF]">
              ×{rate.tonMultiplier.toFixed(2)}
            </span>
          </div>
          <p className="mt-2 font-body text-[12px] text-[#F2EFE9]/62 leading-relaxed">
            {t.upgrade.boostsSubtitle}
          </p>

          <div className="mt-4 space-y-2.5">
            {BOOST_PACKS.map((pack) => {
              const isOwned = state.ownedBoostIds.includes(pack.id);
              const isPending = pendingPackId === pack.id;

              return (
                <div
                  key={pack.id}
                  className="relative ego-panel-interactive px-4 py-4 flex items-center justify-between gap-4"
                >
                  <span
                    className="absolute top-0 inset-x-4 h-[2px] rounded-full"
                    style={{
                      backgroundColor: pack.accentColor,
                      opacity: isOwned ? 1 : 0.45,
                    }}
                    aria-hidden="true"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2.5">
                      <span className="font-editorial text-[28px] leading-none font-normal text-[#F2EFE9] tabular-nums">
                        ×{pack.multiplier.toFixed(1)}
                      </span>
                      <span className="font-mono-tech text-[10px] font-medium tracking-[0.18em] text-[#F2EFE9]/62">
                        {language === 'ar' ? pack.durationAr : pack.durationEn}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 font-body text-[12px] text-[#F2EFE9]/72">
                      <span>{language === 'ar' ? pack.labelAr : pack.labelEn}</span>
                      <span aria-hidden="true" className="text-[#F2EFE9]/30">
                        ·
                      </span>
                      <span className="font-mono-tech text-[11px] tabular-nums text-[#5FE3FF]/90">
                        +{pack.xpReward} XP
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isOwned || isPending}
                    onClick={() => {
                      haptics.impactOccurred('rigid');
                      onSelectBoostPack(pack);
                    }}
                    className={`shrink-0 min-h-[42px] min-w-[110px] px-4 rounded-full border font-mono-tech text-[11px] font-medium tracking-[0.14em] whitespace-nowrap transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-default active:scale-[0.96] ${
                      isOwned
                        ? 'border-[#F2EFE9]/18 bg-[#F2EFE9]/[0.03] text-[#F2EFE9]/55'
                        : isPending
                        ? 'border-[#5FE3FF]/60 bg-[#5FE3FF]/10 text-[#5FE3FF]'
                        : 'border-[#F2EFE9]/35 bg-[#F2EFE9]/[0.05] text-[#F2EFE9] hover:border-[#5FE3FF] hover:bg-[#5FE3FF]/12'
                    }`}
                  >
                    {!isOwned && !isPending && <IconTon className="w-3.5 h-3.5 text-[#5FE3FF]" />}
                    <span>
                      {isOwned
                        ? t.upgrade.activated
                        : isPending
                        ? t.wallet.txPending.split(' ')[0]
                        : `${pack.tonAmount} TON`}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Required small disclaimer */}
          <p className="mt-4 font-body text-[11px] text-[#F2EFE9]/56 leading-relaxed">
            {t.upgrade.disclaimer}
          </p>
        </section>
      </div>
    </div>
  );
};
