# Interview notes

A practical cheat sheet for talking about Nadir Wallet. Keep it honest — this is
a testnet portfolio MVP, not a production wallet.

## 60-second pitch

> Nadir Wallet is a local-first, non-custodial, testnet-only crypto wallet I
> built in React Native / Expo with a typed Hono backend, in a Turborepo
> monorepo. It generates a real BIP39 wallet on-device, stores the recovery
> phrase in the device keychain, and derives a standard EVM address. The backend
> only ever sees public data — addresses, network ids, token metadata, and
> transaction drafts for simulation. I deliberately scoped out real signing and
> broadcast so I could focus on the hard, security-relevant parts: on-device key
> generation, the trust boundary, secret storage, biometric lock, and a
> risk-check + transaction-simulation send flow — with graceful fallback when the
> API is offline.

## Native integration (the New-Architecture showcase)

This is the part I'd lead with for a senior RN role. The wallet ships **two
hand-written native modules** — not installed wrappers — under the New
Architecture (Fabric + TurboModules, RN 0.85 / Expo SDK 56):

- **`@nadir-wallet/face-liveness`** — a custom
  [react-native-vision-camera V5](https://visioncamera.margelo.com) frame-processor
  plugin, authored as a **Nitro Module** (Swift + Kotlin), wrapping **Google ML
  Kit Face Detection**. It runs on the camera worklet thread (off the JS thread)
  and returns head Euler angles + eye/smile probabilities per frame, which drive
  an **active liveness check** — a randomized blink / turn / nod / smile
  challenge sequence with a live "face-in-oval" gate.
- **`@nadir-wallet/code-scanner`** — a second Nitro frame-processor plugin
  wrapping **ML Kit Barcode Scanning** for a **QR address scanner** in the send
  flow. Same scaffold as the liveness plugin — the point is the pattern
  generalizes.

Talking points:

- **Why Nitro:** VisionCamera V5 rewrote frame processors onto Nitro; a plugin
  is "just a `HybridObject`." I write a `.nitro.ts` spec, run `nitrogen` to
  codegen the C++/Swift/Kotlin bridges, then implement the Swift/Kotlin. Calls
  are synchronous JSI — no bridge, no serialization per frame.
- **The hard parts were native, not JS:** mapping VisionCamera's
  `CameraOrientation` + mirror flags onto an ML Kit image and transforming the
  detected box from camera-buffer space into the mirrored selfie-preview space
  (different on iOS vs Android — iOS analyzes a mirrored buffer).
- **Leverage:** anything derivable from already-exposed signals (yaw/pitch/roll,
  eye-open) is JS-only and ships on reload; a _new_ ML Kit signal (smile) cost
  one native field + a rebuild. Good illustration of the native/JS boundary.
- **Honest scope:** this is **active** liveness only — challenge-response, which
  defeats a static photo/replay but not a real-time deepfake or 3D mask. I
  document where a passive presentation-attack-detection model would layer in
  (`docs/security-model.md`); I don't claim production anti-spoofing.
- **Step-up gating:** the liveness check optionally gates **revealing the
  recovery phrase** and **high-value sends** — so it protects a real action, not
  just a demo screen. Everything runs **on-device**; no frame ever leaves the
  phone.

## Architecture in one breath

- **Monorepo (Turborepo + pnpm):** `apps/mobile`, `apps/api`, and shared
  `@nadir-wallet/{types,crypto-core,wallet-core,config}` packages that export raw
  TypeScript (Metro resolves them directly — no build step).
- **Mobile:** expo-router routes are thin; logic lives in `features/`, state in a
  few React-context providers loaded once at boot (`App`, `Theme`, `DemoState`,
  `WalletData`, `Sheet`).
- **`WalletDataProvider`** is the single data source — it fetches live public data
  and falls back to demo data on failure.
- **Backend:** Hono + libsql/Drizzle + Zod; stateless, public-data-only.
- The shared `types` package keeps the API contract identical on both sides.

## Security in one breath

- Non-custodial + local-first: the device owns the keys; the backend is optional.
- The **mnemonic is the only secret**, stored in **SecureStore** (iOS Keychain /
  Android Keystore). Non-secret prefs + the public address are in AsyncStorage.
- Nothing secret is ever sent to the API. Revealing the phrase is gated behind
  biometric/passcode.
- No private key is persisted separately; no signing/broadcast in this MVP.

## Crypto, in simple words

- A **mnemonic** (12 words) is a human-friendly form of a big random seed.
- From the seed you can deterministically derive keypairs along a **path**; the
  standard Ethereum path is `m/44'/60'/0'/0/0`.
- The **public address** is safe to share (it's where you receive). The **private
  key** signs transactions and must stay secret.
- I use `viem/accounts` for generation + derivation and `@scure/bip39` for
  validating the wordlist and the **checksum** (the last word encodes a checksum;
  `viem` derives an address from any words, so I validate separately).

## What happens during wallet creation

1. User taps "Create" → app generates a valid BIP39 phrase **in memory**.
2. Reveal screen shows the words (tap-to-reveal, "don't screenshot" warning).
3. Confirm-phrase quiz checks 3 words against the generated phrase.
4. User sets a demo app-lock PIN and optionally enables biometrics.
5. On "Open wallet" → derive the address, write the mnemonic to **SecureStore**,
   write the public address + metadata to prefs, log a security event, enter app.

## What happens during import

1. User pastes/types a phrase.
2. Real-time validation: word count, every word in the BIP39 wordlist, and the
   checksum → distinct "invalid word" vs "invalid checksum" states.
3. On a valid phrase → derive the address (same path) → same persistence as
   create. Importing the same phrase always derives the same address.

## What happens during the send flow

1. Pick token → enter recipient (paste, recent contacts, or **scan a QR** via the
   custom ML Kit barcode plugin). App validates the address and runs a **risk
   check** (`POST /security/check-address`, public address only): low / medium /
   high. **High blocks** the send.
2. Enter amount (with insufficient-balance guard).
3. Review: fee estimate, **network-mismatch** warning, and **transaction
   simulation** (`POST /transaction/simulate`) → passed / failed / unavailable.
4. Optional **liveness step-up** for high-value sends, then Face ID confirm →
   pending → success/failed. **Nothing is broadcast** — the outcome is a demo
   control; signing is mocked.

## What the backend does

- Lists supported testnets + tokens; serves cached prices.
- Returns deterministic mock balances + transaction history for a public address.
- Simulates a transaction draft (fee, warnings, risk level, preview).
- Runs address risk checks and stores locally reported risky addresses.

## What the backend never sees

Mnemonic, private key, passcode, biometric secrets, or any signing material. It
only receives public address, networkId, token data, recipient public address,
and transaction draft metadata.

## Tradeoffs / limitations (be upfront)

- **Testnet-only**, no mainnet; **no real signing/broadcast** (deliberate scope).
- Balances/prices/history are **deterministic mock data** (no real RPC/indexer).
- SecureStore protects secrets via the OS keychain but I added **no extra
  app-level encryption**; on a simulator the protection is weaker.
- Liveness is **active-only** — no passive anti-spoofing (deepfake / mask / 3D);
  documented as a threat model, not claimed as production-grade.
- No WalletConnect, no swaps.
- English-only i18n scaffold; no automated test runner configured yet.

## What I'd improve next

- Real **on-device signing** of the simulated transaction (derive the key from the
  stored mnemonic, sign in-memory), then optional testnet **broadcast**.
- Real **price API** + **transaction indexer** behind the backend (Alchemy RPC,
  keys server-side only).
- A stronger **encrypted-vault** model and biometric-bound keychain access.
- **e2e tests** (Detox/Maestro) and unit tests for the crypto + risk logic.
- **Passive anti-spoofing** (a presentation-attack-detection model) layered under
  the active liveness check.
- WalletConnect.

## Good questions to expect (and honest answers)

- _"Is this secure enough for real funds?"_ No — it's a testnet portfolio MVP;
  SecureStore + no app-level vault encryption is the main gap I'd close first.
- _"Why no signing?"_ Scope. Signing without broadcast is a small next step; I
  prioritised the trust boundary and UX states first.
- _"Why a custom backend over Firebase/Supabase?"_ To make the public-data-only
  boundary explicit and auditable, share a typed contract, and show real
  HTTP/DB/validation work. See `docs/architecture.md`.
- _"Is the liveness check real anti-spoofing?"_ It's **active** liveness
  (challenge-response) — it stops a static photo or screen replay, but a
  real-time deepfake or 3D mask needs a **passive** PAD model, which I scoped out
  and documented rather than faked. The interesting engineering is that I wrote
  the ML Kit frame-processor plugin myself as a Nitro Module, not installed a
  wrapper.
- _"Did you write the native modules or use a library?"_ Wrote both — two custom
  VisionCamera V5 Nitro plugins (Swift + Kotlin) over ML Kit Face Detection and
  Barcode Scanning. `packages/face-liveness` and `packages/code-scanner`.
