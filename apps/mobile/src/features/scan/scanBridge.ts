import {
  type ScanParseResult,
  type ScanRejectReason,
  type ScanTarget,
  parseScanPayload,
} from "./scanPayload";

/**
 * A tiny one-shot channel so the full-screen scanner can hand a result back to
 * whoever opened it. The opener (e.g. the send screen) stays mounted beneath
 * the pushed `/scan` route, registers a resolver, and the scanner delivers to
 * it on success or cancel. Single-scanner app → a module singleton is enough.
 */

type ScanResolver = (value: ScanTarget | null) => void;
/** Lets the opener veto a well-formed target that doesn't fit what it is doing. */
export type ScanTargetCheck = (target: ScanTarget) => ScanRejectReason | null;

let resolver: ScanResolver | null = null;
let targetCheck: ScanTargetCheck | null = null;
let session = 0;

export function beginScan(onResult: ScanResolver, check?: ScanTargetCheck): void {
  session += 1;
  resolver = onResult;
  targetCheck = check ?? null;
}

/** The scan a scanner screen serves; capture it on mount and pass it to {@link deliverScan}. */
export function currentScanSession(): number {
  return session;
}

/**
 * Hands the result to the opener once. A stale `forSession` is ignored so a
 * scanner unmounting late can't resolve or cancel a newer scan.
 */
export function deliverScan(value: ScanTarget | null, forSession: number = session): void {
  if (forSession !== session) return;
  const r = resolver;
  resolver = null;
  targetCheck = null;
  r?.(value);
}

/** Parses a payload and applies the active opener's check, if any. */
export function evaluateScan(raw: string): ScanParseResult {
  const result = parseScanPayload(raw);
  if (!result.ok) return result;
  const { recipient, chainId, tokenContract } = result;
  const target: ScanTarget = { recipient, chainId, tokenContract };
  const rejected = targetCheck?.(target) ?? null;
  return rejected ? { ok: false, reason: rejected } : { ok: true, ...target };
}
