import {
  type ScanParseResult,
  type ScanRejectReason,
  type ScanTarget,
  parseScanPayload,
} from "./scanPayload";

type ScanResolver = (value: ScanTarget | null) => void;
export type ScanTargetCheck = (target: ScanTarget) => ScanRejectReason | null;

let resolver: ScanResolver | null = null;
let targetCheck: ScanTargetCheck | null = null;
let session = 0;

export function beginScan(onResult: ScanResolver, check?: ScanTargetCheck): void {
  session += 1;
  resolver = onResult;
  targetCheck = check ?? null;
}

export function currentScanSession(): number {
  return session;
}

export function deliverScan(value: ScanTarget | null, forSession: number = session): void {
  // Ignore stale sessions so a late unmount cannot resolve or cancel a newer scan.
  if (forSession !== session) return;
  const r = resolver;
  resolver = null;
  targetCheck = null;
  r?.(value);
}

export function evaluateScan(raw: string): ScanParseResult {
  const result = parseScanPayload(raw);
  if (!result.ok) return result;
  const { recipient, chainId, tokenContract } = result;
  const target: ScanTarget = { recipient, chainId, tokenContract };
  const rejected = targetCheck?.(target) ?? null;
  return rejected ? { ok: false, reason: rejected } : { ok: true, ...target };
}
