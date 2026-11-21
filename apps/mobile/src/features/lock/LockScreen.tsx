import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { Screen, Brandmark, AppText, Button, Icon } from "@/components";
import { BiometricBadge } from "@/features/auth/components/BiometricBadge";
import { PasscodeUnlock } from "@/features/auth/components/PasscodeUnlock";
import { usePulse } from "@/features/auth/usePulse";
import { t as translate } from "@/i18n";
import { useTranslation } from "@/i18n/useTranslation";
import { useApp } from "@/providers/AppProvider";
import { biometryIcon } from "@/services/auth/biometry";
import { haptics } from "@/services/device/haptics";
import { useTheme } from "@/theme";

type BioStatus = "idle" | "authenticating" | "failed" | "cancelled" | "unavailable";

export function LockScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const {
    prefs,
    verifyPasscode,
    lockout,
    recordUnlockFailure,
    clearLockout,
    logEvent,
    unlockSession,
  } = useApp();

  const [mode, setMode] = useState<"bio" | "passcode">(prefs.biometricEnabled ? "bio" : "passcode");
  const [available, setAvailable] = useState(false);
  const [status, setStatus] = useState<BioStatus>("idle");
  const started = useRef(false);
  const pulse = usePulse(status === "authenticating");

  const unlock = useCallback(
    (methodLabel: string) => {
      haptics.success();
      clearLockout();
      logEvent("unlock", { detail: methodLabel });
      // Opening the wallet group removes this screen; index then routes to home.
      unlockSession();
    },
    [clearLockout, logEvent, unlockSession],
  );

  const authenticate = useCallback(async () => {
    setStatus("authenticating");
    let res: LocalAuthentication.LocalAuthenticationResult;
    try {
      res = await LocalAuthentication.authenticateAsync({
        promptMessage: translate("lock.unlockBiometric"),
        disableDeviceFallback: false,
      });
    } catch {
      setStatus("failed");
      return;
    }
    if (res.success) {
      unlock(translate("security.log.unlockBiometric"));
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

  // Probe hardware once, then auto-prompt or fall back to passcode.
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      let ok = false;
      try {
        ok =
          (await LocalAuthentication.hasHardwareAsync()) &&
          (await LocalAuthentication.isEnrolledAsync());
      } catch {
        // Treated as no biometrics: the passcode path still guards the wallet.
      }
      setAvailable(ok);
      if (prefs.biometricEnabled && ok) {
        authenticate();
      } else if (prefs.biometricEnabled && !ok) {
        setStatus("unavailable");
        setMode("passcode");
      }
    })();
  }, [prefs.biometricEnabled, authenticate]);

  if (mode === "passcode") {
    return (
      <Screen>
        <PasscodeUnlock
          verify={verifyPasscode}
          lockout={lockout}
          onFailure={recordUnlockFailure}
          onUnlock={() => unlock(translate("security.log.unlockPasscode"))}
          onUseBiometric={() => {
            setMode("bio");
            setStatus("idle");
            authenticate();
          }}
          biometricAvailable={available && prefs.biometricEnabled}
        />
      </Screen>
    );
  }

  const subtitle =
    status === "authenticating"
      ? t("lock.authenticating")
      : status === "failed"
        ? t("lock.biometricFailed")
        : status === "cancelled"
          ? t("lock.biometricCancelled")
          : status === "unavailable"
            ? t("lock.biometricUnavailable")
            : t("lock.unlockBiometric");

  return (
    <Screen>
      <View style={styles.root}>
        <Brandmark size={58} />
        <AppText weight="bold" size={22} style={styles.appName}>
          {t("common.appName")}
        </AppText>
        <AppText size={14} muted style={styles.welcome}>
          {t("lock.welcomeBack")}
        </AppText>

        <View style={styles.center}>
          <BiometricBadge pulse={pulse} active={status === "authenticating"} />
          <AppText weight="bold" size={21} style={styles.lockedTitle}>
            {t("lock.locked")}
          </AppText>
          <AppText
            size={14}
            color={
              status === "failed" || status === "cancelled"
                ? theme.colors.warn
                : theme.colors.textMuted
            }
            style={styles.subtitle}
          >
            {subtitle}
          </AppText>
          {status !== "authenticating" && (
            <Button
              label={t("lock.useBiometric")}
              icon={biometryIcon()}
              variant="soft"
              onPress={authenticate}
              height={48}
              style={styles.bioButton}
            />
          )}
        </View>

        <Pressable onPress={() => setMode("passcode")} style={styles.passcodeLink}>
          <Icon name="lock" size={17} color={theme.colors.textMuted} />
          <AppText size={14} muted>
            {t("lock.usePasscode")}
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", paddingTop: 72 },
  appName: { marginTop: 18, letterSpacing: -0.4 },
  welcome: { marginTop: 6 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  lockedTitle: { marginTop: 26 },
  subtitle: { marginTop: 6, textAlign: "center", maxWidth: 280, lineHeight: 20 },
  bioButton: { marginTop: 26, paddingHorizontal: 26 },
  passcodeLink: {
    paddingBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
