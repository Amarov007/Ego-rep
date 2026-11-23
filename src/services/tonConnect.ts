import { THEME, TonConnectUI } from '@tonconnect/ui';
import { APP_CONFIG } from '../config';

let tonConnectInstance: TonConnectUI | null = null;

/**
 * Determine a manifest URL that external TON wallets (Tonkeeper, Wallet in Telegram, etc.)
 * can fetch anonymously without hitting localhost or auth-gated preview redirects.
 */
function resolveTonManifestUrl(): string {
  const envUrl = import.meta.env.VITE_TON_MANIFEST_URL as string | undefined;
  if (envUrl && envUrl.trim().startsWith('http')) {
    return envUrl.trim();
  }

  if (typeof window === 'undefined') {
    return APP_CONFIG.TON_PREVIEW_MANIFEST_URL;
  }

  const host = window.location.hostname.toLowerCase();
  const isLocalOrGatedPreview =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.endsWith('.local') ||
    host.startsWith('ais-dev-') ||
    host.startsWith('ais-pre-');

  if (isLocalOrGatedPreview) {
    return APP_CONFIG.TON_PREVIEW_MANIFEST_URL;
  }

  return `${window.location.origin}${APP_CONFIG.TON_MANIFEST_PATH}`;
}

/**
 * Lazily initialize the @tonconnect/ui singleton.
 */
export function getTonConnectUI(): TonConnectUI | null {
  if (typeof window === 'undefined') return null;
  if (tonConnectInstance) return tonConnectInstance;

  try {
    const manifestUrl = resolveTonManifestUrl();
    tonConnectInstance = new TonConnectUI({
      manifestUrl,
      uiPreferences: {
        theme: THEME.DARK,
        borderRadius: 'm',
      },
    });
    return tonConnectInstance;
  } catch {
    return null;
  }
}

/**
 * Shorten a raw or user-friendly TON address for editorial display (e.g. UQBx...7k9P).
 */
export function shortenTonAddress(address: string | null): string {
  if (!address) return '';
  if (address.length <= 12) return address;
  return `${address.slice(0, 5)}···${address.slice(-4)}`;
}

/**
 * Convert TON amount to nanotons string (1 TON = 1,000,000,000 nanotons).
 */
export function tonToNano(tonAmount: number): string {
  return String(Math.round(tonAmount * 1_000_000_000));
}

/**
 * Request a TON deposit transaction via TON Connect UI.
 * Falls back cleanly if the user is in Preview Wallet mode (browser without TON wallet extension).
 */
export async function sendTonDepositTransaction(params: {
  tonAmount: number;
  packId: string;
  userId: string;
  isPreviewWallet: boolean;
}): Promise<{ txHash: string }> {
  const { tonAmount, packId, isPreviewWallet } = params;

  if (isPreviewWallet) {
    // Simulate wallet signature prompt delay in browser preview mode
    await new Promise((resolve) => setTimeout(resolve, 900));
    const randomHex = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    return { txHash: `0x${randomHex}` };
  }

  const ui = getTonConnectUI();
  if (!ui || !ui.connected) {
    throw new Error('Wallet is not connected.');
  }

  const transaction = {
    validUntil: Math.floor(Date.now() / 1000) + 600,
    messages: [
      {
        address: APP_CONFIG.DEPOSIT_ADDRESS,
        amount: tonToNano(tonAmount),
      },
    ],
  };

  const result = await ui.sendTransaction(transaction);
  // In production, pass result.boc to backend to derive the canonical message/tx hash.
  const bocSnippet = (result.boc || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 28);
  const txHash = bocSnippet
    ? `ton_${packId}_${bocSnippet}`
    : `ton_${packId}_${Date.now().toString(16)}`;

  return { txHash };
}
