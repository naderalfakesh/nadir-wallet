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

/** Counts only protections the user can change; nothing here is always on. */
export function getSecurityScore(prefs: SecurityScoreInput): { score: number; total: number } {
  const done = [
    prefs.backupConfirmed,
    prefs.identityVerifiedAt > 0,
    prefs.biometricEnabled,
    prefs.txProtection,
  ];
  return { score: done.filter(Boolean).length, total: done.length };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Nov 22, 2026" */
export function formatVerifiedDate(at: number): string {
  const date = new Date(at);
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/** The newest events first; the log is stored newest-first, so this is a cap. */
export function latestEvents<T>(events: T[], limit = 5): T[] {
  return events.slice(0, limit);
}
