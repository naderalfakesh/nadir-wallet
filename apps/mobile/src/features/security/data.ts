import { t } from "@/i18n";
import type { SecurityEvent } from "@/types/status";
import { makeSecurityEvent } from "./events";

export interface SecurityState {
  backedUp: boolean;
  biometricOn: boolean;
  autoLockMin: number;
  pinOn: boolean;
  txSigning: boolean;
  deviceSecure: boolean;
  txProtection: boolean;
}

export const DEFAULT_SECURITY: SecurityState = {
  backedUp: false,
  biometricOn: true,
  autoLockMin: 1,
  pinOn: true,
  txSigning: true,
  deviceSecure: true,
  txProtection: true,
};

export const DEVICE_CHECK_KEYS = [
  "screenLock",
  "notRooted",
  "latestVersion",
  "secureEnclave",
] as const;

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Demo history for a fresh install, dated in the recent past relative to `now`. */
export function demoSecurityEvents(now: Date): SecurityEvent[] {
  const ago = (ms: number) => new Date(now.getTime() - ms);
  return [
    makeSecurityEvent("demo-1", "unlock", ago(18 * MINUTE), {
      detail: t("security.log.unlockBiometric"),
    }),
    makeSecurityEvent("demo-2", "risk_block", ago(34 * MINUTE)),
    makeSecurityEvent("demo-3", "sim_fail", ago(DAY + 2 * HOUR)),
    makeSecurityEvent("demo-4", "risk_check", ago(DAY + 2 * HOUR + 2 * MINUTE), {
      detail: "demo.eth — low risk",
    }),
    makeSecurityEvent("demo-5", "backup", ago(3 * DAY + 5 * HOUR)),
    makeSecurityEvent("demo-6", "autolock", ago(4 * DAY + 9 * HOUR), { detailVars: { min: 1 } }),
  ];
}

// The old fixed-label demo entries ("Today · 2:14 PM" whatever the time).
const LEGACY_DEMO_IDS = new Set(["e1", "e2", "e3", "e4", "e5", "e6"]);

/**
 * The log to start with: stored events minus the old fixed-label demo entries,
 * or fresh demo history when nothing real is left.
 */
export function initialSecurityEvents(stored: SecurityEvent[], now: Date): SecurityEvent[] {
  const real = stored.filter((event) => !(LEGACY_DEMO_IDS.has(event.id) && event.at === undefined));
  return real.length ? real : demoSecurityEvents(now);
}
