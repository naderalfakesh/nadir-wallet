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
};

function formatWhen(at: Date): string {
  let h = at.getHours();
  const m = at.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${t("security.log.today")} · ${h}:${String(m).padStart(2, "0")} ${ampm}`;
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
    when: formatWhen(at),
  };
}
