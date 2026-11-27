import type { ScanRejectReason } from "./scanPayload";

export type ScanFeedback =
  | "unsupported"
  | "checksum"
  | "unsupportedNetwork"
  | "missingNetwork"
  | "tokenRequest"
  | "assetMismatch";

// Never echo raw scanned text back to the UI: a QR code may contain a private key or seed phrase.
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
