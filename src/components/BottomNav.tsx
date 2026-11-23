import React from 'react';
import { motion } from 'motion/react';
import { Dictionary } from '../i18n/translations';
import { ScreenId } from '../types';
import { haptics } from '../services/telegram';
import { IconCircle, IconForge, IconTasks, IconUpgrade, IconWallet } from './Icons';

interface BottomNavProps {
  activeScreen: ScreenId;
  onSelect: (screen: ScreenId) => void;
  t: Dictionary;
  pendingTasksCount: number;
}

interface NavTabDef {
  id: Exclude<ScreenId, 'ranks'>;
  labelKey: keyof Dictionary['nav'];
  accent: string;
  Icon: React.FC<{ className?: string }>;
}

const NAV_TABS: NavTabDef[] = [
  { id: 'forge', labelKey: 'forge', accent: '#F2EFE9', Icon: IconForge },
  { id: 'tasks', labelKey: 'tasks', accent: '#C1121F', Icon: IconTasks },
  { id: 'upgrade', labelKey: 'upgrade', accent: '#5FE3FF', Icon: IconUpgrade },
  { id: 'circle', labelKey: 'circle', accent: '#2D6BFF', Icon: IconCircle },
  { id: 'wallet', labelKey: 'wallet', accent: '#F2EFE9', Icon: IconWallet },
];

/**
 * 5-Tab Minimal Bottom Navigation
 * Custom thin-line SVG icons + crisp mono/Arabic labels.
 * Active state: animated thin colored hairline light bar gliding across top edge.
 */
export const BottomNav: React.FC<BottomNavProps> = ({
  activeScreen,
  onSelect,
  t,
  pendingTasksCount,
}) => {
  return (
    <nav
      aria-label="Primary Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-[#050506]/96 backdrop-blur-sm border-t border-hairline pb-safe"
    >
      <div className="max-w-5xl mx-auto grid grid-cols-5">
        {NAV_TABS.map(({ id, labelKey, accent, Icon }) => {
          const isActive = activeScreen === id || (id === 'forge' && activeScreen === 'ranks');
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                if (activeScreen !== id) {
                  haptics.select();
                  onSelect(id);
                } else {
                  haptics.impactOccurred('soft');
                }
              }}
              aria-current={isActive ? 'page' : undefined}
              className="relative min-h-[60px] flex flex-col items-center justify-center gap-1.5 px-1 transition-all duration-200 cursor-pointer active:scale-[0.94] focus-visible:outline-none focus-visible:bg-[#F2EFE9]/5"
            >
              {/* Gliding thin colored top indicator */}
              {isActive && (
                <motion.span
                  layoutId="ego-bottom-nav-indicator"
                  transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute top-0 inset-x-4 h-[2px] rounded-full"
                  style={{
                    backgroundColor: accent,
                    boxShadow: `0 2px 12px ${accent}`,
                  }}
                  aria-hidden="true"
                />
              )}

              <span className="relative flex items-center justify-center">
                <Icon
                  className={`w-[21px] h-[21px] transition-colors duration-200 ${
                    isActive ? 'text-[#F2EFE9]' : 'text-[#F2EFE9]/54'
                  }`}
                />
                {id === 'tasks' && pendingTasksCount > 0 && !isActive && (
                  <span
                    className="absolute -top-1 -end-2.5 font-mono-tech text-[9px] font-medium text-[#C1121F] leading-none tabular-nums"
                    aria-label={`${pendingTasksCount} available`}
                  >
                    {pendingTasksCount}
                  </span>
                )}
              </span>

              <span
                className={`font-mono-tech text-[10px] font-medium tracking-[0.15em] whitespace-nowrap transition-colors duration-200 ${
                  isActive ? 'text-[#F2EFE9]' : 'text-[#F2EFE9]/54'
                }`}
              >
                {t.nav[labelKey]}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
