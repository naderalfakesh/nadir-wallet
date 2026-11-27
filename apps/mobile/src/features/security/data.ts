import { t } from "@/i18n";
import type { SecurityEvent } from "@/types/status";
import { TIME_MS } from "@/utils/date";
import { makeSecurityEvent } from "./events";

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

// Legacy fixed-label demo IDs from older builds (stored without `at`).
const LEGACY_DEMO_IDS = new Set(["e1", "e2", "e3", "e4", "e5", "e6"]);

export function initialSecurityEvents(stored: SecurityEvent[], now: Date): SecurityEvent[] {
  const real = stored.filter((event) => !(LEGACY_DEMO_IDS.has(event.id) && event.at === undefined));
  return real.length ? real : demoSecurityEvents(now);
}
