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

| Data | Where | Secret? |
| ---- | ----- | ------- |
| BIP39 mnemonic | **SecureStore** (`nadir.mnemonic`) | **Yes** |
| App-lock PIN (demo placeholder) | **SecureStore** (`nadir.demoPasscode`) | sensitive |
| Public derived address, `walletCreatedAt` | AsyncStorage (prefs) | No |
| onboarding/backup/biometric/auto-lock/theme/hide-balances | AsyncStorage | No |
| Security event log | AsyncStorage | No |

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
- **Import validation:** `@scure/bip39` `validateMnemonic` + the english wordlist
  check word count, wordlist membership, and the BIP39 **checksum** — giving
  distinct "invalid word" and "invalid checksum" UI states. (`viem`'s
  `mnemonicToAccount` does _not_ verify the checksum, so this is required.)
- During onboarding the phrase lives **only in memory** until the user confirms
  creation; only then is it written to SecureStore.

## EVM derivation

- The account is derived at the standard path **`m/44'/60'/0'/0/0`** via
  `viem/accounts` `mnemonicToAccount` (deterministic — no randomness needed).
- The resulting **checksummed public address** is what flows through the app:
  Home/API fetch, Receive (QR + copy/share), Send `from`, Settings, Accounts.
- The private key is **not persisted separately**; it would be derived in-memory
  from the mnemonic only when signing is implemented (out of scope here).

## Revealing the recovery phrase

The phrase is read back from SecureStore **only after** the biometric/passcode
gate (`FaceIDGate`) on the Reveal and Backup screens. It is never loaded into UI
state before that gate passes.

## What the backend receives

Only **public addresses and public metadata**:

- A wallet's public address (to look up balances/history or run a risk check).
- A network id (`ethereum-sepolia`, `polygon-amoy`).
- A transaction _draft_ for simulation (from/to, amount, optional calldata) —
  never a signed transaction, never a key.
- An address + reason when a user reports a risky address.

## What the backend never sees or stores

- Private keys
- Recovery phrases / mnemonics
- Passcode or biometric secrets
- Any signing material

The database holds only public/derived data (cached prices, locally reported
addresses, a log of risk checks).

## Why signing / broadcast is intentionally out of scope

This MVP demonstrates the _hard, security-relevant_ parts — on-device key
generation, secret storage, the trust boundary, risk/simulation UX — without the
liability of moving funds. Signing and broadcast are deferred deliberately, not
forgotten: the send flow ends at simulation + a demo-controlled outcome, and the
roadmap lists real testnet signing/broadcast as the next step.

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
