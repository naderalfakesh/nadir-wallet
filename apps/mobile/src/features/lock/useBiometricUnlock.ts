import { useCallback, useEffect, useRef, useState } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import { t } from "@/i18n";
import { useApp } from "@/providers/AppProvider";
import { haptics } from "@/services/device/haptics";

export type BioStatus = "idle" | "authenticating" | "failed" | "cancelled" | "unavailable";

export function useBiometricUnlock() {
  const { prefs, clearLockout, logEvent, unlockSession } = useApp();

  const [mode, setMode] = useState<"bio" | "passcode">(prefs.biometricEnabled ? "bio" : "passcode");
  const [available, setAvailable] = useState(false);
  const [status, setStatus] = useState<BioStatus>("idle");
  const started = useRef(false);

  const unlock = useCallback(
    (methodLabel: string) => {
      haptics.success();
      clearLockout();
      logEvent("unlock", { detail: methodLabel });
      unlockSession();
    },
    [clearLockout, logEvent, unlockSession],
  );

  const authenticate = useCallback(async () => {
    setStatus("authenticating");
    let res: LocalAuthentication.LocalAuthenticationResult;
    try {
      res = await LocalAuthentication.authenticateAsync({
        promptMessage: t("lock.unlockBiometric"),
        disableDeviceFallback: false,
      });
    } catch {
      setStatus("failed");
      return;
    }
    if (res.success) {
      unlock(t("security.log.unlockBiometric"));
    } else if (
      res.error === "user_cancel" ||
      res.error === "app_cancel" ||
      res.error === "system_cancel"
    ) {
      setStatus("cancelled");
    } else {
      setStatus("failed");
    }
  }, [unlock]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      let ok = false;
      try {
        ok =
          (await LocalAuthentication.hasHardwareAsync()) &&
          (await LocalAuthentication.isEnrolledAsync());
      } catch {}
      setAvailable(ok);
      if (prefs.biometricEnabled && ok) {
        authenticate();
      } else if (prefs.biometricEnabled && !ok) {
        setStatus("unavailable");
        setMode("passcode");
      }
    })();
  }, [prefs.biometricEnabled, authenticate]);

  return { mode, setMode, available, status, setStatus, authenticate, unlock };
}
