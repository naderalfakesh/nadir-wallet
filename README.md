# NadirWallet

A Turborepo monorepo housing the NadirWallet frontend and backend.

## Structure

```
apps/
  mobile/                # React Native app (Expo SDK 56, expo-router)
  api/                   # Hono backend API (libsql + Drizzle)
packages/
  types/                 # @nadir-wallet/types — shared TypeScript types
  crypto-core/           # @nadir-wallet/crypto-core — address/amount/network helpers
  wallet-core/           # @nadir-wallet/wallet-core — risk, simulation, portfolio logic
  config/                # @nadir-wallet/config — shared tsconfig / eslint / prettier
docs/
  security-model.md      # non-custodial, testnet-only trust boundary
  api.md                 # endpoint request/response reference
```

`crypto-core` and `wallet-core` are dependency-light and free of Node-only APIs,
so they are safe to import from `apps/mobile` later. Backend-only concerns
(database, Hono server, RPC) stay inside `apps/api`.

## Requirements

- Node.js >= 22.13 (required by Expo SDK 56)
- pnpm 9

## Getting started

```sh
pnpm install
```

### Mobile app

```sh
pnpm --filter @nadir-wallet/mobile start    # start the Expo dev server
pnpm --filter @nadir-wallet/mobile ios      # run on iOS simulator
pnpm --filter @nadir-wallet/mobile android  # run on Android emulator
pnpm --filter @nadir-wallet/mobile web      # run in the browser
```

App code lives in `apps/mobile/src`; only screens and layout files belong in `src/app`.

### API

```sh
pnpm dev:api        # start the backend on http://localhost:8787
```

See [`apps/api/README.md`](apps/api/README.md) for endpoints, env vars, and demo
risk examples.

## Workspace scripts

```sh
pnpm dev            # turbo run dev across all apps
pnpm dev:api        # backend only
pnpm dev:mobile     # mobile only
pnpm lint           # turbo run lint
pnpm typecheck      # turbo run typecheck
pnpm format         # prettier across the repo
```

## Notes

- pnpm uses a hoisted `node_modules` (`.npmrc`) so React Native native modules resolve correctly in the monorepo.
- Expo SDK 56 docs: https://docs.expo.dev/versions/v56.0.0/
