import React from 'react';

interface IconProps {
  className?: string;
}

/** Monolith pillar with fracture seam — Forge tab */
export const IconForge: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M7.5 3.5L16.5 2.5L17.5 21.5H6.5L7.5 3.5Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="miter"
    />
    <path
      d="M12.2 3L10.8 10.5L13.4 13.5L11.6 21.5"
      stroke="currentColor"
      strokeWidth="1.1"
    />
    <path d="M6.8 9.2L17.2 7.4" stroke="currentColor" strokeWidth="1" opacity="0.7" />
    <path d="M6.6 15.8L17.4 17.6" stroke="currentColor" strokeWidth="1" opacity="0.7" />
  </svg>
);

/** Ruled directive lines — Tasks tab */
export const IconTasks: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M4 6.5H19.5" stroke="currentColor" strokeWidth="1.2" />
    <path d="M4 12H16" stroke="currentColor" strokeWidth="1.2" />
    <path d="M4 17.5H12.5" stroke="currentColor" strokeWidth="1.2" />
    <path d="M16.5 16L18.3 17.8L21.5 14" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

/** Ascending stepped chevron — Upgrade tab */
export const IconUpgrade: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M12 3.5V20.5" stroke="currentColor" strokeWidth="1.2" />
    <path d="M7.5 8L12 3.5L16.5 8" stroke="currentColor" strokeWidth="1.2" />
    <path d="M6 14.5H18" stroke="currentColor" strokeWidth="1.1" opacity="0.6" />
    <path d="M8.5 18.5H15.5" stroke="currentColor" strokeWidth="1.1" opacity="0.6" />
  </svg>
);

/** Intersecting lineage rings — Circle tab */
export const IconCircle: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="9.5" cy="12" r="5.5" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="14.5" cy="12" r="5.5" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
    <path d="M12 4.5V19.5" stroke="currentColor" strokeWidth="0.9" opacity="0.45" />
  </svg>
);

/** Sharp architectural vault frame — Wallet tab */
export const IconWallet: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="3.5" y="5.5" width="17" height="13" stroke="currentColor" strokeWidth="1.2" />
    <path d="M14.5 10H20.5V14H14.5V10Z" stroke="currentColor" strokeWidth="1.2" />
    <path d="M7 9.5H11" stroke="currentColor" strokeWidth="1.1" opacity="0.55" />
  </svg>
);

/** Vertical diamond crest — Ranks shortcut */
export const IconRank: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
    <path d="M10 2L16 10L10 18L4 10L10 2Z" stroke="currentColor" strokeWidth="1.1" />
    <path d="M10 5.5V14.5" stroke="currentColor" strokeWidth="1" opacity="0.65" />
  </svg>
);

/** Back hairline arrow */
export const IconBack: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
    <path d="M15.5 10H4.5" stroke="currentColor" strokeWidth="1.2" />
    <path d="M9 5.5L4.5 10L9 14.5" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

/** Hairline check */
export const IconCheck: React.FC<IconProps> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
    <path d="M3 8.5L6.4 12L13.2 4.5" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

/** Copy sheets */
export const IconCopy: React.FC<IconProps> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
    <rect x="5.5" y="5.5" width="7.5" height="8" stroke="currentColor" strokeWidth="1.15" />
    <path d="M10.5 5.5V2.5H3V10.5H5.5" stroke="currentColor" strokeWidth="1.15" />
  </svg>
);

/** Share diagonal vector */
export const IconShare: React.FC<IconProps> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
    <path d="M3.5 12.5L12.5 3.5" stroke="currentColor" strokeWidth="1.2" />
    <path d="M6.5 3.5H12.5V9.5" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

/** TON diamond glyph (thin architectural wireframe) */
export const IconTon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
    <path d="M3.2 5.2L10 17L16.8 5.2H3.2Z" stroke="currentColor" strokeWidth="1.15" />
    <path d="M10 5.2V17" stroke="currentColor" strokeWidth="1" opacity="0.65" />
  </svg>
);

/** Minimal acoustic wave — Sound On */
export const IconSoundOn: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
    <path d="M3.5 7.8H6.5L10.5 4.5V15.5L6.5 12.2H3.5V7.8Z" stroke="currentColor" strokeWidth="1.2" />
    <path d="M13.3 7.3C14.3 8.2 14.8 9.1 14.8 10C14.8 10.9 14.3 11.8 13.3 12.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M15.6 5.2C17.1 6.5 17.8 8.1 17.8 10C17.8 11.9 17.1 13.5 15.6 14.8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.65" />
  </svg>
);

/** Minimal muted speaker — Sound Off */
export const IconSoundOff: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
    <path d="M3.5 7.8H6.5L10.5 4.5V15.5L6.5 12.2H3.5V7.8Z" stroke="currentColor" strokeWidth="1.2" opacity="0.65" />
    <path d="M13.5 7.5L17.5 12.5" stroke="currentColor" strokeWidth="1.2" />
    <path d="M17.5 7.5L13.5 12.5" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);
