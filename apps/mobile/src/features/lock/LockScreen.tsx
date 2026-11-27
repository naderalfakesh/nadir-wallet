import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Screen, Brandmark, AppText, Button, Icon } from "@/components";
import { BiometricBadge } from "@/features/auth/components/BiometricBadge";
import { PasscodeUnlock } from "@/features/auth/components/PasscodeUnlock";
import { usePulse } from "@/features/auth/usePulse";
import { useTranslation } from "@/i18n/useTranslation";
import { useApp } from "@/providers/AppProvider";
import { biometryIcon } from "@/services/auth/biometry";
import { useTheme } from "@/theme";
import { useBiometricUnlock } from "./useBiometricUnlock";

export function LockScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { prefs, verifyPasscode, lockout, recordUnlockFailure } = useApp();

  const { mode, setMode, available, status, setStatus, authenticate, unlock } =
    useBiometricUnlock();
  const pulse = usePulse(status === "authenticating");

  if (mode === "passcode") {
    return (
      <Screen>
        <PasscodeUnlock
          verify={verifyPasscode}
          lockout={lockout}
          onFailure={recordUnlockFailure}
          onUnlock={() => unlock(t("security.log.unlockPasscode"))}
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

        <Pressable
          accessibilityRole="button"
          onPress={() => setMode("passcode")}
          style={styles.passcodeLink}
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
