import { describe, expect, it } from "vitest";
import scanCopy from "@/i18n/locales/en/scan.json";
import { scanFeedback } from "./scanFeedback";
import type { ScanRejectReason } from "./scanPayload";

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
