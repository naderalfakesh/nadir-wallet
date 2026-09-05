# Security model

Nadir Wallet is a **local-first, non-custodial, testnet-only** crypto wallet
showcase. This document describes the trust boundary between the device and the
backend, and how secrets are handled on-device.

## The short version

The device holds the secrets. The backend only ever sees public information.
There is no real signing or broadcast in this MVP.

## Non-custodial, local-first

The wallet is created and owned entirely on the device:

- The mobile app generates a real **BIP39 mnemonic** on-device (see below).
- No account, server login, or custodian is involved.
- The backend is an optional, stateless _support_ service for public data. The
  wallet works (shows its address, reveals its phrase, navigates) even if the
  API is unreachable.

## On-device storage: SecureStore vs AsyncStorage

The app stores two kinds of data, deliberately separated:

| Data                                                      | Where                                  | Secret?   |
| --------------------------------------------------------- | -------------------------------------- | --------- |
| BIP39 mnemonic                                            | **SecureStore** (`nadir.mnemonic`)     | **Yes**   |
| App-lock PIN, as a salted PBKDF2 hash                     | **SecureStore** (`nadir.passcode`)     | sensitive |
| Public derived address, `walletCreatedAt`                 | AsyncStorage (prefs)                   | No        |
| onboarding/backup/biometric/auto-lock/theme/hide-balances | AsyncStorage                           | No        |
| Passcode lockout counter                                  | AsyncStorage                           | No        |
| Security event log                                        | AsyncStorage                           | No        |

- **SecureStore** (`expo-secure-store`) is backed by the iOS Keychain and Android
  Keystore. It is the _only_ place secret material lives.
- **AsyncStorage** holds non-secret preferences and the public address. No secret
  ever goes into AsyncStorage.
- All storage access goes through one service (`src/services/storage`); screens
  never call SecureStore directly.

## BIP39 generation and import

- **Generation:** `viem/accounts` `generateMnemonic(english)` produces a valid
  12-word (128-bit) phrase. On Hermes this needs `crypto.getRandomValues`, which
  is polyfilled by `react-native-get-random-values` (imported first in the app
  entry).
- **Import validation:** `@scure/bip39` `validateMnemonic` plus the english
  wordlist check word count, wordlist membership, and the BIP39 **checksum**,
  giving distinct "invalid word" and "invalid checksum" UI states. (`viem`'s
  `mnemonicToAccount` does _not_ verify the checksum, so this is required.)
- During onboarding the phrase lives **only in memory** until the user confirms
  creation; only then is it written to SecureStore.

## EVM derivation

- The account is derived at the standard path **`m/44'/60'/0'/0/0`** via
  `viem/accounts` `mnemonicToAccount` (deterministic, no randomness needed).
- The resulting **checksummed public address** is what flows through the app:
  Home/API fetch, Receive (QR + copy/share), Send `from`, Settings, Accounts.
- The private key is **not persisted separately**; it would be derived in-memory
  from the mnemonic only when signing is implemented (out of scope here).

## App-lock passcode

The 6-digit PIN is the fallback for biometrics and the gate for changing itself.

- The PIN is never stored. `crypto-core` stretches it with **PBKDF2-SHA256**
  (4096 iterations, 16-byte random salt) and the self-describing record
  (`pbkdf2-sha256$<iterations>$<salt>$<hash>`) is what goes into SecureStore.
  Verification is a constant-time comparison of a fresh derivation.
- A 6-digit keyspace is tiny, so the hash is defense in depth against a leaked
  keychain item rather than a substitute for the OS gate. Brute force through
  the UI is what the lockout is for.
- **Lockout** is a pure, tested policy (`features/auth/lockout.ts`): every fifth
  consecutive failure locks the keypad, each lock doubles (30s, 60s, 120s, ...)
  up to an hour, and the counter is persisted so a relaunch does not reset it.
  A successful unlock clears it.
- Changing the passcode requires the current one, verified against the stored
  hash, and appends a `passcode_changed` entry to the security log.
- Records written by earlier builds that kept the PIN in the clear are hashed in
  place on first load.

## Revealing the recovery phrase

The phrase is read back from SecureStore **only after** the biometric/passcode
gate (`FaceIDGate`) on the Reveal and Backup screens. It is never loaded into UI
state before that gate passes.

## What the backend receives

Only **public addresses and public metadata**:

- A wallet's public address (to look up balances/history or run a risk check).
- A network id (`ethereum-sepolia`, `polygon-amoy`).
- A transaction _draft_ for simulation (from/to, amount, optional calldata),
  never a signed transaction, never a key.
- An address + reason when a user reports a risky address.

## What the backend never sees or stores

- Private keys
- Recovery phrases / mnemonics
- Passcode or biometric secrets
- Any signing material

The database holds only public/derived data (cached prices, locally reported
addresses, a log of risk checks).

## API hardening posture

The API is a public, read-mostly service for testnet data, so its posture is
deliberately light:

- Every route validates its input with Zod and rejects malformed addresses
  before touching the database.
- Unhandled errors are logged server-side and returned as a generic
  `internal_error`; only typed `ApiError`s surface their message.
- CORS is open and there is no rate limiting. Nothing behind the API is
  sensitive or account-bound, and the mobile client has no credentials to
  leak. A production deployment would put both behind the edge (per-IP limits
  on `/security/report`, an allowlisted origin for any web client).

## Why signing / broadcast is intentionally out of scope

This MVP demonstrates the _hard, security-relevant_ parts (on-device key
generation, secret storage, the trust boundary, risk/simulation UX) without the
liability of moving funds. Signing and broadcast are deferred deliberately, not
forgotten: the send flow ends at simulation plus a demo-controlled outcome, and
the roadmap lists real testnet signing/broadcast as the next step.

## SecureStore caveats (honest limitations)

- SecureStore relies on the OS keychain/Keystore; the app does **not** add its
  own encryption layer or per-vault passphrase.
- On a **simulator** (or a device with no passcode set), keychain protection is
  weaker than on a passcode-protected physical device.
- A rooted/jailbroken or compromised device can undermine any on-device store.
- This is a **portfolio/testnet** wallet: do not store a real, funded mnemonic
  in it. A production wallet would add an encrypted vault, configurable keychain
  accessibility/biometric binding, and screenshot/secure-flag protections.

## Testnet-only limitation

Supported networks are **Ethereum Sepolia** and **Polygon Amoy**. There is no
mainnet, no real-money custody, and no broadcast. Prices, balances, and history
are deterministic mock data from the API; the service layer is structured so real
testnet RPC can be connected later without changing the API contract or this
trust boundary.

## Face liveness check (active challenge-response)

The Security Center includes an on-device **active liveness check**: the front
camera runs through a custom VisionCamera V5 frame-processor plugin
(`@nadir-wallet/face-liveness`, a Nitro module wrapping Google ML Kit Face
Detection), and a randomized challenge sequence (blink, turn left/right, nod,
smile) is verified in real time against head Euler angles and eye-open / smile
probabilities, with a live "face-in-oval" gate throughout.

Privacy properties:

- All inference runs **on-device** (ML Kit's bundled model). No frame, image,
  or biometric measurement ever leaves the phone; the backend has no liveness
  endpoint at all.
- Nothing is persisted: frames are processed on the camera thread and disposed
  immediately; only a pass/fail entry is appended to the local security log.

Threat model, what active liveness does and does not defend against:

| Attack                                | Covered?  | Notes                                                                     |
| ------------------------------------- | --------- | ------------------------------------------------------------------------- |
| Printed photo held to camera          | Largely   | Cannot blink or turn on command                                           |
| Static screen replay                  | Largely   | Same as photo                                                             |
| Pre-recorded video replay             | Partially | Random challenge order raises the bar; a lucky or edited video could pass |
| Real-time deepfake / puppeteering     | No        | Needs passive presentation-attack detection (PAD)                         |
| 3D mask                               | No        | Needs PAD (texture/depth analysis)                                        |
| Compromised OS / injected camera feed | No        | Out of scope for any in-app check                                         |

This is deliberately an **active-only demo**, not production anti-spoofing. A
production eKYC pipeline would layer a passive PAD model (e.g. a
Silent-Face-Anti-Spoofing-class CNN scoring every frame for print/replay/mask
artifacts) underneath the challenge flow, plus server-side risk signals. The
plugin's frame pipeline is the natural insertion point for such a model: it
would slot in as a second on-device inference pass without changing the trust
boundary above.

**Step-up gating.** Beyond the standalone Security Center demo, the liveness
check can be required as an extra gate before two sensitive actions (toggles in
the Security Center, off by default):

- **Revealing the recovery phrase.** Runs in front of the existing
  biometric/passcode gate, so the keychain read still requires the OS gate
  regardless; liveness is an added check, not a replacement.
- **Confirming a high-value send** (>= $1,000). Runs before the signing step.

This is defense-in-depth for the demo, not a custody guarantee; the real lock on
the recovery phrase remains the device keychain plus the biometric/passcode gate.
