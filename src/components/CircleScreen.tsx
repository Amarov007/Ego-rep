import React, { useEffect, useState } from 'react';
import { APP_CONFIG, RANKS } from '../config';
import { Dictionary } from '../i18n/translations';
import { GameState, Language, LeaderboardEntry } from '../types';
import { storageService } from '../services/storage';
import { haptics, openExternalTarget } from '../services/telegram';
import { formatEgo, getReferralSpeedMultiplier } from '../utils/gameMath';
import { CircleLineageChart } from './CircleLineageChart';
import { IconCheck, IconCopy, IconShare } from './Icons';

interface CircleScreenProps {
  state: GameState;
  t: Dictionary;
  language: Language;
  onCopiedLink?: () => void;
}

/**
 * Circle Screen (Referral Lineage + Lineage Distribution Chart + Typographic Leaderboard)
 */
export const CircleScreen: React.FC<CircleScreenProps> = ({
  state,
  t,
  language,
  onCopiedLink,
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [copied, setCopied] = useState(false);

  const personalLink = `https://t.me/${APP_CONFIG.BOT_USERNAME}?start=${state.referralCode}`;
  const displayLink = `t.me/${APP_CONFIG.BOT_USERNAME}?start=${state.referralCode}`;
  const tier1Count = state.referrals.filter((r) => r.tier === 1).length;
  const tier2Count = state.referrals.filter((r) => r.tier === 2).length;
  const speedMult = getReferralSpeedMultiplier(tier1Count);
  const speedBonusPct = Math.round((speedMult - 1) * 100);

  useEffect(() => {
    let mounted = true;
    storageService.getLeaderboard(state).then((rows) => {
      if (mounted) setLeaderboard(rows);
    });
    return () => {
      mounted = false;
    };
  }, [state]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(personalLink);
      setCopied(true);
      onCopiedLink?.();
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      const input = document.createElement('input');
      input.value = personalLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      onCopiedLink?.();
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleShare = () => {
    haptics.impactOccurred('rigid');
    const shareText =
      language === 'ar'
        ? `ادخل فرن إيغو ريب عبر رابطي: ${personalLink}`
        : `Enter The Forge on EGO REP: ${personalLink}`;
    const tgShareUrl = `https://t.me/share/url?url=${encodeURIComponent(
      personalLink
    )}&text=${encodeURIComponent(shareText)}`;
    openExternalTarget(tgShareUrl);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-5 pt-5 pb-28">
      {/* Screen Header */}
      <header className="pb-5 border-b border-hairline flex items-end justify-between gap-4">
        <div>
          <h1 className="font-editorial text-[38px] sm:text-[46px] leading-none font-normal text-[#F2EFE9]">
            {t.circle.title}
          </h1>
          <p className="mt-2.5 font-body text-[13px] text-[#F2EFE9]/66 max-w-md leading-relaxed">
            {t.circle.subtitle}
          </p>
        </div>

        {state.referredByCode && (
          <div className="text-end shrink-0 font-mono-tech">
            <div className="text-[10px] tracking-[0.18em] text-[#F2EFE9]/52">
              {t.circle.referredNotice}
            </div>
            <div className="mt-1 text-[12px] font-medium text-[#5FE3FF]">
              {state.referredByCode}
            </div>
          </div>
        )}
      </header>

      <div className="mt-6 lg:grid lg:grid-cols-12 lg:gap-10">
        {/* REFERRAL PANEL */}
        <section className="lg:col-span-5">
          {/* 3-Metric Strip */}
          <div className="ego-panel px-4 py-4 grid grid-cols-3 gap-3">
            <div>
              <div className="font-mono-tech text-[10px] tracking-[0.18em] text-[#F2EFE9]/56">
                {t.circle.invitedCount}
              </div>
              <div className="mt-1.5 font-editorial text-[34px] leading-none text-[#F2EFE9] tabular-nums">
                {String(state.referrals.length).padStart(2, '0')}
              </div>
              <div className="mt-1.5 font-mono-tech text-[10px] text-[#F2EFE9]/55 tabular-nums">
                L1:{tier1Count} · L2:{tier2Count}
              </div>
            </div>

            <div>
              <div className="font-mono-tech text-[10px] tracking-[0.18em] text-[#F2EFE9]/56">
                {t.circle.bonusEarned}
              </div>
              <div className="mt-1.5 font-editorial text-[34px] leading-none text-[#F2EFE9] tabular-nums">
                {formatEgo(state.referralBonusEgo)}
              </div>
              <div className="mt-1.5 font-mono-tech text-[10px] text-[#F2EFE9]/55">$EGO</div>
            </div>

            <div className="text-end">
              <div className="font-mono-tech text-[10px] tracking-[0.18em] text-[#F2EFE9]/56">
                {t.circle.speedBonus}
              </div>
              <div className="mt-1.5 font-editorial text-[34px] leading-none text-[#5FE3FF] tabular-nums">
                +{speedBonusPct}%
              </div>
              <div className="mt-1.5 font-mono-tech text-[10px] text-[#F2EFE9]/55">
                +5% / L1
              </div>
            </div>
          </div>

          {/* Personal Invite Link */}
          <div className="mt-5">
            <div className="flex items-center justify-between font-mono-tech text-[10px] tracking-[0.2em] text-[#F2EFE9]/58">
              <span>{t.circle.yourLink}</span>
              <span>{t.circle.commissionRule}</span>
            </div>

            <div
              dir="ltr"
              className="mt-2 px-4 py-3 rounded-xl border border-hairline bg-[#09090D] font-mono-tech text-[13px] text-[#F2EFE9] truncate"
            >
              {displayLink}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className="ego-btn-secondary min-h-[46px] !rounded-xl font-mono-tech text-[11px] font-medium tracking-[0.2em] text-[#F2EFE9] flex items-center justify-center gap-2 cursor-pointer"
              >
                {copied ? <IconCheck className="w-4 h-4 text-[#5FE3FF]" /> : <IconCopy />}
                <span>{copied ? t.circle.copied : t.circle.copy}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="min-h-[46px] rounded-xl border border-[#2D6BFF]/75 bg-[#2D6BFF]/18 hover:bg-[#2D6BFF]/28 active:scale-[0.97] shadow-[inset_0_1px_0_rgba(242,239,233,0.14)] font-mono-tech text-[11px] font-medium tracking-[0.2em] text-[#F2EFE9] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <IconShare />
                <span>{t.circle.share}</span>
              </button>
            </div>
          </div>

          {/* Lineage Distribution Chart (Over Time / By Tier) */}
          <CircleLineageChart referrals={state.referrals} t={t} language={language} />

          {/* Invited Lineage Roster */}
          <div className="mt-7">
            <div className="pb-2.5 border-b border-hairline-strong flex items-center justify-between font-mono-tech text-[11px] font-medium tracking-[0.24em] text-[#F2EFE9]/74">
              <span>{t.circle.invitedRoster}</span>
              <span className="tabular-nums">{state.referrals.length}</span>
            </div>

            <div className="divide-y divide-[#F2EFE9]/10 font-mono-tech text-[12px]">
              {state.referrals.map((member) => (
                <div
                  key={member.id}
                  className="py-3.5 px-2 -mx-2 hover:bg-[#F2EFE9]/[0.025] transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-[#F2EFE9] font-medium truncate" dir="ltr">
                      {member.handle}
                    </div>
                    <div className="mt-0.5 text-[10px] tracking-[0.16em] text-[#F2EFE9]/56">
                      {member.tier === 1 ? t.circle.tier1 : t.circle.tier2}
                    </div>
                  </div>
                  <div className="text-end shrink-0 tabular-nums">
                    <div className="text-[#5FE3FF] font-medium">
                      +{formatEgo(member.commissionEarned, 1)}
                    </div>
                    <div className="text-[10px] text-[#F2EFE9]/52">
                      {formatEgo(member.egoMined)} MINED
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TYPOGRAPHIC LEADERBOARD */}
        <section className="lg:col-span-7 mt-10 lg:mt-0">
          <div className="pb-2.5 border-b border-hairline-strong flex items-center justify-between font-mono-tech text-[11px] font-medium tracking-[0.26em] text-[#F2EFE9]/78">
            <span>{t.circle.leaderboardTitle}</span>
            <span className="text-[#F2EFE9]/52">TOP 10</span>
          </div>

          <table className="w-full border-collapse text-start">
            <thead>
              <tr className="border-b border-hairline font-mono-tech text-[10px] tracking-[0.2em] text-[#F2EFE9]/54">
                <th className="py-3 pe-2 font-medium text-start w-12">{t.circle.colRank}</th>
                <th className="py-3 px-2 font-medium text-start">{t.circle.colName}</th>
                <th className="py-3 ps-2 font-medium text-end">{t.circle.colBalance}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EFE9]/10">
              {leaderboard.map((entry, idx) => {
                const rankCfg = RANKS.find((r) => r.id === entry.rankId) ?? RANKS[0];
                const isTopThree = idx < 3;
                const rankNum = String(idx + 1).padStart(2, '0');

                return (
                  <tr
                    key={entry.id}
                    className={`transition-colors ${
                      entry.isCurrentUser
                        ? 'bg-[#F2EFE9]/[0.06]'
                        : 'hover:bg-[#F2EFE9]/[0.025]'
                    }`}
                  >
                    <td className="py-3.5 pe-2 align-middle">
                      <span
                        className={`font-editorial text-[21px] leading-none tabular-nums ${
                          idx === 0
                            ? 'text-[#F2EFE9]'
                            : idx === 1
                            ? 'text-[#C1121F]'
                            : idx === 2
                            ? 'text-[#2D6BFF]'
                            : 'text-[#F2EFE9]/56'
                        }`}
                      >
                        {rankNum}
                      </span>
                    </td>

                    <td className="py-3.5 px-2 align-middle">
                      <div className="flex items-baseline gap-2.5">
                        <span
                          className={`font-body text-[14px] font-medium ${
                            entry.isCurrentUser || isTopThree
                              ? 'text-[#F2EFE9]'
                              : 'text-[#F2EFE9]/86'
                          }`}
                        >
                          {entry.name}
                        </span>
                        {entry.isCurrentUser && (
                          <span className="font-mono-tech text-[10px] font-medium tracking-[0.18em] text-[#C1121F]">
                            {t.circle.youTag}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 font-mono-tech text-[10px] tracking-[0.14em] text-[#F2EFE9]/54">
                        {language === 'ar' ? rankCfg.nameAr : rankCfg.nameEn.toUpperCase()} ·{' '}
                        <span dir="ltr">{entry.handle}</span>
                      </div>
                    </td>

                    <td className="py-3.5 ps-2 text-end align-middle font-mono-tech text-[14px] font-medium tabular-nums text-[#F2EFE9]">
                      {formatEgo(entry.ego)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
};
