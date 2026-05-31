import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as LocalAuthentication from "expo-local-authentication";
import { Screen, Brandmark, AppText, Button, Icon } from "@/components";
import { useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { t as translate } from "@/i18n";
import { useApp } from "@/providers/AppProvider";
import { PasscodeUnlock } from "@/features/auth/PasscodeUnlock";

type BioStatus = "idle" | "authenticating" | "failed" | "cancelled" | "unavailable";

export function LockScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { prefs, passcode, logEvent } = useApp();

  const [mode, setMode] = useState<"bio" | "passcode">(prefs.biometricEnabled ? "bio" : "passcode");
  const [available, setAvailable] = useState(false);
  const [status, setStatus] = useState<BioStatus>("idle");
  const [pulse] = useState(() => new Animated.Value(0.9));
  const started = useRef(false);

  const unlock = useCallback(
    (methodLabel: string) => {
      logEvent("unlock", { detail: methodLabel });
      router.replace("/home");
    },
    [logEvent, router],
  );

  const authenticate = useCallback(async () => {
    setStatus("authenticating");
    const res = await LocalAuthentication.authenticateAsync({
      promptMessage: translate("lock.unlockFaceId"),
      disableDeviceFallback: false,
    });
    if (res.success) {
      unlock(translate("security.log.unlockFaceId"));
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
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const ok = hasHardware && enrolled;
      setAvailable(ok);
      if (prefs.biometricEnabled && ok) {
        authenticate();
      } else if (prefs.biometricEnabled && !ok) {
        setStatus("unavailable");
        setMode("passcode");
      }
    })();
  }, [prefs.biometricEnabled, authenticate]);

  useEffect(() => {
    if (status !== "authenticating") return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.3, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.9, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [status, pulse]);

  if (mode === "passcode") {
    return (
      <Screen>
        <PasscodeUnlock
          correct={passcode}
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
            : t("lock.unlockFaceId");

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
          <View style={{ width: 96, height: 96, alignItems: "center", justifyContent: "center" }}>
            {status === "authenticating" && (
              <Animated.View
                style={{
                  position: "absolute",
                  width: 96,
                  height: 96,
                  borderRadius: 48,
                  backgroundColor: theme.colors.accent,
                  opacity: 0.18,
                  transform: [{ scale: pulse }],
                }}
              />
            )}
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 30,
                backgroundColor: theme.colors.accentDim,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="faceid" size={50} stroke={1.8} color={theme.colors.accent} />
            </View>
          </View>
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
              label={t("lock.useFaceId")}
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
