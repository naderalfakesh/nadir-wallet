import { afterEach, describe, expect, it, vi } from "vitest";
import scanCopy from "@/i18n/locales/en/scan.json";
import {
  beginScan,
  currentScanSession,
  deliverScan,
  evaluateScan,
  extractEvmAddress,
  parseScanPayload,
  scanFeedback,
  type ScanRejectReason,
} from "./scanBridge";

const REJECT_REASONS: ScanRejectReason[] = [
  "empty",
  "too-long",
  "malformed",
  "bad-checksum",
  "zero-address",
  "missing-chain",
  "unsupported-chain",
  "unsupported-function",
  "unsupported-parameter",
  "malformed-parameter",
  "recipient-is-token",
  "token-request",
  "asset-mismatch",
];

const ADDRESS = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const OTHER = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
// Sepolia USDC, from the crypto-core token list.
const TOKEN = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
const SEPOLIA = 11155111;
const AMOY = 80002;

describe("extractEvmAddress", () => {
  it("pulls a bare address", () => {
    expect(extractEvmAddress(ADDRESS)).toBe(ADDRESS);
  });

  it("pulls an address out of an EIP-681 URI", () => {
    expect(extractEvmAddress(`ethereum:${ADDRESS}@11155111`)).toBe(ADDRESS);
  });

  it("returns null when there is no address", () => {
    expect(extractEvmAddress("just some text")).toBeNull();
    expect(extractEvmAddress("0x1234")).toBeNull();
  });

  it("returns the transfer recipient, not the token contract", () => {
    expect(
      extractEvmAddress(`ethereum:${TOKEN}@${SEPOLIA}/transfer?address=${ADDRESS}&uint256=1e6`),
    ).toBe(ADDRESS);
  });

  it("does not slice an address out of longer hex or surrounding text", () => {
    const txHash = "0x9c41a7e2f80b3d6c5a91e4072bd138fae6201c9d44ab7e35f0c2189d6e7a4b30";
    expect(extractEvmAddress(txHash)).toBeNull();
    expect(extractEvmAddress(`send to ${ADDRESS} please`)).toBeNull();
    expect(extractEvmAddress(`https://evil.example/${ADDRESS}`)).toBeNull();
  });
});

describe("parseScanPayload — accepted forms", () => {
  it("accepts a bare address with surrounding whitespace, unscoped to a chain", () => {
    expect(parseScanPayload(`  ${ADDRESS}\n`)).toEqual({
      ok: true,
      recipient: ADDRESS,
      chainId: null,
      tokenContract: null,
    });
  });

  it("checksums single-case addresses", () => {
    expect(parseScanPayload(ADDRESS.toLowerCase())).toMatchObject({ ok: true, recipient: ADDRESS });
    expect(parseScanPayload(`0x${ADDRESS.slice(2).toUpperCase()}`)).toMatchObject({
      ok: true,
      recipient: ADDRESS,
    });
  });

  it.each([SEPOLIA, AMOY])("accepts a native URI on supported testnet %i", (chainId) => {
    expect(parseScanPayload(`ethereum:${ADDRESS}@${chainId}`)).toEqual({
      ok: true,
      recipient: ADDRESS,
      chainId,
      tokenContract: null,
    });
  });

  it("accepts the pay- prefix, case-insensitive scheme and native amount/gas params", () => {
    expect(
      parseScanPayload(
        `ETHEREUM:pay-${ADDRESS}@${SEPOLIA}?value=2.014e18&gasLimit=21000&gasPrice=1e9`,
      ),
    ).toEqual({
      ok: true,
      recipient: ADDRESS,
      chainId: SEPOLIA,
      tokenContract: null,
    });
  });

  it("accepts a bare chainless ethereum: URI like a raw address", () => {
    expect(parseScanPayload(`ethereum:${ADDRESS}`)).toEqual({
      ok: true,
      recipient: ADDRESS,
      chainId: null,
      tokenContract: null,
    });
  });

  it.each([SEPOLIA, AMOY])(
    "splits an ERC-20 transfer into token and recipient on %i",
    (chainId) => {
      expect(
        parseScanPayload(`ethereum:${TOKEN}@${chainId}/transfer?address=${OTHER}&uint256=1000000`),
      ).toEqual({
        ok: true,
        recipient: OTHER,
        chainId,
        tokenContract: TOKEN,
      });
    },
  );
});

describe("parseScanPayload — rejected forms", () => {
  it.each([
    ["empty", "   ", "empty"],
    ["oversized", `ethereum:${ADDRESS}@${SEPOLIA}?value=${"1".repeat(600)}`, "too-long"],
    ["short hex", "0x1234", "malformed"],
    ["41 hex chars", `${ADDRESS}a`, "malformed"],
    ["64-char hash", `0x${"ab".repeat(32)}`, "malformed"],
    ["non-hex chars", "0x70997970C51812dc3A010C7d01b50e0d17dc79Cg", "malformed"],
    ["missing 0x", ADDRESS.slice(2), "malformed"],
    ["uppercase 0X", `0X${ADDRESS.slice(2)}`, "malformed"],
    ["inner whitespace", `ethereum: ${ADDRESS}@${SEPOLIA}`, "malformed"],
    ["ENS name", `ethereum:alice.eth@${SEPOLIA}`, "malformed"],
    ["overlong URI target", `ethereum:${ADDRESS}ff@${SEPOLIA}`, "malformed"],
    ["other scheme", `bitcoin:${ADDRESS}`, "malformed"],
    ["unknown prefix", `ethereum:foo-${ADDRESS}@${SEPOLIA}`, "malformed"],
    ["fragment", `ethereum:${ADDRESS}@${SEPOLIA}#x`, "malformed"],
    ["bad checksum", "0x70997970c51812DC3A010C7d01b50e0d17dc79C8", "bad-checksum"],
    ["zero address", `0x${"0".repeat(40)}`, "zero-address"],
    ["mainnet", `ethereum:${ADDRESS}@1`, "unsupported-chain"],
    ["polygon mainnet", `ethereum:${ADDRESS}@137`, "unsupported-chain"],
    ["unconfigured testnet", `ethereum:${ADDRESS}@84532`, "unsupported-chain"],
    ["leading-zero chain", `ethereum:${ADDRESS}@011155111`, "unsupported-chain"],
    ["empty chain", `ethereum:${ADDRESS}@`, "malformed"],
    ["hex chain", `ethereum:${ADDRESS}@0xaa36a7`, "malformed"],
    ["chainless with amount", `ethereum:${ADDRESS}?value=1`, "missing-chain"],
    ["chainless transfer", `ethereum:${TOKEN}/transfer?address=${ADDRESS}`, "missing-chain"],
    ["mainnet transfer", `ethereum:${TOKEN}@1/transfer?address=${ADDRESS}`, "unsupported-chain"],
    [
      "approve call",
      `ethereum:${TOKEN}@${SEPOLIA}/approve?address=${ADDRESS}&uint256=1`,
      "unsupported-function",
    ],
    [
      "transfer without recipient",
      `ethereum:${TOKEN}@${SEPOLIA}/transfer?uint256=1`,
      "malformed-parameter",
    ],
    [
      "transfer with native value",
      `ethereum:${TOKEN}@${SEPOLIA}/transfer?address=${ADDRESS}&value=1`,
      "unsupported-parameter",
    ],
    [
      "transfer to the token itself",
      `ethereum:${TOKEN}@${SEPOLIA}/transfer?address=${TOKEN}`,
      "recipient-is-token",
    ],
    [
      "transfer to bad recipient",
      `ethereum:${TOKEN}@${SEPOLIA}/transfer?address=${ADDRESS}ff`,
      "malformed",
    ],
    [
      "transfer to zero",
      `ethereum:${TOKEN}@${SEPOLIA}/transfer?address=0x${"0".repeat(40)}`,
      "zero-address",
    ],
    [
      "duplicate recipient",
      `ethereum:${TOKEN}@${SEPOLIA}/transfer?address=${ADDRESS}&address=${OTHER}`,
      "malformed-parameter",
    ],
    [
      "unknown native param",
      `ethereum:${ADDRESS}@${SEPOLIA}?data=0xdeadbeef`,
      "unsupported-parameter",
    ],
    ["negative value", `ethereum:${ADDRESS}@${SEPOLIA}?value=-1`, "malformed-parameter"],
    ["hex value", `ethereum:${ADDRESS}@${SEPOLIA}?value=0x10`, "malformed-parameter"],
    ["empty param", `ethereum:${ADDRESS}@${SEPOLIA}?value=`, "malformed-parameter"],
    ["dangling ampersand", `ethereum:${ADDRESS}@${SEPOLIA}?value=1&`, "malformed-parameter"],
  ])("rejects %s", (_label, payload, reason) => {
    expect(parseScanPayload(payload)).toEqual({ ok: false, reason });
  });
});

describe("beginScan / deliverScan", () => {
  const target = { recipient: ADDRESS, chainId: SEPOLIA, tokenContract: null };

  it("delivers the result to the registered opener exactly once", () => {
    const onResult = vi.fn();
    beginScan(onResult);
    deliverScan(target);
    deliverScan(target);
    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith(target);
  });

  it("delivers null on cancel", () => {
    const onResult = vi.fn();
    beginScan(onResult);
    deliverScan(null);
    expect(onResult).toHaveBeenCalledWith(null);
  });

  it("delivers to the session the scanner was opened for", () => {
    const onResult = vi.fn();
    beginScan(onResult);
    deliverScan(target, currentScanSession());
    expect(onResult).toHaveBeenCalledWith(target);
  });

  it("ignores a late cancel or result from a previous scanner session", () => {
    beginScan(vi.fn());
    const stale = currentScanSession();
    const onResult = vi.fn();
    beginScan(onResult);
    deliverScan(null, stale);
    deliverScan(target, stale);
    expect(onResult).not.toHaveBeenCalled();
    deliverScan(target, currentScanSession());
    expect(onResult).toHaveBeenCalledExactlyOnceWith(target);
  });

  it("makes a cancel after delivery a no-op", () => {
    const onResult = vi.fn();
    beginScan(onResult);
    const scanSession = currentScanSession();
    deliverScan(target, scanSession);
    deliverScan(null, scanSession);
    expect(onResult).toHaveBeenCalledExactlyOnceWith(target);
  });
});

describe("evaluateScan", () => {
  afterEach(() => deliverScan(null));

  it("carries chain and token fields through to the opener's check", () => {
    const check = vi.fn().mockReturnValue(null);
    beginScan(vi.fn(), check);
    const payload = `ethereum:${TOKEN}@${SEPOLIA}/transfer?address=${ADDRESS}&uint256=1`;
    expect(evaluateScan(payload)).toEqual({
      ok: true,
      recipient: ADDRESS,
      chainId: SEPOLIA,
      tokenContract: TOKEN,
    });
    expect(check).toHaveBeenCalledWith({
      recipient: ADDRESS,
      chainId: SEPOLIA,
      tokenContract: TOKEN,
    });
  });

  it("returns the opener's veto as a rejection", () => {
    beginScan(vi.fn(), () => "asset-mismatch");
    expect(evaluateScan(`ethereum:${ADDRESS}@${AMOY}`)).toEqual({
      ok: false,
      reason: "asset-mismatch",
    });
  });

  it("never consults the check for a payload the parser rejects", () => {
    const check = vi.fn().mockReturnValue(null);
    beginScan(vi.fn(), check);
    expect(evaluateScan(`ethereum:${ADDRESS}@1`)).toEqual({
      ok: false,
      reason: "unsupported-chain",
    });
    expect(check).not.toHaveBeenCalled();
  });

  it("drops the check once the scan is delivered", () => {
    const check = vi.fn().mockReturnValue("asset-mismatch");
    beginScan(vi.fn(), check);
    deliverScan(null);
    expect(evaluateScan(ADDRESS)).toMatchObject({ ok: true });
    expect(check).not.toHaveBeenCalled();
  });
});

describe("scanFeedback", () => {
  it.each([
    ["unsupported-chain", "unsupportedNetwork"],
    ["missing-chain", "missingNetwork"],
    ["bad-checksum", "checksum"],
    ["token-request", "tokenRequest"],
    ["asset-mismatch", "assetMismatch"],
    ["malformed", "unsupported"],
    ["too-long", "unsupported"],
    ["zero-address", "unsupported"],
    ["unsupported-function", "unsupported"],
    ["recipient-is-token", "unsupported"],
  ] as const)("maps %s to %s", (reason, key) => {
    expect(scanFeedback(reason)).toBe(key);
  });

  it("has an English string for every feedback key", () => {
    const keys = new Set(REJECT_REASONS.map(scanFeedback));
    for (const key of keys) expect(scanCopy.reject[key]).toMatch(/\S/);
  });

  it("never interpolates scanned content into feedback copy", () => {
    for (const text of Object.values(scanCopy.reject)) expect(text).not.toMatch(/\{\{/);
  });
});
