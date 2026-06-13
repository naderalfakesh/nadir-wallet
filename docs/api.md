# API reference

Base URL (local): `http://localhost:8787`

All success responses have predictable, typed shapes — the response types live in
`@nadir-wallet/types` and are shared with the mobile app. All error responses
use the shared `ApiErrorResponse` shape:

```json
{ "error": { "code": "bad_request", "message": "Unsupported networkId: bitcoin" } }
```

Supported network ids: `ethereum-sepolia`, `polygon-amoy`.

---

## GET /health

```sh
curl localhost:8787/health
```

```json
{ "status": "ok", "uptimeSeconds": 12, "timestamp": "2026-05-31T12:00:00.000Z", "version": "0.1.0" }
```

## GET /networks

```sh
curl localhost:8787/networks
```

```json
{
  "networks": [
    {
      "id": "ethereum-sepolia",
      "name": "Ethereum Sepolia",
      "shortName": "Sepolia",
      "chainId": 11155111,
      "nativeCurrency": { "name": "Sepolia Ether", "symbol": "ETH", "decimals": 18 },
      "testnet": true,
      "explorerUrl": "https://sepolia.etherscan.io",
      "rpcEnvVar": "RPC_URL_ETHEREUM_SEPOLIA"
    }
  ]
}
```

## GET /tokens

```sh
curl "localhost:8787/tokens?networkId=ethereum-sepolia"
```

```json
{
  "networkId": "ethereum-sepolia",
  "tokens": [
    {
      "networkId": "ethereum-sepolia",
      "address": "0x0000000000000000000000000000000000000000",
      "symbol": "ETH",
      "name": "Sepolia Ether",
      "decimals": 18,
      "isNative": true
    },
    {
      "networkId": "ethereum-sepolia",
      "address": "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      "symbol": "USDC",
      "name": "USD Coin (Testnet)",
      "decimals": 6,
      "isNative": false
    }
  ]
}
```

## GET /prices

```sh
curl "localhost:8787/prices?symbols=ETH,USDC,POL"
```

```json
{
  "prices": [
    { "symbol": "ETH", "priceUsd": 3142.5, "source": "mock", "updatedAt": 1780232230179 },
    { "symbol": "USDC", "priceUsd": 1, "source": "mock", "updatedAt": 1780232230179 },
    { "symbol": "POL", "priceUsd": 0.72, "source": "mock", "updatedAt": 1780232230179 }
  ]
}
```

## GET /wallet/:address/balances

```sh
curl "localhost:8787/wallet/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/balances?networkId=ethereum-sepolia"
```

```json
{
  "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  "networkId": "ethereum-sepolia",
  "balances": [
    {
      "token": { "symbol": "ETH", "decimals": 18, "isNative": true, "...": "..." },
      "raw": "3910000000000000000",
      "formatted": "3.91"
    }
  ]
}
```

## GET /wallet/:address/transactions

```sh
curl "localhost:8787/wallet/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/transactions?networkId=polygon-amoy"
```

```json
{
  "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  "networkId": "polygon-amoy",
  "transactions": [
    {
      "hash": "0x0239…1b88",
      "networkId": "polygon-amoy",
      "type": "send",
      "status": "confirmed",
      "from": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      "to": "0xaaea05e2d03ee51af2b988e1c93622de27b596be",
      "valueRaw": "2132000000000000000",
      "valueFormatted": "2.1320",
      "symbol": "POL",
      "feeFormatted": "0.00015100",
      "timestamp": 1780175776742,
      "blockNumber": 5167131
    }
  ]
}
```

## POST /transaction/simulate

Request:

```json
{
  "networkId": "ethereum-sepolia",
  "from": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  "to": "0x1111111111111111111111111111111111111111",
  "value": "0.1"
}
```

Response:

```json
{
  "isValid": true,
  "riskLevel": "low",
  "estimatedFee": {
    "gasLimit": "21000",
    "maxFeePerGasGwei": "2.5",
    "feeNative": "0.0000525",
    "symbol": "ETH"
  },
  "warnings": [],
  "preview": {
    "networkId": "ethereum-sepolia",
    "from": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "to": "0x1111111111111111111111111111111111111111",
    "valueFormatted": "0.1",
    "symbol": "ETH",
    "type": "send"
  }
}
```

## POST /security/check-address

Request:

```json
{
  "address": "0x1111111111111111111111111111111111111111",
  "networkId": "ethereum-sepolia",
  "amount": "12",
  "knownContact": false
}
```

Response:

```json
{
  "riskLevel": "medium",
  "reasons": [
    "The amount is unusually large for a testnet transfer",
    "This address is not in your known contacts"
  ],
  "warnings": ["Confirm the amount before continuing", "Double-check the address before sending"],
  "isValidAddress": true
}
```

See the demo risk matrix in [`apps/api/README.md`](../apps/api/README.md) for low /
medium / high / invalid / error examples.

## POST /security/report-address

Request:

```json
{ "address": "0xcafecafecafecafecafecafecafecafecafecafe", "reason": "demo report" }
```

Response:

```json
{ "ok": true, "id": 2 }
```

A reported address is matched case-insensitively and afterwards returns
`riskLevel: "high"` from `/security/check-address`.

## Error shape

```sh
curl "localhost:8787/tokens?networkId=bogus"
```

```json
{ "error": { "code": "bad_request", "message": "Unsupported networkId: bogus" } }
```

Unknown routes return `404` with `{ "error": { "code": "not_found", ... } }`.
