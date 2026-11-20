import type { SecurityTier } from "./security.types";

export function getSecurityTier(pct: number): SecurityTier {
  if (pct >= 1) return "excellent";
  if (pct >= 0.6) return "actionNeeded";
  return "atRisk";
}
