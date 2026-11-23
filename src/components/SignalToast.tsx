import React from 'react';
import { AnimatePresence, motion } from 'motion/react';

export interface SignalToastData {
  id: number;
  label: string;
  detail?: string;
  accent: 'bone' | 'cyan' | 'red' | 'blue' | 'terminal';
}

interface SignalToastProps {
  toast: SignalToastData | null;
}

const ACCENT_HEX: Record<SignalToastData['accent'], string> = {
  bone: '#F2EFE9',
  cyan: '#5FE3FF',
  red: '#C1121F',
  blue: '#2D6BFF',
  terminal: '#34D399',
};

/**
 * Editorial Hairline Signal Toast
 * Sharp architectural feedback bar with a 1.5px top light line.
 */
export const SignalToast: React.FC<SignalToastProps> = ({ toast }) => {
  return (
    <div
      className="fixed top-[62px] inset-x-0 z-50 pointer-events-none flex justify-center px-5"
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-w-sm w-full rounded-2xl overflow-hidden bg-[#0D0E14]/95 backdrop-blur-md border border-[#F2EFE9]/20 px-4 py-3 flex items-center justify-between gap-4 shadow-[0_14px_40px_rgba(0,0,0,0.75)]"
          >
            <span
              className="absolute top-0 inset-x-5 h-[2px] rounded-full"
              style={{ backgroundColor: ACCENT_HEX[toast.accent] }}
              aria-hidden="true"
            />
            <span className="font-mono-tech text-[11px] font-medium tracking-[0.14em] text-[#F2EFE9]">
              {toast.label}
            </span>
            <span
              className="ego-toast-timer absolute bottom-0 inset-x-0 h-px opacity-60"
              style={{ backgroundColor: ACCENT_HEX[toast.accent] }}
              aria-hidden="true"
            />
            {toast.detail && (
              <span
                className="font-mono-tech text-[11px] font-medium tabular-nums shrink-0"
                style={{ color: ACCENT_HEX[toast.accent] }}
              >
                {toast.detail}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
