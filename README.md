# NadirWallet

A Turborepo monorepo housing the NadirWallet frontend and backend.

## Structure

```
apps/
  mobile/        # React Native app (Expo SDK 56, expo-router)
packages/        # Shared packages (empty for now — add shared code here)
```

The backend app will live under `apps/` alongside `mobile`.

## Requirements

- Node.js >= 22.13 (required by Expo SDK 56)
- pnpm 9

## Getting started

```sh
pnpm install
```

### Mobile app

```sh
pnpm --filter mobile start      # start the Expo dev server
pnpm --filter mobile ios        # run on iOS simulator
pnpm --filter mobile android    # run on Android emulator
pnpm --filter mobile web        # run in the browser
```

App code lives in `apps/mobile/src`; only screens and layout files belong in `src/app`.

## Workspace scripts

```sh
pnpm dev            # turbo run dev across all apps
pnpm lint           # turbo run lint
pnpm check-types    # turbo run check-types
pnpm format         # prettier across the repo
```

## Notes

- pnpm uses a hoisted `node_modules` (`.npmrc`) so React Native native modules resolve correctly in the monorepo.
- Expo SDK 56 docs: https://docs.expo.dev/versions/v56.0.0/
