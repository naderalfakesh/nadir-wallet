import { normalizeAddress, SUPPORTED_NETWORKS } from "@nadir-wallet/crypto-core";

/**
 * A tiny one-shot channel so the full-screen scanner can hand a result back to
 * whoever opened it. The opener (e.g. the send screen) stays mounted beneath
 * the pushed `/scan` route, registers a resolver, and the scanner delivers to
 * it on success or cancel. Single-scanner app → a module singleton is enough.
 */
type ScanResolver = (value: string | null) => void;

let resolver: ScanResolver | null = null;

export function beginScan(onResult: ScanResolver): void {
  resolver = onResult;
}

export function deliverScan(value: string | null): void {
  const r = resolver;
  resolver = null;
  r?.(value);
}

export type ScanRejectReason =
  | "empty"
  | "too-long"
  | "malformed"
  | "bad-checksum"
  | "zero-address"
  | "missing-chain"
  | "unsupported-chain"
  | "unsupported-function"
  | "unsupported-parameter"
  | "malformed-parameter"
  | "recipient-is-token";

export type ScanParseResult =
  | {
      ok: true;
      /** Who the funds go to. For an ERC-20 transfer this is the `address` param, never the token. */
      recipient: string;
      /** Null only for a bare address / bare `ethereum:<address>` with no chain stated. */
      chainId: number | null;
      /** Set only for an ERC-20 `transfer` URI. */
      tokenContract: string | null;
    }
  | { ok: false; reason: ScanRejectReason };

// QR payloads are small; anything bigger is not something we should be parsing.
const MAX_PAYLOAD_LENGTH = 512;

const SUPPORTED_CHAIN_IDS: ReadonlySet<number> = new Set(
  SUPPORTED_NETWORKS.map((network) => network.chainId),
);

const HEX_ADDRESS = /^0x[0-9a-fA-F]{40}$/;
const ZERO_ADDRESS = /^0x0{40}$/;
// EIP-681: [pay-]<address>[@<chain_id>][/<function>][?<params>], matched in full so a
// longer hex string (tx hash, private key) can never yield a 40-char slice.
const EIP681_BODY = /^(?:pay-)?(0x[0-9a-fA-F]{40})(?:@([0-9]+))?(?:\/([A-Za-z0-9_]+))?(?:\?(.*))?$/;
// Unsigned decimal, optionally with fraction and exponent (EIP-681 `number`).
const EIP681_NUMBER = /^(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][0-9]+)?$/;

const NATIVE_PARAMS: ReadonlySet<string> = new Set(["value", "gas", "gasLimit", "gasPrice"]);
const TRANSFER_NUMERIC_PARAMS: ReadonlySet<string> = new Set([
  "uint256",
  "gas",
  "gasLimit",
  "gasPrice",
]);

type AddressCheck = { ok: true; address: string } | { ok: false; reason: ScanRejectReason };

function checkAddress(value: string): AddressCheck {
  if (!HEX_ADDRESS.test(value)) return { ok: false, reason: "malformed" };
  if (ZERO_ADDRESS.test(value)) return { ok: false, reason: "zero-address" };
  const checksummed = normalizeAddress(value);
  const hex = value.slice(2);
  // Single-case hex carries no checksum; mixed case must match EIP-55 exactly.
  const isMixedCase = hex !== hex.toLowerCase() && hex !== hex.toUpperCase();
  if (isMixedCase && checksummed !== value) return { ok: false, reason: "bad-checksum" };
  return { ok: true, address: checksummed };
}

function parseParams(query: string): Map<string, string> | null {
  const params = new Map<string, string>();
  for (const pair of query.split("&")) {
    const eq = pair.indexOf("=");
    if (eq <= 0) return null;
    const key = pair.slice(0, eq);
    const value = pair.slice(eq + 1);
    if (!/^[A-Za-z][A-Za-z0-9]*$/.test(key) || value.length === 0 || params.has(key)) return null;
    params.set(key, value);
  }
  return params;
}

/**
 * Strictly parses a scanned payload into a send recipient. Supported forms:
 * - a bare `0x` address (EIP-55 checked when mixed-case);
 * - `ethereum:[pay-]<address>` with no chain and no params (EIP-681: current network);
 * - `ethereum:[pay-]<address>@<testnet chain>[?value=&gas=&gasLimit=&gasPrice=]`;
 * - `ethereum:[pay-]<token>@<testnet chain>/transfer?address=<recipient>[&uint256=…]`.
 * Everything else, including mainnet or unknown chains, is rejected.
 */
export function parseScanPayload(raw: string): ScanParseResult {
  const input = raw.trim();
  if (input.length === 0) return { ok: false, reason: "empty" };
  if (input.length > MAX_PAYLOAD_LENGTH) return { ok: false, reason: "too-long" };

  if (!/^ethereum:/i.test(input)) {
    const plain = checkAddress(input);
    return plain.ok
      ? { ok: true, recipient: plain.address, chainId: null, tokenContract: null }
      : plain;
  }

  const match = EIP681_BODY.exec(input.slice("ethereum:".length));
  if (!match) return { ok: false, reason: "malformed" };
  const [, target, chainText, fn, query] = match;

  const targetCheck = checkAddress(target);
  if (!targetCheck.ok) return targetCheck;

  if (chainText === undefined) {
    // Without a chain we only trust the bare form; amounts/calls could target another network.
    if (fn !== undefined || query !== undefined) return { ok: false, reason: "missing-chain" };
    return { ok: true, recipient: targetCheck.address, chainId: null, tokenContract: null };
  }

  if (!/^[1-9][0-9]{0,15}$/.test(chainText)) return { ok: false, reason: "unsupported-chain" };
  const chainId = Number(chainText);
  if (!SUPPORTED_CHAIN_IDS.has(chainId)) return { ok: false, reason: "unsupported-chain" };

  let params = new Map<string, string>();
  if (query !== undefined) {
    const parsed = parseParams(query);
    if (!parsed) return { ok: false, reason: "malformed-parameter" };
    params = parsed;
  }

  if (fn === undefined) {
    for (const [key, value] of params) {
      if (!NATIVE_PARAMS.has(key)) return { ok: false, reason: "unsupported-parameter" };
      if (!EIP681_NUMBER.test(value)) return { ok: false, reason: "malformed-parameter" };
    }
    return { ok: true, recipient: targetCheck.address, chainId, tokenContract: null };
  }

  if (fn !== "transfer") return { ok: false, reason: "unsupported-function" };

  const recipientText = params.get("address");
  if (recipientText === undefined) return { ok: false, reason: "malformed-parameter" };
  for (const [key, value] of params) {
    if (key === "address") continue;
    if (!TRANSFER_NUMERIC_PARAMS.has(key)) return { ok: false, reason: "unsupported-parameter" };
    if (!EIP681_NUMBER.test(value)) return { ok: false, reason: "malformed-parameter" };
  }
  const recipientCheck = checkAddress(recipientText);
  if (!recipientCheck.ok) return recipientCheck;
  if (recipientCheck.address === targetCheck.address)
    return { ok: false, reason: "recipient-is-token" };

  return {
    ok: true,
    recipient: recipientCheck.address,
    chainId,
    tokenContract: targetCheck.address,
  };
}

/** The send recipient from a scanned payload, or null if it isn't a supported form. */
export function extractEvmAddress(raw: string): string | null {
  const result = parseScanPayload(raw);
  return result.ok ? result.recipient : null;
}
