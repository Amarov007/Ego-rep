import React from 'react';

interface ScanlinePulseProps {
  /** Monotonically increasing pulse key; null or 0 means inactive. */
  triggerKey: number;
  variant: 'claim' | 'rankup';
}

/**
 * Brief scanline and chromatic edge glitch overlay.
 * Strictly invoked ONLY on Forge Claim and Rank-Up events.
 */
export const ScanlinePulse: React.FC<ScanlinePulseProps> = ({ triggerKey, variant }) => {
  if (triggerKey <= 0) return null;

  const beamColor = variant === 'rankup' ? 'rgba(193, 18, 31, 0.32)' : 'rgba(95, 227, 255, 0.24)';

  return (
    <div
      key={triggerKey}
      className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Sweeping horizontal light scanline */}
      <div
        className="absolute inset-x-0 h-[28vh] animate-scanline-sweep"
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${beamColor} 48%, rgba(237,234,228,0.18) 51%, transparent 100%)`,
        }}
      />
      {/* Fine raster scanlines jitter */}
      <div
        className="absolute inset-0 animate-glitch-jitter"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(237,234,228,0.09) 0px, rgba(237,234,228,0.09) 1px, transparent 1px, transparent 4px)',
        }}
      />
    </div>
  );
};
