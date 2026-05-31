# Security model

NadirWallet is a **local-first, non-custodial, testnet-only** crypto wallet
showcase. This document describes the trust boundary between the mobile app and
the backend API.

## The short version

The device holds the secrets. The backend only ever sees public information.

## What stays on the device

The mobile app is the only place that ever handles signing material:

- **Private keys never leave the device.**
- **The recovery phrase / mnemonic never leaves the device.**
- **Signing happens locally on the mobile app.** Transactions are built and
  signed on-device; only the user authorizes them.

These values are not sent to the backend, not logged, and not stored anywhere
off-device. Secure on-device storage (e.g. the platform keystore/secure
enclave) is the mobile app's responsibility.

## What the backend receives

The backend only receives **public addresses and public metadata**, such as:

- A wallet's public address (to look up balances, history, or run a risk check).
- A network id (`ethereum-sepolia`, `polygon-amoy`).
- A transaction *draft* for simulation (from/to addresses, amount, optional
  calldata) — never a signed transaction and never a key.
- An address + reason when the user reports a risky address.

## What the backend provides

The backend is a stateless support service. It provides:

- **Network and token metadata** for supported testnets.
- **Cached prices** (deterministic mock values for now, cached server-side).
- **Mocked balances and transaction history** derived from the public address.
- **Address risk checks** (valid/invalid, reported, unknown contact, large
  amount, contract/burn heuristics).
- **Transaction simulation** — estimated fee, warnings, risk level, and a
  normalized preview of a draft transaction.

## What the backend never stores

The database holds only public/derived data: cached prices, locally reported
addresses, and a log of risk checks. It never stores:

- Private keys
- Recovery phrases / mnemonics
- Any signing material

## Testnet-only limitation

This phase is **testnet-only**. Supported networks are Ethereum Sepolia and
Polygon Amoy. There is no mainnet sending and no real-money custody. Prices,
balances, and transaction history are currently mock data; the service layer is
structured so real testnet RPC providers can be connected later without changing
the API contract or the trust boundary described here.
