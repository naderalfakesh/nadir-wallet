import type { ScanTarget } from "@/features/scan/scanBridge";

/**
 * One-shot hand-off of a target scanned outside Send (the Home scan button).
 * Kept in memory instead of route params so a deep link can't prefill a recipient.
 */
let pending: ScanTarget | null = null;

export function handOffScanToSend(target: ScanTarget): void {
  pending = target;
}

/** Returns the pending target once, then clears it. */
export function takeScanHandoff(): ScanTarget | null {
  const target = pending;
  pending = null;
  return target;
}

/** Drops a pending target; called whenever the session locks or the wallet resets. */
export function clearScanHandoff(): void {
  pending = null;
}
