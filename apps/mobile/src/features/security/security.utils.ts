import type { SecurityTier } from "./security.types";

export function getSecurityTier(pct: number): SecurityTier {
  if (pct >= 1) return "excellent";
  if (pct >= 0.7) return "actionNeeded";
  return "atRisk";
}
