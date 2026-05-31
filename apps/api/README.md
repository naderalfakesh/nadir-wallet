# API

Public, stateless support services for the NadirWallet showcase. The API never
touches signing material — it only works with public data such as addresses,
token metadata, prices, network metadata, transaction simulation, and risk
checks.

## Security model

This is a local-first, non-custodial, testnet-only wallet showcase.

- The mobile app owns wallet creation, import, and signing.
- Private keys, seed phrases, mnemonics, and signing material are **never** sent
  to the API and are **never** stored here.
- The database only holds public/derived data: cached prices, locally reported
  risky addresses, and a log of risk checks.

## Running

```sh
cp .env.example .env        # optional; sensible defaults are built in
pnpm install                # from the repo root
pnpm --filter api dev       # or: pnpm dev:api
```

The server starts on `http://localhost:8787` and applies database migrations on
boot, so no manual migration step is required for local development.

### Scripts

```sh
pnpm --filter api dev          # watch mode (tsx)
pnpm --filter api build        # bundle to dist/ (tsup)
pnpm --filter api start        # run the built server
pnpm --filter api typecheck    # tsc --noEmit
pnpm --filter api lint         # eslint
pnpm --filter api db:generate  # generate Drizzle migrations from the schema
pnpm --filter api db:migrate   # apply migrations manually
```

## Endpoints

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/health` | API health info |
| GET | `/networks` | Supported testnet networks |
| GET | `/tokens?networkId=ethereum-sepolia` | Known tokens for a network |
| GET | `/prices?symbols=ETH,USDC,POL` | Cached token prices |
| GET | `/wallet/:address/balances?networkId=ethereum-sepolia` | Token balances |
| GET | `/wallet/:address/transactions?networkId=ethereum-sepolia` | Recent history |
| POST | `/transaction/simulate` | Fee estimate, warnings, risk, preview |
| POST | `/security/check-address` | Address risk assessment |
| POST | `/security/report-address` | Store a locally reported risky address |

Supported network ids: `ethereum-sepolia`, `polygon-amoy`.

## Database

SQLite via libsql + Drizzle ORM (`DATABASE_URL=file:./local.db`).

Tables:

- `price_cache` — cached token prices with a freshness timestamp.
- `reported_addresses` — addresses reported as risky from the client.
- `security_checks` — log of address risk checks.

No private keys, mnemonics, or recovery phrases are ever stored.

## What is mocked

To keep the first pass dependency-free and runnable without RPC keys:

- **Prices** are deterministic mock values cached through the service layer.
- **Balances** and **transactions** are deterministic mock data derived from the
  requested address.

## Connecting real testnet data later

The service layer is the single integration point:

- `services/prices.ts` — swap `basePrice` for a free price API; the cache and
  response shape stay the same.
- `services/balances.ts` — replace mock holdings with viem `getBalance` /
  ERC-20 `balanceOf` calls using `RPC_URL_*`.
- `services/transactions.ts` — replace mock history with an indexer or RPC log
  query.
- `@repo/wallet-core` `simulateTransaction` — replace the deterministic fee
  model with a real `eth_estimateGas` / fee-history call.

RPC URLs are read from `RPC_URL_ETHEREUM_SEPOLIA` and `RPC_URL_POLYGON_AMOY`
but are not required while running on mock data.
