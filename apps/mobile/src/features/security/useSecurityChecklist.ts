import { useCallback, useMemo } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "@/i18n/useTranslation";
import { useApp } from "@/providers/AppProvider";
import { biometryIcon } from "@/services/auth/biometry";
import { AUTO_LOCK_OPTIONS } from "./security.constants";
import type { SecurityRowModel } from "./security.types";
import { formatVerifiedDate, getSecurityScore, getSecurityTier } from "./security.utils";

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

  const protectionRows: SecurityRowModel[] = useMemo(() => {
    const verified = prefs.identityVerifiedAt > 0;
    return [
      {
        key: "backup",
        icon: "backup",
        tone: prefs.backupConfirmed ? "pos" : "warn",
        label: t("security.protection.backup"),
        sub: prefs.backupConfirmed
          ? t("security.protection.backupDone")
          : t("security.protection.backupTodo"),
        onPress: () => router.push("/backup"),
      },
      {
        key: "identity",
        icon: "faceid",
        tone: verified ? "pos" : "warn",
        label: t("security.protection.identity"),
        sub: verified
          ? t("security.protection.identityDone", {
              date: formatVerifiedDate(prefs.identityVerifiedAt),
            })
          : t("security.protection.identityTodo"),
        onPress: () => router.push("/liveness"),
      },
      {
        key: "biometric",
        icon: biometryIcon(),
        tone: prefs.biometricEnabled ? "pos" : "warn",
        label: t("security.protection.biometric"),
        sub: t("security.protection.biometricSub"),
        toggle: { on: prefs.biometricEnabled, onChange: toggleBiometric },
      },
      {
        key: "autolock",
        icon: "clock",
        tone: "neutral",
        label: t("security.protection.autolock"),
        sub: t("security.protection.autolockSub", { min: prefs.autoLockMinutes }),
        onPress: cycleAutoLock,
      },
      {
        key: "passcode",
        icon: "lock",
        tone: "neutral",
        label: t("security.protection.changePasscode"),
        sub: "",
        onPress: () => router.push("/change-passcode"),
      },
    ];
  }, [
    t,
    router,
    prefs.backupConfirmed,
    prefs.identityVerifiedAt,
    prefs.biometricEnabled,
    prefs.autoLockMinutes,
    toggleBiometric,
    cycleAutoLock,
  ]);

  const transactionRows: SecurityRowModel[] = useMemo(
    () => [
      {
        key: "txProtection",
        icon: "radar",
        tone: prefs.txProtection ? "pos" : "warn",
        label: t("security.transactions.protection"),
        sub: t("security.transactions.protectionSub"),
        toggle: {
          on: prefs.txProtection,
          onChange: () => setPref("txProtection", !prefs.txProtection),
        },
      },
      {
        key: "faceSend",
        icon: "faceid",
        tone: "accent",
        label: t("security.transactions.faceSend"),
        sub: t("security.transactions.faceSendSub"),
        toggle: {
          on: prefs.requireLivenessSend,
          onChange: () => setPref("requireLivenessSend", !prefs.requireLivenessSend),
        },
      },
      {
        key: "faceReveal",
        icon: "faceid",
        tone: "accent",
        label: t("security.transactions.faceReveal"),
        sub: t("security.transactions.faceRevealSub"),
        toggle: {
          on: prefs.requireLivenessReveal,
          onChange: () => setPref("requireLivenessReveal", !prefs.requireLivenessReveal),
        },
      },
    ],
    [t, setPref, prefs.txProtection, prefs.requireLivenessSend, prefs.requireLivenessReveal],
  );

  const { score, total } = getSecurityScore(prefs);
  const pct = score / total;
  const tier = getSecurityTier(pct);

  return { protectionRows, transactionRows, score, total, pct, tier };
}
