import { formatShortDate } from "@/utils/date";
import type { SecurityTier } from "./security.types";

export function getSecurityTier(pct: number): SecurityTier {
  if (pct >= 1) return "excellent";
  if (pct >= 0.6) return "actionNeeded";
  return "atRisk";
}

export interface SecurityScoreInput {
  backupConfirmed: boolean;
  identityVerifiedAt: number;
  biometricEnabled: boolean;
  txProtection: boolean;
}

export function getSecurityScore(prefs: SecurityScoreInput): { score: number; total: number } {
  const done = [
    prefs.backupConfirmed,
    prefs.identityVerifiedAt > 0,
    prefs.biometricEnabled,
    prefs.txProtection,
  ];
  return { score: done.filter(Boolean).length, total: done.length };
}

export function formatVerifiedDate(at: number): string {
  return formatShortDate(new Date(at));
}

export function latestEvents<T>(events: T[], limit = 5): T[] {
  return events.slice(0, limit);
}
