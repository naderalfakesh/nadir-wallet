import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as LocalAuthentication from "expo-local-authentication";
import { Screen, Brandmark, AppText, Button, Icon } from "@/components";
import { useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { t as translate } from "@/i18n";
import { useApp } from "@/providers/AppProvider";
import { PasscodeUnlock } from "@/features/auth/PasscodeUnlock";
import { BiometricBadge } from "@/features/auth/BiometricBadge";
import { usePulse } from "@/features/auth/usePulse";

type BioStatus = "idle" | "authenticating" | "failed" | "cancelled" | "unavailable";

export function LockScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { prefs, verifyPasscode, lockout, recordUnlockFailure, clearLockout, logEvent, unlockSession } = useApp();

  const [mode, setMode] = useState<"bio" | "passcode">(prefs.biometricEnabled ? "bio" : "passcode");
  const [available, setAvailable] = useState(false);
  const [status, setStatus] = useState<BioStatus>("idle");
  const started = useRef(false);
  const pulse = usePulse(status === "authenticating");

  const unlock = useCallback(
    (methodLabel: string) => {
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
    } else if (res.error === "user_cancel" || res.error === "app_cancel" || res.error === "system_cancel") {
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
        ok = (await LocalAuthentication.hasHardwareAsync()) && (await LocalAuthentication.isEnrolledAsync());
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
      <View style={{ flex: 1, alignItems: "center", paddingTop: insets.top + 72 }}>
        <Brandmark size={58} />
        <AppText weight="bold" size={22} style={{ marginTop: 18, letterSpacing: -0.4 }}>
          {t("common.appName")}
        </AppText>
        <AppText size={14} muted style={{ marginTop: 6 }}>
          {t("lock.welcomeBack")}
        </AppText>

        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <BiometricBadge pulse={pulse} active={status === "authenticating"} />
          <AppText weight="bold" size={21} style={{ marginTop: 26 }}>
            {t("lock.locked")}
          </AppText>
          <AppText
            size={14}
            color={status === "failed" || status === "cancelled" ? theme.colors.warn : theme.colors.textMuted}
            style={{ marginTop: 6, textAlign: "center", maxWidth: 280, lineHeight: 20 }}
          >
            {subtitle}
          </AppText>
          {status !== "authenticating" && (
            <Button
              label={t("lock.useBiometric")}
              icon="faceid"
              variant="soft"
              onPress={authenticate}
              height={48}
              style={{ marginTop: 26, paddingHorizontal: 26 }}
            />
          )}
        </View>

        <Pressable
          onPress={() => setMode("passcode")}
          style={{
            paddingBottom: insets.bottom + 24,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Icon name="lock" size={17} color={theme.colors.textMuted} />
          <AppText size={14} muted>
            {t("lock.usePasscode")}
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}
