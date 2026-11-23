import React, { useState } from 'react';
import { Dictionary } from '../i18n/translations';
import { GameState, Language, TaskGroup, TaskItem } from '../types';
import { haptics, openExternalTarget } from '../services/telegram';
import { formatEgo } from '../utils/gameMath';
import { IconCheck } from './Icons';

interface TasksScreenProps {
  state: GameState;
  t: Dictionary;
  language: Language;
  onStartTask: (task: TaskItem) => void;
  onVerifyTask: (task: TaskItem) => void;
  onClaimTask: (task: TaskItem) => void;
  onNavigateWallet: () => void;
  onNavigateCircle: () => void;
}

const GROUPS: { id: TaskGroup; labelKey: 'groupDaily' | 'groupPartners' | 'groupOnetime' }[] = [
  { id: 'daily', labelKey: 'groupDaily' },
  { id: 'partners', labelKey: 'groupPartners' },
  { id: 'onetime', labelKey: 'groupOnetime' },
];

/**
 * Tasks Screen
 * Grouped into DAILY / PARTNERS / ONE-TIME.
 * Sharp editorial rows with crisp body typography and Start -> Verify -> Claim lifecycle.
 */
export const TasksScreen: React.FC<TasksScreenProps> = ({
  state,
  t,
  language,
  onStartTask,
  onVerifyTask,
  onClaimTask,
  onNavigateWallet,
  onNavigateCircle,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | TaskGroup>('all');

  const tier1FriendsCount = state.referrals.filter((r) => r.tier === 1).length;
  const completedCount = state.tasks.filter((task) => task.status === 'completed').length;

  const visibleGroups = activeFilter === 'all' ? GROUPS : GROUPS.filter((g) => g.id === activeFilter);

  const handleRowAction = (task: TaskItem) => {
    if (task.status === 'completed' || task.status === 'verifying') return;

    if (task.type === 'connect_wallet' && !state.walletAddress) {
      haptics.tap();
      onNavigateWallet();
      return;
    }

    if (
      task.type === 'invite_friends' &&
      task.requiredFriends &&
      tier1FriendsCount < task.requiredFriends
    ) {
      haptics.tap();
      onNavigateCircle();
      return;
    }

    if (task.status === 'idle') {
      haptics.impactOccurred('medium');
      if (task.url) {
        openExternalTarget(task.url);
      }
      onStartTask(task);
      return;
    }

    if (task.status === 'started') {
      haptics.impactOccurred('rigid');
      onVerifyTask(task);
      return;
    }

    if (task.status === 'claimable') {
      onClaimTask(task);
    }
  };

  const getActionLabel = (task: TaskItem): string => {
    if (task.status === 'completed') return t.tasks.done;
    if (task.status === 'verifying') return t.tasks.verifying;
    if (task.status === 'claimable') return t.tasks.claim;
    if (task.status === 'started') return t.tasks.verify;

    if (task.type === 'connect_wallet' && !state.walletAddress) {
      return t.tasks.needWallet;
    }
    if (
      task.type === 'invite_friends' &&
      task.requiredFriends &&
      tier1FriendsCount < task.requiredFriends
    ) {
      return `${tier1FriendsCount}/${task.requiredFriends}`;
    }
    return t.tasks.start;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-5 pt-5 pb-28">
      {/* Editorial Screen Header */}
      <header className="pb-5 border-b border-hairline flex items-end justify-between gap-4">
        <div>
          <h1 className="font-editorial text-[38px] sm:text-[46px] leading-none font-normal text-[#F2EFE9]">
            {t.tasks.title}
          </h1>
          <p className="mt-2.5 font-body text-[13px] text-[#F2EFE9]/66 max-w-md leading-relaxed">
            {t.tasks.subtitle}
          </p>
        </div>

        <div className="text-end shrink-0 font-mono-tech">
          <div className="text-[10px] tracking-[0.2em] text-[#F2EFE9]/55">
            {t.tasks.completedCount}
          </div>
          <div className="mt-1 text-[18px] font-medium tabular-nums text-[#F2EFE9]">
            {String(completedCount).padStart(2, '0')}
            <span className="text-[#F2EFE9]/42">/{String(state.tasks.length).padStart(2, '0')}</span>
          </div>
        </div>
      </header>

      {/* Rounded Segmented Filter Controls */}
      <div className="mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {(['all', 'daily', 'partners', 'onetime'] as const).map((tab) => {
          const isActive = activeFilter === tab;
          const label =
            tab === 'all'
              ? language === 'ar'
                ? 'الكل'
                : 'ALL'
              : t.tasks[
                  tab === 'daily'
                    ? 'groupDaily'
                    : tab === 'partners'
                    ? 'groupPartners'
                    : 'groupOnetime'
                ];
          return (
            <button
              key={tab}
              type="button"
              onClick={() => {
                if (activeFilter !== tab) {
                  haptics.toggle(tab !== 'all');
                  setActiveFilter(tab);
                } else {
                  haptics.impactOccurred('soft');
                }
              }}
              className={`min-h-[38px] px-4 rounded-full border font-mono-tech text-[11px] font-medium tracking-[0.16em] whitespace-nowrap transition-all cursor-pointer active:scale-[0.96] ${
                isActive
                  ? 'border-[#C1121F]/80 bg-[#C1121F]/16 text-[#F2EFE9]'
                  : 'border-[#F2EFE9]/14 bg-[#F2EFE9]/[0.03] text-[#F2EFE9]/62 hover:border-[#F2EFE9]/35 hover:text-[#F2EFE9]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Grouped Typographic Rows */}
      <div className="mt-6 space-y-8">
        {visibleGroups.map((group) => {
          const items = state.tasks.filter((item) => item.group === group.id);
          if (!items.length) return null;

          return (
            <section key={group.id}>
              <div className="flex items-center justify-between pb-2.5 border-b border-hairline-strong">
                <h2 className="font-mono-tech text-[11px] font-medium tracking-[0.26em] text-[#F2EFE9]/78">
                  {t.tasks[group.labelKey]}
                </h2>
                <span className="font-mono-tech text-[11px] tabular-nums text-[#F2EFE9]/50">
                  {items.filter((i) => i.status === 'completed').length}/{items.length}
                </span>
              </div>

              <div className="divide-y divide-[#F2EFE9]/10">
                {items.map((task) => {
                  const isDone = task.status === 'completed';
                  const isClaimable = task.status === 'claimable';
                  const isVerifying = task.status === 'verifying';
                  const isStarted = task.status === 'started';

                  return (
                    <div
                      key={task.id}
                      className={`group relative py-4 px-2 -mx-2 flex items-center justify-between gap-4 transition-all duration-300 ${
                        isDone ? 'opacity-40' : 'hover:bg-[#F2EFE9]/[0.03]'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div
                          className={`font-body text-[15px] font-medium leading-snug text-[#F2EFE9] ${
                            isDone ? 'line-through decoration-[#F2EFE9]/55' : ''
                          }`}
                        >
                          {language === 'ar' ? task.titleAr : task.titleEn}
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 font-mono-tech text-[11px] text-[#F2EFE9]/64">
                          <span className="tabular-nums font-medium text-[#F2EFE9]">
                            +{formatEgo(task.rewardEgo)} $EGO
                          </span>
                          <span aria-hidden="true" className="text-[#F2EFE9]/30">
                            ·
                          </span>
                          <span className="tabular-nums text-[#5FE3FF]/90">
                            +{task.rewardXp} XP
                          </span>
                          <span aria-hidden="true" className="hidden sm:inline text-[#F2EFE9]/30">
                            ·
                          </span>
                          <span className="hidden sm:inline font-body text-[12px] text-[#F2EFE9]/58 truncate max-w-[280px]">
                            {language === 'ar' ? task.subtitleAr : task.subtitleEn}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRowAction(task)}
                        disabled={isDone || isVerifying}
                        className={`shrink-0 min-h-[40px] min-w-[100px] px-4 rounded-full border font-mono-tech text-[11px] font-medium tracking-[0.16em] whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-default active:scale-[0.96] ${
                          isDone
                            ? 'border-transparent text-[#F2EFE9]/65'
                            : isClaimable
                            ? 'border-[#5FE3FF]/80 text-[#5FE3FF] bg-[#5FE3FF]/12 hover:bg-[#5FE3FF]/20 shadow-[0_0_16px_rgba(95,227,255,0.14)]'
                            : isStarted
                            ? 'border-[#C1121F]/80 text-[#F2EFE9] bg-[#C1121F]/16 hover:bg-[#C1121F]/24'
                            : 'border-[#F2EFE9]/24 bg-[#F2EFE9]/[0.04] text-[#F2EFE9] hover:border-[#F2EFE9]/65 hover:bg-[#F2EFE9]/[0.1]'
                        }`}
                      >
                        {isDone && <IconCheck className="w-3.5 h-3.5" />}
                        <span>{getActionLabel(task)}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
