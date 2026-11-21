import type { ScanRejectReason } from "./scanPayload";

export type ScanFeedback =
  | "unsupported"
  | "checksum"
  | "unsupportedNetwork"
  | "missingNetwork"
  | "tokenRequest"
  | "assetMismatch";

/**
 * Collapses reject reasons into the few messages a user can act on. Scanned
 * content is never echoed back: a QR may hold a private key or phrase.
 */
export function scanFeedback(reason: ScanRejectReason): ScanFeedback {
  switch (reason) {
    case "bad-checksum":
      return "checksum";
    case "unsupported-chain":
      return "unsupportedNetwork";
    case "missing-chain":
      return "missingNetwork";
    case "token-request":
      return "tokenRequest";
    case "asset-mismatch":
      return "assetMismatch";
    default:
      return "unsupported";
  }
}
