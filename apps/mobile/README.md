# Nadir Wallet mobile app

The React Native client of the Nadir Wallet monorepo: Expo SDK 57, React
Native 0.86, expo-router, TypeScript. The project pitch, security model, and
architecture live in the [root README](../../README.md) and [`docs/`](../../docs).

## Running it

Install from the repo root, start the API, then start Metro here:

```sh
pnpm install
pnpm dev:api
pnpm --filter @nadir-wallet/mobile start
```

The app talks to the API at `EXPO_PUBLIC_API_URL` (defaults to
`http://localhost:8787`). On a physical device set it to your machine's LAN
address in `apps/mobile/.env`. If the API is unreachable the app falls back to
bundled demo data.

## Native builds

The face-liveness check and the QR scanner run Google ML Kit through two
hand-written VisionCamera frame-processor plugins, so they need a development
build rather than Expo Go:

```sh
pnpm --filter @nadir-wallet/mobile ios       # simulator
pnpm --filter @nadir-wallet/mobile ios -- --device
pnpm --filter @nadir-wallet/mobile android
```

Both plugins have been verified on physical iOS and Android devices. Camera
features need a real camera, so the simulator is only useful for the rest of
the app.

### Simulator builds on Apple Silicon

Google ships ML Kit without an arm64 simulator slice and pins
`EXCLUDED_ARCHS = arm64` for the simulator, which leaves Xcode 26 and later (no
Rosetta simulators) with no usable destination. `plugins/withMlkitSimulatorFix.js`,
a config plugin registered in `app.json`, injects two Podfile hooks:
`post_integrate` strips that override from the generated xcconfigs (it has to
run after CocoaPods writes the app's aggregate xcconfigs), and `post_install`
rewrites the Mach-O load commands of the affected ML Kit frameworks so the same
binaries link for both device and simulator. They run on every `pod install`;
nothing else is needed. With Xcode 27, `pnpm --filter @nadir-wallet/mobile ios`
builds for the simulator and opens it in Device Hub.

Set `APPLE_TEAM_ID` in `.env` for device signing; `app.config.js` picks it up.

## Layout

```
src/
  app/          expo-router routes (thin)
  features/     screen logic by domain: onboarding, lock, home, send, token,
                activity, security, settings, sheets, auth, wallet, liveness, scan
  components/   themed primitives (text, buttons, cards, icons, bottom sheet)
  providers/    App, Theme, DemoState, WalletData, Sheet contexts
  services/     api client, storage (SecureStore + AsyncStorage), device helpers
  theme/        design tokens, dark and light palettes
  i18n/         English locale files by domain
plugins/        Expo config plugins (ML Kit simulator fix)
```

Screens follow one split: `Screen.tsx` composes `.parts.tsx`, `.styles.ts`,
`.types.ts`, `.utils.ts`, and `use*` hooks. Pure logic in `features/` has
Vitest coverage from the repo root (`pnpm test`).

## Demo controls

Settings has a "Demo controls" card that flips the backend, price, simulation,
and send-outcome states so every UI state can be shown without a real chain.
Turning "Live API data" off switches the whole app to bundled data.
