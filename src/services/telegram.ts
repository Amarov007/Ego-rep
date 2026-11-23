import { TelegramUserProfile } from '../types';
import { sound } from './sound';

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  enableClosingConfirmation?: () => void;
  openLink?: (url: string) => void;
  openTelegramLink?: (url: string) => void;
  initDataUnsafe?: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      photo_url?: string;
    };
    start_param?: string;
  };
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  BackButton?: {
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

function getWebApp(): TelegramWebApp | null {
  if (typeof window === 'undefined') return null;
  return window.Telegram?.WebApp ?? null;
}

/**
 * Initialize Telegram WebApp shell:
 * calls ready(), expand(), and locks dark ink theme (#050506).
 */
export function initTelegramApp(): void {
  const tg = getWebApp();
  if (!tg) return;
  try {
    tg.ready();
    tg.expand();
    tg.setHeaderColor?.('#050506');
    tg.setBackgroundColor?.('#050506');
  } catch {
    // Graceful no-op outside full Telegram runtime
  }
}

/**
 * Read user profile from Telegram initDataUnsafe with a clean fallback for standard browsers.
 */
export function getTelegramUser(): TelegramUserProfile {
  const tg = getWebApp();
  const rawUser = tg?.initDataUnsafe?.user;
  if (rawUser && rawUser.id) {
    return {
      id: rawUser.id,
      firstName: rawUser.first_name || 'Operator',
      username: rawUser.username,
      photoUrl: rawUser.photo_url,
      isTelegramEnv: true,
    };
  }
  return {
    id: 7041982,
    firstName: 'Kael',
    username: 'kael_monolith',
    isTelegramEnv: false,
  };
}

/**
 * Parse referral start_param from Telegram WebApp or browser URL query parameters.
 */
export function getStartParam(): string | null {
  const tg = getWebApp();
  const tgParam = tg?.initDataUnsafe?.start_param?.trim();
  if (tgParam) return tgParam;

  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get('tgWebAppStartParam') || params.get('start');
    if (urlParam && urlParam.trim().length > 0) {
      return urlParam.trim();
    }
  }
  return null;
}

export type HapticImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
export type HapticNotificationType = 'error' | 'success' | 'warning';

function vibrateFallback(pattern: number | number[]): void {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // Ignore on browsers that disallow vibrate outside gesture
  }
}

const IMPACT_VIBRATE_MS: Record<HapticImpactStyle, number> = {
  soft: 6,
  light: 9,
  medium: 14,
  rigid: 16,
  heavy: 22,
};

const NOTIFICATION_VIBRATE_PATTERN: Record<HapticNotificationType, number[]> = {
  success: [12, 42, 18],
  warning: [16, 48, 12],
  error: [22, 44, 22, 44, 14],
};

function runImpact(style: HapticImpactStyle): void {
  const hf = getWebApp()?.HapticFeedback;
  if (hf) {
    try {
      hf.impactOccurred(style);
      return;
    } catch {
      // Fallback below
    }
  }
  vibrateFallback(IMPACT_VIBRATE_MS[style]);
}

function runNotification(type: HapticNotificationType): void {
  const hf = getWebApp()?.HapticFeedback;
  if (hf) {
    try {
      hf.notificationOccurred(type);
      return;
    } catch {
      // Fallback below
    }
  }
  vibrateFallback(NOTIFICATION_VIBRATE_PATTERN[type]);
}

function runSelection(): void {
  const hf = getWebApp()?.HapticFeedback;
  if (hf) {
    try {
      hf.selectionChanged();
      return;
    } catch {
      // Fallback below
    }
  }
  vibrateFallback(5);
}

function schedulePulse(delayMs: number, fn: () => void): void {
  if (typeof window === 'undefined') return;
  window.setTimeout(fn, delayMs);
}

/**
 * Industrial Telegram HapticFeedback engine paired with subtle UI audio cues.
 * Exposes direct Telegram HapticFeedback primitives alongside choreographed
 * multi-pulse tactile patterns (basalt strike, forge claim, anvil upgrade,
 * rank ascension, and mechanical toggle snaps).
 */
export const haptics = {
  /** Direct Telegram WebApp HapticFeedback primitives */
  impactOccurred(style: HapticImpactStyle): void {
    runImpact(style);
  },
  notificationOccurred(type: HapticNotificationType): void {
    runNotification(type);
  },
  selectionChanged(): void {
    runSelection();
  },

  /** Standard crisp tap (light impact + micro-click audio) */
  tap(): void {
    runImpact('light');
    sound.tap();
  },
  /** Precision detent for navigation, tabs, selectors, and chart nodes */
  select(): void {
    runSelection();
    sound.select();
  },
  /** Mechanical industrial toggle switch: rigid snap ON, muted soft settle OFF */
  toggle(isOn: boolean, withSound: boolean = true): void {
    runImpact(isOn ? 'rigid' : 'soft');
    if (withSound) {
      if (isOn) {
        sound.select();
      } else {
        sound.tap();
      }
    }
  },
  /** Firm tactile detent for primary triggers without audio overlap */
  press(): void {
    runImpact('rigid');
  },
  soft(): void {
    runImpact('soft');
  },
  rigid(): void {
    runImpact('rigid');
  },
  medium(): void {
    runImpact('medium');
  },
  heavy(): void {
    runImpact('heavy');
  },
  success(): void {
    runNotification('success');
  },
  warning(): void {
    runNotification('warning');
  },
  error(): void {
    runNotification('error');
  },

  /** Intro threshold crossing: deep weight followed by soft atmospheric settle */
  introEnter(): void {
    runImpact('heavy');
    schedulePulse(110, () => runImpact('soft'));
  },

  /** Cracked basalt monolith strike: heavy stone impact + rigid fissure echo */
  monolithStrike(): void {
    runImpact('heavy');
    schedulePulse(58, () => runImpact('rigid'));
  },

  /** Forge CLAIM hydraulic beam release: heavy -> rigid -> success notification */
  forgeClaim(): void {
    runImpact('heavy');
    schedulePulse(65, () => runImpact('rigid'));
    schedulePulse(155, () => runNotification('success'));
  },

  /** Distinct tactile weight for Execute / Growth / Obsession daily rep pillars */
  repPillar(pillar: 'execute' | 'growth' | 'obsession'): void {
    if (pillar === 'execute') {
      runImpact('rigid');
      return;
    }
    if (pillar === 'growth') {
      runImpact('medium');
      schedulePulse(62, () => runImpact('rigid'));
      return;
    }
    runImpact('heavy');
    schedulePulse(70, () => runImpact('rigid'));
  },

  /** All 3 Daily Reps locked: 3-beat ascending industrial lock */
  triadComplete(): void {
    runImpact('medium');
    schedulePulse(75, () => runImpact('rigid'));
    schedulePulse(170, () => runNotification('success'));
  },

  /** Forge level elevation & TON boost activation: double anvil strike + confirmation */
  forgeUpgrade(): void {
    runImpact('heavy');
    schedulePulse(95, () => runImpact('heavy'));
    schedulePulse(210, () => runNotification('success'));
  },

  /** Ceremonial Rank Ascension: rising 4-step cadence culminating in success */
  rankAscend(): void {
    runImpact('soft');
    schedulePulse(80, () => runImpact('medium'));
    schedulePulse(165, () => runImpact('heavy'));
    schedulePulse(275, () => runNotification('success'));
  },

  /** Crisp verification/unlock detent paired with subtle click */
  verifyReady(): void {
    runImpact('rigid');
    sound.tap();
  },
};

/**
 * Manage Telegram native BackButton when navigating into sub-views like Ranks.
 */
export function bindTelegramBackButton(visible: boolean, onBack: () => void): () => void {
  const bb = getWebApp()?.BackButton;
  if (!bb) return () => {};
  try {
    if (visible) {
      bb.onClick(onBack);
      bb.show();
    } else {
      bb.hide();
    }
  } catch {
    // Ignore outside Telegram
  }
  return () => {
    try {
      bb.offClick(onBack);
      bb.hide();
    } catch {
      // Ignore
    }
  };
}

/**
 * Open external or Telegram links cleanly without window.open popup blocking inside iframes.
 */
export function openExternalTarget(url: string): void {
  const tg = getWebApp();
  if (url.startsWith('https://t.me/') && tg?.openTelegramLink) {
    tg.openTelegramLink(url);
    return;
  }
  if (tg?.openLink) {
    tg.openLink(url);
    return;
  }
  // Safe anchor click fallback inside iframe/browser previews
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}
