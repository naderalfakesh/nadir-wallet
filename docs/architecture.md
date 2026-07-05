# Architecture

A Turborepo monorepo with a React Native (Expo) app, a Hono API, and shared
TypeScript packages. The guiding principle: **secrets and signing live on the
device; the backend is a stateless support service for public data.**

## High-level

```
┌─────────────────────────── device ───────────────────────────┐
│  Expo / React Native app                                      │
│   • BIP39 generate/import, EVM derivation (m/44'/60'/0'/0/0)  │
│   • SecureStore: mnemonic + app-lock PIN                      │
│   • AsyncStorage: public address + non-secret prefs + events │
│   • providers: App / Theme / DemoState / WalletData / Sheet  │
└───────────────┬───────────────────────────────────────────────┘
                │  public data only (address, networkId, draft)
                ▼
┌─────────────────────────── server ───────────────────────────┐
│  Hono API (apps/api)                                          │
│   • /networks /tokens /prices /wallet/:addr/* (mock)         │
│   • /transaction/simulate /security/check-address|report     │
│   • libsql + Drizzle: prices cache, reported addrs, risk log │
└───────────────────────────────────────────────────────────────┘
```

## Shared packages

- **`@nadir-wallet/types`** — the source of truth for API request/response and
  domain types, imported by both the app and the API so the contract can't drift.
- **`@nadir-wallet/crypto-core`** — isomorphic crypto helpers: address validation
  (`isEvmAddress`, `normalizeAddress`, `shortenAddress`), amount formatting, and
  the BIP39 wallet module (`generateMnemonic`, `validateMnemonicPhrase`,
  `mnemonicToEvmAddress`). Built on `viem` + `@scure/bip39`.
- **`@nadir-wallet/wallet-core`** — pure domain logic shared by the backend:
  address-risk assessment, transaction simulation, portfolio math.
- **`@nadir-wallet/config`** — shared tsconfig / eslint / prettier.
- **`@nadir-wallet/face-liveness`** / **`@nadir-wallet/code-scanner`** — custom
  native VisionCamera V5 frame-processor plugins (Nitro Modules, Swift/Kotlin)
  wrapping ML Kit Face Detection and Barcode Scanning. Unlike the TS packages
  these ship native code (podspec + Gradle/CMake + committed `nitrogen/`
  output); they autolink into the app and run on the camera worklet thread.

The TypeScript packages export raw `.ts`; Metro is configured (`metro.config.js`)
to watch the repo root and honour package exports, so there is no per-package
build step. The two native packages are built by the iOS/Android toolchains via
autolinking.

## Mobile layers (`apps/mobile/src`)

- **`app/`** — expo-router routes only (thin). `_layout` mounts providers and the
  `react-native-get-random-values` polyfill; `index` gates onboarding → lock →
  home from persisted state.
- **`providers/`** — React context, loaded once at boot before render:
  - `AppProvider` — prefs, security event log, and the wallet lifecycle
    (`createWallet`, `getMnemonic`, `resetWallet`).
  - `ThemeProvider`, `DemoStateProvider` (live-API toggle + manual state
    overrides), `WalletDataProvider` (the single data source), `SheetProvider`.
- **`features/`** — screen logic grouped by domain (onboarding, lock, home,
  send, token, activity, security, settings, sheets, auth, wallet, liveness,
  scan). Screens follow a consistent split: `Screen.tsx` (composition) +
  `.parts.tsx` / `.styles.ts` / `.types.ts` / `.utils.ts` / `use*` hooks.
- **`components/`** — themed primitives (Text, Button, Card, Row, Icon set,
  Sparkline, QR, BottomSheet, notices, …).
- **`services/`** — `api` (typed client), `storage` (AsyncStorage + SecureStore),
  `device` (clipboard/share/explorer), `wallet` (display helpers).
- **`theme/`** — design tokens (oklch → hex), dark/light, `alpha()` helper.
- **`i18n/`** — English locale files by domain + a dependency-free `t()`.

## Backend layers (`apps/api/src`)

- **`app.ts` / `index.ts`** — Hono app + server bootstrap (migrate → seed →
  serve) with CORS, logging, and a consistent `ApiErrorResponse` error shape.
- **`routes/`** — thin route handlers (system, tokens, prices, wallet,
  transaction, security) that validate with Zod (`parseOrThrow`).
- **`services/`** — prices, balances, transactions, security; deterministic mock
  data derived from the address (no randomness), structured to swap in real RPC.
- **`db/`** — Drizzle schema + libsql client + migrations; tables: `price_cache`,
  `reported_addresses`, `security_checks`.
- **`lib/`** — errors, validation, mock helpers.

## Testing

Pure logic is unit-tested with Vitest from the repo root (`pnpm test`): the
liveness challenge state machine (`reduceLiveness`), BIP39/address helpers
(`crypto-core`), risk assessment and transaction simulation (`wallet-core`), QR
address extraction, and the send/security/transaction display helpers. GitHub
Actions runs lint, typecheck, and the suite on every push.

## API data flow (app side)

`WalletDataProvider` is the single source of truth for Home / Activity / Token
detail / sheets:

1. On boot / when "Live API" is on, it calls `/health`, then for each supported
   testnet `/wallet/:address/balances` and `/transactions`, then `/prices` for
   the discovered symbols (`features/wallet/portfolio.ts` adapts the responses
   into the app's display types).
2. It derives `backend` (`online` / `api_unavailable`) and `price`
   (`fresh` / `unavailable`) from the real results.
3. Screens read `{ tokens, transactions, total, change, backend, price, refresh }`
   from `useWallet()` and render `BackendNotice` / `PriceFreshness` accordingly.

The send flow calls `/security/check-address` and `/transaction/simulate`
directly (`features/send/useSendChecks.ts`) when live + the token's network is
API-supported.

## Fallback behavior when the API is unavailable

Designed so the app never looks broken:

- Any failed live request → `useWallet()` falls back to **bundled demo data** and
  surfaces `api_unavailable` via `BackendNotice` (with a working Retry).
- Prices failing → balances still render with `—` values and a "price
  unavailable" indicator.
- Send risk/simulation failing → the existing "unavailable" UI; local signing
  (mocked) remains available.
- A **"Live API data"** toggle (Settings → Demo controls) switches between live
  data and fully manual demo overrides for backend/price/simulation states.

## How the derived address flows

```
onboarding (create/import)
   → crypto-core.mnemonicToEvmAddress(mnemonic)        # m/44'/60'/0'/0/0
   → AppProvider.createWallet: SecureStore.saveMnemonic + prefs.walletAddress
   → prefs.walletAddress (AsyncStorage, public)
        ├─ WalletDataProvider → fetchLivePortfolio(address)
        ├─ ReceiveSheet → QR / copy / share
        ├─ SendScreen → from
        └─ Settings / AccountsSheet → displayed address
```

`resetWallet` clears the SecureStore mnemonic + PIN and the prefs/events, then
routes back to onboarding.

## Why a custom backend (not Supabase / Firebase)

- **The trust boundary is the point.** A custom, stateless service makes it
  explicit and auditable that only public data is ever sent — there is no SDK
  doing implicit auth, sync, or storage of anything sensitive.
- **Typed contract end-to-end.** Sharing `@nadir-wallet/types` between app and API
  guarantees the request/response shapes match; a BaaS would push that contract
  into dashboards and generated clients.
- **Demonstrates backend skills.** Hono + Drizzle + Zod + migrations shows the
  HTTP/DB/validation layer a reviewer wants to see, rather than configuration of
  a managed product.
- **No lock-in, no secrets in the client.** RPC keys (when added) live only in
  `apps/api/.env`; the app only knows a base URL.
