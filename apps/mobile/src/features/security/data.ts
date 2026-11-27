import { t } from "@/i18n";
import type { SecurityEvent } from "@/types/status";
import { TIME_MS } from "@/utils/date";
import { makeSecurityEvent } from "./events";

/** Demo history for a fresh install, dated in the recent past relative to `now`. */
export function demoSecurityEvents(now: Date): SecurityEvent[] {
  const ago = (ms: number) => new Date(now.getTime() - ms);
  return [
    makeSecurityEvent("demo-1", "unlock", ago(18 * TIME_MS.minute), {
      detail: t("security.log.unlockBiometric"),
    }),
    makeSecurityEvent("demo-2", "risk_block", ago(34 * TIME_MS.minute)),
    makeSecurityEvent("demo-3", "sim_fail", ago(TIME_MS.day + 2 * TIME_MS.hour)),
    makeSecurityEvent(
      "demo-4",
      "risk_check",
      ago(TIME_MS.day + 2 * TIME_MS.hour + 2 * TIME_MS.minute),
      { detail: "demo.eth — low risk" },
    ),
    makeSecurityEvent("demo-6", "autolock", ago(4 * TIME_MS.day + 9 * TIME_MS.hour), {
      detailVars: { min: 1 },
    }),
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
