// In-memory one-shot pass so protected routes enforce liveness regardless of entry point.
const TTL_MS = 30_000;

const GATED_TARGETS = ["/reveal"] as const;
export type LivenessTarget = (typeof GATED_TARGETS)[number];

export function parseLivenessTarget(next: unknown): LivenessTarget | null {
  return GATED_TARGETS.find((target) => target === next) ?? null;
}

let grantedFor = "";
let grantedAt = 0;

export function grantLiveness(target: string): void {
  grantedFor = target;
  grantedAt = Date.now();
}

export function peekLiveness(target: string): boolean {
  return grantedFor === target && Date.now() - grantedAt < TTL_MS;
}

export function consumeLiveness(target: string): boolean {
  const ok = grantedFor === target && Date.now() - grantedAt < TTL_MS;
  grantedFor = "";
  grantedAt = 0;
  return ok;
}
