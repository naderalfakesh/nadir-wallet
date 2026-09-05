import React, { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { AppText, Icon } from "@/components";
import { useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { PinDots, PinKeypad } from "./PinPad";
import { usePinEntry } from "./usePinEntry";
import { attemptsLeft, lockRemainingMs, type LockoutState } from "./lockout";

interface PasscodeUnlockProps {
  /** Resolves true when the entered PIN matches the stored hash. */
  verify: (pin: string) => Promise<boolean>;
  lockout: LockoutState;
  onUnlock: () => void;
  /** Called on a wrong entry; the owner persists the new lockout state. */
  onFailure: () => void;
  onUseBiometric: () => void;
  biometricAvailable: boolean;
}

export function PasscodeUnlock({
  verify,
  lockout,
  onUnlock,
  onFailure,
  onUseBiometric,
  biometricAvailable,
}: PasscodeUnlockProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [lockLeft, setLockLeft] = useState(() => Math.ceil(lockRemainingMs(lockout, Date.now()) / 1000));
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

  // Re-sync the countdown whenever the owner reports a new lockout state, then
  // tick it down once a second while locked.
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
      : t("lock.unlockWallet");

  return (
    <View style={{ flex: 1, alignItems: "center", paddingHorizontal: theme.spacing.pad }}>
      <View style={{ height: 56 }} />
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 19,
          backgroundColor: theme.colors.surface2,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="lock" size={28} />
      </View>
      <AppText weight="bold" size={21} style={{ marginTop: 18 }}>
        {t("lock.enterPasscode")}
      </AppText>
      <AppText
        size={13.5}
        color={error || locked ? theme.colors.neg : theme.colors.textMuted}
        weight={error || locked ? "semibold" : "regular"}
        style={{ marginTop: 6, height: 18 }}
      >
        {message}
      </AppText>

      <View style={{ marginTop: 26, marginBottom: 6, opacity: locked ? 0.4 : 1 }}>
        <PinDots filled={pin.length} error={error} shake={shake} />
      </View>

      <View style={{ flex: 1, minHeight: 24 }} />
      <View style={{ width: "100%", opacity: locked ? 0.4 : 1 }} pointerEvents={locked ? "none" : "auto"}>
        <PinKeypad onKey={onKey} onBiometric={onUseBiometric} biometric={biometricAvailable} />
      </View>
      {biometricAvailable && (
        <Pressable
          onPress={onUseBiometric}
          style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 18 }}
        >
          <Icon name="faceid" size={18} color={theme.colors.textMuted} />
          <AppText size={13.5} muted>
            {t("lock.useFaceIdInstead")}
          </AppText>
        </Pressable>
      )}
    </View>
  );
}
