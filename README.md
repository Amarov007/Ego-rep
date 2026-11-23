# EGO REP — Telegram Mini App

An editorial, mobile-first Telegram Mini App built with React, TypeScript, Tailwind CSS, and `@tonconnect/ui`.

## Configuration

Edit `/src/config.ts` before deploying to production:

- `APP_CONFIG.DEPOSIT_ADDRESS`: Replace with your production TON treasury address.
- `APP_CONFIG.BOT_USERNAME`: Replace with your Telegram bot username (without `@`) for `t.me/<BOT>?start=<CODE>` referral links.
- `APP_CONFIG.CLAIM_INTERVAL_SECONDS`: Default `21600` (6 hours).
- `BOOST_PACKS`, `FORGE_LEVELS`, `RANKS`, and `APP_CONFIG.REFERRAL`: Tune game economy parameters from one file.

## Hosting & `tonconnect-manifest.json`

TON Connect requires a publicly accessible HTTPS manifest file at `/tonconnect-manifest.json`.

1. Deploy the static build (`npm run build` → `dist/`) to any HTTPS host (Vercel, Cloudflare Pages, Netlify, or Nginx with TLS).
2. Update `/public/tonconnect-manifest.json` with your live production domain and a square 512×512 PNG icon:

```json
{
  "url": "https://your-domain.com",
  "name": "EGO REP",
  "iconUrl": "https://your-domain.com/icon-512.png",
  "termsOfUseUrl": "https://your-domain.com/terms",
  "privacyPolicyUrl": "https://your-domain.com/privacy"
}
```

3. Verify `https://your-domain.com/tonconnect-manifest.json` returns HTTP `200` with CORS enabled (`Access-Control-Allow-Origin: *`).

## Connecting to Telegram via BotFather

### Option A — Menu Button (`/setmenubutton`)
1. Open `@BotFather` in Telegram and create a bot with `/newbot` (if you do not have one).
2. Send `/setmenubutton`, choose your bot, and paste your hosted HTTPS URL (e.g. `https://your-domain.com`).
3. Set the button label to `Open Forge` (or `EGO REP`).

### Option B — Direct Mini App Link (`/newapp`)
1. Send `/newapp` to `@BotFather` and select your bot.
2. Provide title (`EGO REP`), short description, 640×360 preview image, and your hosted HTTPS URL.
3. Choose a short name (e.g. `app`). Your Mini App is now launchable via `https://t.me/<BOT_USERNAME>/app?startapp=<REF_CODE>`.
4. Referral links (`?start=CODE` or `?startapp=CODE`) are parsed automatically in `/src/services/telegram.ts`.

## Backend Verification TODO

This build is front-end only and persists state via `/src/services/storage.ts` (`localStorage` behind an async REST-like interface). Before accepting real TON deposits in production:

- Implement `POST /api/deposits/verify` on your server and replace the mock inside `/src/services/api.ts` (`verifyDeposit`).
- Validate Telegram `initData` HMAC-SHA256 signatures server-side using your Bot Token.
- Query Toncenter v3 or TonAPI to confirm the transaction is finalized, matches `DEPOSIT_ADDRESS` and exact nanoton amount, and enforce a unique constraint on `txHash` to prevent replay credits.
- Never place private keys, bot tokens, or TonAPI secrets in client code.
