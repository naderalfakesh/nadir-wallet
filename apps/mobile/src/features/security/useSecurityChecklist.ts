import { useCallback, useMemo } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "@/i18n/useTranslation";
import { useApp } from "@/providers/AppProvider";
import { AUTO_LOCK_OPTIONS } from "./security.constants";
import { getSecurityTier } from "./security.utils";
import type { ChecklistItem } from "./security.types";

export function useSecurityChecklist() {
  const { t } = useTranslation();
  const router = useRouter();
  const { prefs, setPref, logEvent } = useApp();

  const toggleBiometric = useCallback(() => {
    const next = !prefs.biometricEnabled;
    setPref("biometricEnabled", next);
    logEvent(next ? "biometric_on" : "biometric_off");
  }, [prefs.biometricEnabled, setPref, logEvent]);

  const cycleAutoLock = useCallback(() => {
    const idx = AUTO_LOCK_OPTIONS.indexOf(prefs.autoLockMinutes);
    const next = AUTO_LOCK_OPTIONS[(idx + 1) % AUTO_LOCK_OPTIONS.length];
    setPref("autoLockMinutes", next);
    logEvent("autolock", { detailVars: { min: next } });
  }, [prefs.autoLockMinutes, setPref, logEvent]);

  const items: ChecklistItem[] = useMemo(
    () => [
      {
        key: "backup",
        label: t("security.protection.backup"),
        done: prefs.backupConfirmed,
        sub: prefs.backupConfirmed ? t("security.protection.backupDone") : t("security.protection.backupTodo"),
        onPress: () => router.push("/backup"),
      },
      { key: "bio", label: t("security.protection.biometric"), done: prefs.biometricEnabled, sub: t("security.protection.biometricSub"), toggle: toggleBiometric },
      { key: "pin", label: t("security.protection.pin"), done: true, sub: t("security.protection.pinSub") },
      { key: "autolock", label: t("security.protection.autolock"), done: true, sub: t("security.protection.autolockSub", { min: prefs.autoLockMinutes }), onPress: cycleAutoLock },
      { key: "signing", label: t("security.protection.signing"), done: true, sub: t("security.protection.signingSub") },
    ],
    [t, router, prefs.backupConfirmed, prefs.biometricEnabled, prefs.autoLockMinutes, toggleBiometric, cycleAutoLock],
  );

  const score = items.filter((i) => i.done).length;
  const total = items.length;
  const pct = score / total;
  const tier = getSecurityTier(pct);

  return { items, score, total, pct, tier };
}
