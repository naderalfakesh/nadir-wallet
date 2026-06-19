// One-shot token so a route can enforce a liveness gate on *itself*, instead of
// trusting every caller to route through /liveness first. The liveness flow
// grants a short-lived pass for a target route on success; the target route
// consumes it once on mount. No valid token → the route bounces to /liveness.
//
// This keeps the gate airtight: any entry point that pushes the protected route
// (Security Center, Settings, a deep link) is gated the same way.

const TTL_MS = 30_000;

let grantedFor = "";
let grantedAt = 0;

/** Called by the liveness flow on a successful pass, just before navigating. */
export function grantLiveness(target: string): void {
  grantedFor = target;
  grantedAt = Date.now();
}

/** Non-clearing check — true when a fresh pass for this target exists. */
export function peekLiveness(target: string): boolean {
  return grantedFor === target && Date.now() - grantedAt < TTL_MS;
}

/**
 * Called once by the protected route on mount. Returns true (and clears the
 * token) when a fresh pass for this exact target exists.
 */
export function consumeLiveness(target: string): boolean {
  const ok = grantedFor === target && Date.now() - grantedAt < TTL_MS;
  grantedFor = "";
  grantedAt = 0;
  return ok;
}
