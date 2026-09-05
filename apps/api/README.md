# API

Public, stateless support services for the NadirWallet showcase. The API never
touches signing material - it only works with public data such as addresses,
token metadata, prices, network metadata, transaction simulation, and risk
checks.

See also: [`docs/security-model.md`](../../docs/security-model.md) and
[`docs/api.md`](../../docs/api.md).

## What it does

- Lists supported testnet networks and their known tokens.
- Serves cached token prices (deterministic mock values for now).
- Returns mock balances and transaction history for any public address.
- Simulates a transaction draft: fee estimate, warnings, risk level, preview.
- Runs address risk checks and stores locally reported risky addresses.

## Security model

This is a local-first, non-custodial, testnet-only wallet showcase.

- The mobile app owns wallet creation, import, and signing.
- Private keys, seed phrases, mnemonics, and signing material are **never** sent
  to the API and are **never** stored here.
- The database only holds public/derived data: cached prices, locally reported
  risky addresses, and a log of risk checks.

Full explanation: [`docs/security-model.md`](../../docs/security-model.md).

## Running

```sh
cp .env.example .env        # optional; sensible defaults are built in
pnpm install                # from the repo root
pnpm dev:api                # or: pnpm --filter api dev
```

The server starts on `http://localhost:8787` and applies database migrations and
seeds demo data on boot, so no manual setup is required for local development.

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

## Environment variables

| Variable | Default | Purpose |
| -------- | ------- | ------- |
| `PORT` | `8787` | Port the API listens on |
| `DATABASE_URL` | `file:./local.db` | libsql/SQLite database location |
| `RPC_URL_ETHEREUM_SEPOLIA` | _(empty)_ | Sepolia RPC URL (not required on mock data) |
| `RPC_URL_POLYGON_AMOY` | _(empty)_ | Polygon Amoy RPC URL (not required on mock data) |

No RPC keys are required for the first implementation - the API runs on mock data
by default.

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

Every success response has a predictable, typed shape (see the response types in
`@nadir-wallet/types`). Every error response uses the shared `ApiErrorResponse`
shape:

```json
{ "error": { "code": "bad_request", "message": "Unsupported networkId: bitcoin" } }
```

## curl examples

```sh
curl localhost:8787/health
curl localhost:8787/networks
curl "localhost:8787/tokens?networkId=ethereum-sepolia"
curl "localhost:8787/prices?symbols=ETH,USDC,POL"

ADDR=0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
curl "localhost:8787/wallet/$ADDR/balances?networkId=ethereum-sepolia"
curl "localhost:8787/wallet/$ADDR/transactions?networkId=ethereum-sepolia"

curl -X POST localhost:8787/transaction/simulate -H 'content-type: application/json' \
  -d "{\"networkId\":\"ethereum-sepolia\",\"from\":\"$ADDR\",\"to\":\"0x1111111111111111111111111111111111111111\",\"value\":\"0.1\"}"

curl -X POST localhost:8787/security/check-address -H 'content-type: application/json' \
  -d '{"address":"0x1111111111111111111111111111111111111111","networkId":"ethereum-sepolia"}'

curl -X POST localhost:8787/security/report-address -H 'content-type: application/json' \
  -d '{"address":"0xcafecafecafecafecafecafecafecafecafecafe","reason":"demo report"}'
```

## Demo risk examples

These are deterministic and clearly mocked/testnet - safe for the mobile app to
use when demonstrating every risk state. They make no claim about any real
address.

| State | How to trigger |
| ----- | -------------- |
| **Low risk** | A valid address with no risk flags |
| **Medium - unknown contact** | A valid address with `knownContact: false` |
| **Medium - large amount** | A valid address with `amount` above `5` |
| **Medium - contract/burn** | The zero/burn address `0x0000…0000` |
| **High - reported** | The seeded demo address `0xbeef…beef` |
| **Error - invalid address** | A malformed address is rejected with `400 bad_request` |
| **Error - unsupported network** | Any unknown `networkId` |

The high-risk reported address `0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef` is
seeded into `reported_addresses` on boot, so it returns `high` without first
calling `/security/report-address`.

```sh
# Low risk
curl -X POST localhost:8787/security/check-address -H 'content-type: application/json' \
  -d '{"address":"0x1111111111111111111111111111111111111111","networkId":"ethereum-sepolia"}'
# -> { "riskLevel": "low", ... }

# Medium risk (unknown contact + large amount)
curl -X POST localhost:8787/security/check-address -H 'content-type: application/json' \
  -d '{"address":"0x1111111111111111111111111111111111111111","networkId":"ethereum-sepolia","amount":"12","knownContact":false}'
# -> { "riskLevel": "medium", ... }

# Medium risk (contract / burn address)
curl -X POST localhost:8787/security/check-address -H 'content-type: application/json' \
  -d '{"address":"0x0000000000000000000000000000000000000000","networkId":"ethereum-sepolia"}'
# -> { "riskLevel": "medium", ... }

# High risk (seeded reported address)
curl -X POST localhost:8787/security/check-address -H 'content-type: application/json' \
  -d '{"address":"0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef","networkId":"ethereum-sepolia"}'
# -> { "riskLevel": "high", ... }

# Error (invalid address - rejected before the risk engine, like report-address)
curl -X POST localhost:8787/security/check-address -H 'content-type: application/json' \
  -d '{"address":"0x123","networkId":"ethereum-sepolia"}'
# -> 400 { "error": { "code": "bad_request", "message": "Invalid address" } }

# Error (unsupported network)
curl -X POST localhost:8787/security/check-address -H 'content-type: application/json' \
  -d '{"address":"0x1111111111111111111111111111111111111111","networkId":"ethereum-mainnet"}'
# -> 400 { "error": { "code": "bad_request", ... } }
```

## Database

SQLite via libsql + Drizzle ORM (`DATABASE_URL=file:./local.db`).

Tables:

- `price_cache` - cached token prices with a freshness timestamp.
- `reported_addresses` - addresses reported as risky from the client.
- `security_checks` - log of address risk checks.

No private keys, mnemonics, or recovery phrases are ever stored.

## What is mocked

To keep the first pass dependency-free and runnable without RPC keys:

- **Prices** are deterministic mock values cached through the service layer.
- **Balances** and **transactions** are deterministic mock data derived from the
  requested address.

## Connecting real testnet data later

The service layer is the single integration point:

- `services/prices.ts` - swap `basePrice` for a free price API; the cache and
  response shape stay the same.
- `services/balances.ts` - replace mock holdings with viem `getBalance` /
  ERC-20 `balanceOf` calls using `RPC_URL_*`.
- `services/transactions.ts` - replace mock history with an indexer or RPC log
  query.
- `@nadir-wallet/wallet-core` `simulateTransaction` - replace the deterministic
  fee model with a real `eth_estimateGas` / fee-history call.

RPC URLs are read from `RPC_URL_ETHEREUM_SEPOLIA` and `RPC_URL_POLYGON_AMOY`
but are not required while running on mock data.
