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

/** Pulls the first EVM address out of a scanned string (raw or an EIP-681 URI). */
export function extractEvmAddress(raw: string): string | null {
  const match = raw.match(/0x[0-9a-fA-F]{40}/);
  return match ? match[0] : null;
}
