import { APP_CONFIG, BOOST_PACKS } from '../config';

export interface VerifyDepositResult {
  verified: boolean;
  txHash: string;
  packId: string;
  tonAmount: number;
  multiplier: number;
  confirmedAt: number;
  reason?: string;
}

/**
 * Front-end mock for TON deposit verification.
 *
 * TODO (PRODUCTION BACKEND):
 * Replace this mocked verification with a POST request to your backend endpoint:
 *   POST /api/deposits/verify
 *   Headers: { Authorization: `tma ${window.Telegram.WebApp.initData}` }
 *   Body: { txHash, packId, walletAddress }
 *
 * Your backend must:
 * 1. Validate Telegram initData HMAC signature using the Bot Token (NEVER expose bot token or API keys client-side).
 * 2. Query TON mainnet via Toncenter v3 (https://toncenter.com/api/v3/transactions) or TonAPI (https://tonapi.io/v2/blockchain/transactions/{hash}):
 *    - Confirm transaction is finalized on masterchain and succeeded (exit_code === 0).
 *    - Confirm `out_msgs` or `in_msg.destination` equals `APP_CONFIG.DEPOSIT_ADDRESS` (normalized address).
 *    - Confirm transfer value in nanotons >= expected `pack.tonAmount * 1e9`.
 *    - Confirm memo/comment payload matches the authenticated user's `userId` + `packId`.
 * 3. Enforce idempotency by storing `txHash` with a UNIQUE constraint in your database so a hash can never be credited twice.
 * 4. Atomically grant the permanent Boost Pack multiplier and XP to the user record and return the verified state.
 */
export async function verifyDeposit(
  txHash: string,
  packId: string
): Promise<VerifyDepositResult> {
  const pack = BOOST_PACKS.find((p) => p.id === packId);

  // Deliberate slow cinematic verification latency (2.4s) simulating TON block finality check
  await new Promise((resolve) => setTimeout(resolve, 2400));

  if (!pack || !txHash || txHash.trim().length < 8) {
    return {
      verified: false,
      txHash,
      packId,
      tonAmount: 0,
      multiplier: 1,
      confirmedAt: Date.now(),
      reason: 'Invalid transaction payload or unknown boost pack.',
    };
  }

  // Simulated check against configured treasury address
  void APP_CONFIG.DEPOSIT_ADDRESS;

  return {
    verified: true,
    txHash,
    packId: pack.id,
    tonAmount: pack.tonAmount,
    multiplier: pack.multiplier,
    confirmedAt: Date.now(),
  };
}
