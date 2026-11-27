import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { AppText, Icon } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { biometryIcon } from "@/services/auth/biometry";
import { attemptsLeft, lockRemainingMs, type LockoutState } from "@/services/auth/lockout";
import { useTheme, useThemedStyles, type Theme } from "@/theme";
import { PinDots } from "./PinDots";
import { PinKeypad } from "./PinKeypad";
import { usePinEntry } from "../usePinEntry";

interface PasscodeUnlockProps {
  verify: (pin: string) => Promise<boolean>;
  lockout: LockoutState;
  onUnlock: () => void;
  onFailure: () => void;
  onUseBiometric: () => void;
  biometricAvailable: boolean;
  hint?: string;
}

export function PasscodeUnlock({
  verify,
  lockout,
  onUnlock,
  onFailure,
  onUseBiometric,
  biometricAvailable,
  hint,
}: PasscodeUnlockProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const [lockLeft, setLockLeft] = useState(() =>
    Math.ceil(lockRemainingMs(lockout, Date.now()) / 1000),
  );
  const [checking, setChecking] = useState(false);
  const locked = lockLeft > 0;

  const { pin, error, shake, press } = usePinEntry({
    onComplete: (entered, { fail }) => {
      setChecking(true);
      verify(entered)
        .then((ok) => {
          if (ok) onUnlock();
          else {
            onFailure();
            fail();
          }
        })
        .finally(() => setChecking(false));
    },
  });

  useEffect(() => {
    const update = () => setLockLeft(Math.ceil(lockRemainingMs(lockout, Date.now()) / 1000));
    update();
    if (lockRemainingMs(lockout, Date.now()) <= 0) return;
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [lockout]);

  const onKey = (k: string) => {
    if (!locked && !checking) press(k);
  };

  const message = locked
    ? t("lock.lockout", { seconds: lockLeft })
    : error
      ? t("lock.incorrect", { count: attemptsLeft(lockout) })
      : (hint ?? t("lock.unlockWallet"));

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.iconTile}>
        <Icon name="lock" size={28} />
      </View>
      <AppText weight="bold" size={21} style={styles.title}>
        {t("lock.enterPasscode")}
      </AppText>
      <AppText
        size={13.5}
        color={error || locked ? theme.colors.neg : theme.colors.textMuted}
        weight={error || locked ? "semibold" : "regular"}
        style={styles.message}
      >
        {message}
      </AppText>

      <View style={[styles.dots, { opacity: locked ? 0.4 : 1 }]}>
        <PinDots filled={pin.length} error={error} shake={shake} />
      </View>

      <View style={styles.spacer} />
      <View
        style={[styles.keypad, { opacity: locked ? 0.4 : 1 }]}
        pointerEvents={locked ? "none" : "auto"}
      >
        <PinKeypad onKey={onKey} onBiometric={onUseBiometric} biometric={biometricAvailable} />
      </View>
      {biometricAvailable && (
        <Pressable accessibilityRole="button" onPress={onUseBiometric} style={styles.biometricLink}>
          <Icon name={biometryIcon()} size={18} color={theme.colors.textMuted} />
          <AppText size={13.5} muted>
            {t("lock.useBiometricInstead")}
          </AppText>
        </Pressable>
      )}
    </ScrollView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    scroll: { flex: 1 },
    content: {
      flexGrow: 1,
      alignItems: "center",
      paddingHorizontal: theme.spacing.pad,
      paddingBottom: theme.spacing.pad,
      paddingTop: 56,
    },
    iconTile: {
      width: 60,
      height: 60,
      borderRadius: 19,
      backgroundColor: theme.colors.surface2,
      alignItems: "center",
      justifyContent: "center",
    },
    title: { marginTop: 18 },
    message: { marginTop: 6, height: 18 },
    dots: { marginTop: 26, marginBottom: 6 },
    spacer: { flex: 1, minHeight: 24 },
    keypad: { width: "100%" },
    biometricLink: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 18 },
  });
