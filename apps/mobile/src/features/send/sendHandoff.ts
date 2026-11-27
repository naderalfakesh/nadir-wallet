import type { ScanTarget } from "@/features/scan/scanPayload";

// Kept in memory rather than route params so external deep links cannot prefill a recipient.
let pending: ScanTarget | null = null;

export function handOffScanToSend(target: ScanTarget): void {
  pending = target;
}

export function takeScanHandoff(): ScanTarget | null {
  const target = pending;
  pending = null;
  return target;
}

export function clearScanHandoff(): void {
  pending = null;
}
