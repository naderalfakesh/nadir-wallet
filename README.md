# Nadir Wallet

A polished, **local-first, non-custodial, testnet-only** crypto wallet showcase —
a senior-level React Native / Expo portfolio project with a typed Hono backend,
in a Turborepo monorepo.

## Pitch

Nadir Wallet looks and behaves like a premium fintech wallet, but it is built to
demonstrate _engineering judgement_ rather than to move real money. Wallets are
generated on-device with real BIP39, the recovery phrase never leaves the
keychain, and the backend only ever sees public data (addresses, network ids,
token metadata, transaction drafts for simulation). It runs only on Ethereum
Sepolia and Polygon Amoy testnets, with no real signing or broadcast yet — a
deliberate, clearly-scoped MVP boundary.

## Tech stack

| Area     | Choices |
| -------- | ------- |
| Mobile   | React Native 0.85 (Expo SDK 56), expo-router, TypeScript, react-native-svg |
| Crypto   | `viem/accounts` (generation/derivation) + `@scure/bip39` (validation), `react-native-get-random-values` |
| Storage  | `expo-secure-store` (secrets), `@react-native-async-storage/async-storage` (prefs) |
| Device   | `expo-local-authentication`, `expo-clipboard`, `expo-web-browser`, `react-native-qrcode-svg` |
| Native   | `@nadir-wallet/face-liveness` — custom VisionCamera V5 frame-processor plugin (Nitro Module, Swift/Kotlin) wrapping Google ML Kit Face Detection |
| Backend  | Hono + `@hono/node-server`, libsql + Drizzle ORM, Zod, viem |
| Shared   | `@nadir-wallet/{types,crypto-core,wallet-core,config}` |
| Tooling  | Turborepo, pnpm 9 |

## Monorepo structure

```
apps/
  mobile/                # React Native app (Expo SDK 56, expo-router)
  api/                   # Hono backend API (libsql + Drizzle)
packages/
  types/                 # @nadir-wallet/types — shared response/domain types
  crypto-core/           # @nadir-wallet/crypto-core — address + BIP39 wallet helpers
  wallet-core/           # @nadir-wallet/wallet-core — risk, simulation, portfolio logic
  face-liveness/         # @nadir-wallet/face-liveness — native VisionCamera/ML Kit plugin (Nitro)
  config/                # @nadir-wallet/config — shared tsconfig / eslint / prettier
docs/
  security-model.md      # trust boundary, what is/never sent to the API
  architecture.md        # layers, data flow, design decisions
  interview-notes.md     # interview cheat sheet
  api.md                 # endpoint request/response reference
```

Mobile follows a feature-based layout under `apps/mobile/src` (`app/` routes,
`features/`, `components/`, `providers/`, `services/`, `theme/`, `i18n/`).

## Requirements

- Node.js >= 22.13 (required by Expo SDK 56)
- pnpm 9
- Xcode (iOS Simulator) and/or Android Studio for device builds

## Getting started

```sh
pnpm install
```

### Run the API

```sh
pnpm dev:api          # http://localhost:8787 — runs migrations + seeds on boot
```

### Run the mobile app

```sh
pnpm --filter @nadir-wallet/mobile start   # then press i (iOS) / a (Android)
```

Run the API first so the app can fetch live public data; if it's down, the app
falls back to bundled demo data (toggle "Live API data" in Settings → Demo
controls).

## Environment setup

Copy the example files (sensible defaults are built in, so this is optional for
local dev):

```sh
cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env
```

**API (`apps/api/.env`)** — server-only, never bundled into the app:

```env
PORT=8787
DATABASE_URL=file:./local.db
RPC_URL_ETHEREUM_SEPOLIA=
RPC_URL_POLYGON_AMOY=
```

**Mobile (`apps/mobile/.env`)** — only public config (`EXPO_PUBLIC_*` is embedded
in the JS bundle):

```env
EXPO_PUBLIC_API_URL=http://localhost:8787
```

On a **physical device**, `localhost` won't resolve — set `EXPO_PUBLIC_API_URL`
to the dev machine's LAN address (e.g. `http://192.168.1.20:8787`).

### Adding Alchemy / RPC URLs (backend only)

Real RPC is **not wired up yet** — the API serves deterministic mock balances,
prices, and history (roadmap below). When real RPC is added, provider URLs go
**only** in `apps/api/.env`:

```env
RPC_URL_ETHEREUM_SEPOLIA=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
RPC_URL_POLYGON_AMOY=https://polygon-amoy.g.alchemy.com/v2/YOUR_KEY
```

> **Never** put an RPC/Alchemy key in an `EXPO_PUBLIC_*` variable — those ship
> inside the mobile bundle and are public. RPC keys stay server-side, behind the
> API, by design.

## Current MVP features

- On-device **BIP39** wallet generation and import with real word/checksum
  validation; EVM address derived at `m/44'/60'/0'/0/0`.
- Recovery phrase stored only in the device keychain (SecureStore); revealing it
  requires the biometric/passcode gate.
- Onboarding, biometric/passcode lock with auto-lock on background, and a local
  append-only security event log.
- Home dashboard, token detail, activity, receive (real QR), send flow with
  backend-backed **address risk check** and **transaction simulation**, security
  center, and settings.
- Live API wiring with graceful demo-data fallback; clipboard / share / testnet
  explorer actions.
- Dark + light themes, persisted preferences, English i18n scaffold.
- **Active face-liveness check** (Security Center): randomized blink /
  turn-head challenges verified in real time by a hand-written native
  frame-processor plugin (`packages/face-liveness`) running ML Kit on the
  camera worklet thread — fully on-device (see
  `docs/security-model.md` for the threat model).

## Current limitations

- **Testnet-only** (Ethereum Sepolia, Polygon Amoy); no mainnet.
- **No real signing or broadcast** — the send flow simulates and shows
  pending/success/failed outcomes via a demo control; nothing is broadcast.
- Balances, prices, and history are **deterministic mock data** from the API (no
  real RPC/indexer yet).
- No camera QR scanner, no WalletConnect, no swaps.
- SecureStore protects secrets with the OS keychain/Keystore but adds no extra
  app-level encryption (see `docs/security-model.md`).

## Roadmap

- Real testnet transaction signing (on-device, from the stored mnemonic)
- Optional testnet broadcast
- Real price API + real transaction indexer (Alchemy/RPC)
- Camera QR scanner (camera stack already in place via the liveness feature)
- Step-up liveness gating for reveal-seed / high-value send
- Passive anti-spoofing (PAD) layered under the active liveness check
- Stronger encrypted-vault model
- WalletConnect
- e2e tests
- Screenshots / demo video

## Screenshots / demo

> _Add screenshots and a short screen-recording here for the portfolio._
>
> Suggested shots: Welcome · Recovery-phrase reveal · Home · Send review (risk +
> simulation) · High-risk blocked · Receive (QR) · Security center · Settings.

## Docs

- [`docs/security-model.md`](docs/security-model.md) — trust boundary & secrets
- [`docs/architecture.md`](docs/architecture.md) — layers & data flow
- [`docs/interview-notes.md`](docs/interview-notes.md) — interview cheat sheet
- [`docs/api.md`](docs/api.md) — endpoint reference
- [`apps/api/README.md`](apps/api/README.md) — API specifics

## Workspace scripts

```sh
pnpm dev            # turbo run dev across all apps
pnpm dev:api        # backend only
pnpm dev:mobile     # mobile only
pnpm lint           # turbo run lint
pnpm typecheck      # turbo run typecheck (all packages + apps)
pnpm format         # prettier across the repo
```

## Notes

- pnpm uses a hoisted `node_modules` (`.npmrc`) so React Native native modules
  resolve correctly in the monorepo.
- The `@nadir-wallet/*` packages export raw `.ts`; Metro is configured to watch
  the repo root and resolve package exports (`apps/mobile/metro.config.js`).
