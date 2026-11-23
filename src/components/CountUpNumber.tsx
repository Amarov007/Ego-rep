import React, { useEffect, useRef, useState } from 'react';

interface CountUpNumberProps {
  value: number;
  decimals?: number;
  durationMs?: number;
  className?: string;
}

/**
 * Heavy cinematic count-up for $EGO numerals.
 * Uses ease-out quintic settling and respects prefers-reduced-motion.
 */
export const CountUpNumber: React.FC<CountUpNumberProps> = ({
  value,
  decimals = 0,
  durationMs = 760,
  className = '',
}) => {
  const [displayed, setDisplayed] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced || Math.abs(value - fromRef.current) < 0.001) {
      fromRef.current = value;
      setDisplayed(value);
      return;
    }

    const startVal = fromRef.current;
    const delta = value - startVal;
    const startTime = performance.now();
    let frameId = 0;

    const animate = (now: number) => {
      const t = Math.min(1, (now - startTime) / durationMs);
      // Slow, heavy settling curve
      const eased = 1 - Math.pow(1 - t, 4);
      const current = startVal + delta * eased;
      setDisplayed(current);
      if (t < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        fromRef.current = value;
        setDisplayed(value);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frameId);
      fromRef.current = value;
    };
  }, [value, durationMs]);

  const formatted = displayed.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return <span className={`tabular-nums ${className}`}>{formatted}</span>;
};
