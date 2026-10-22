import { t } from "@/i18n";
import type { SecurityEvent, SecurityEventSeverity, SecurityEventType } from "@/types/status";

const META: Record<SecurityEventType, { sev: SecurityEventSeverity; titleKey: string; detailKey?: string }> = {
  created: { sev: "success", titleKey: "security.log.createdTitle", detailKey: "security.log.createdDetail" },
  imported: { sev: "success", titleKey: "security.log.importedTitle", detailKey: "security.log.importedDetail" },
  unlock: { sev: "info", titleKey: "security.log.unlockTitle" },
  backup: { sev: "success", titleKey: "security.log.backupTitle", detailKey: "security.log.backupDetail" },
  biometric_on: { sev: "success", titleKey: "security.log.biometricOnTitle", detailKey: "security.log.biometricOnDetail" },
  biometric_off: { sev: "warning", titleKey: "security.log.biometricOffTitle", detailKey: "security.log.biometricOffDetail" },
  risk_check: { sev: "success", titleKey: "security.log.riskCheckTitle" },
  risk_block: { sev: "critical", titleKey: "security.log.riskBlockTitle", detailKey: "security.log.riskBlockDetail" },
  sim_fail: { sev: "warning", titleKey: "security.log.simFailTitle", detailKey: "security.log.simFailDetail" },
  autolock: { sev: "info", titleKey: "security.log.autolockTitle", detailKey: "security.log.autolockDetail" },
  autolock_triggered: { sev: "info", titleKey: "security.log.autolockTriggeredTitle", detailKey: "security.log.autolockTriggeredDetail" },
  device_check: { sev: "info", titleKey: "security.log.unlockTitle" },
  passcode_changed: { sev: "success", titleKey: "security.log.passcodeChangedTitle", detailKey: "security.log.passcodeChangedDetail" },
  liveness_pass: { sev: "success", titleKey: "security.log.livenessPassTitle", detailKey: "security.log.livenessPassDetail" },
  liveness_fail: { sev: "warning", titleKey: "security.log.livenessFailTitle", detailKey: "security.log.livenessFailDetail" },
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** "Today · 2:14 PM", "Yesterday · 6:30 PM" or "May 28 · 4:00 PM", relative to `now`. */
export function formatEventWhen(at: Date, now: Date): string {
  let h = at.getHours();
  const m = at.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const time = `${h}:${String(m).padStart(2, "0")} ${ampm}`;
  const days = Math.round((startOfDay(now) - startOfDay(at)) / 86_400_000);
  const day =
    days === 0
      ? t("security.log.today")
      : days === 1
        ? t("security.log.yesterday")
        : `${MONTHS[at.getMonth()]} ${at.getDate()}`;
  return `${day} · ${time}`;
}

/** The label to show for an event now. */
export function eventWhen(event: SecurityEvent, now: Date): string {
  return event.at === undefined ? event.when : formatEventWhen(new Date(event.at), now);
}

export function makeSecurityEvent(
  id: string,
  type: SecurityEventType,
  at: Date,
  opts?: { detail?: string; detailVars?: Record<string, string | number> },
): SecurityEvent {
  const meta = META[type];
  const detail =
    opts?.detail ?? (meta.detailKey ? t(meta.detailKey, opts?.detailVars) : "");
  return {
    id,
    type,
    severity: meta.sev,
    title: t(meta.titleKey),
    detail,
    when: formatEventWhen(at, at),
    at: at.getTime(),
  };
}
