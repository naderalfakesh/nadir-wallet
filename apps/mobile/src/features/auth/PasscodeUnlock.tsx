import React, { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { AppText, Icon } from "@/components";
import { useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { PinDots, PinKeypad } from "./PinPad";

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 30;

interface PasscodeUnlockProps {
  correct: string;
  onUnlock: () => void;
  onUseBiometric: () => void;
  biometricAvailable: boolean;
}

export function PasscodeUnlock({ correct, onUnlock, onUseBiometric, biometricAvailable }: PasscodeUnlockProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockLeft, setLockLeft] = useState(0);
  const locked = lockLeft > 0;

  useEffect(() => {
    if (!locked) return;
    const id = setInterval(() => {
      setLockLeft((s) => {
        if (s <= 1) {
          setAttempts(0);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [locked]);

  const press = (k: string) => {
    if (locked) return;
    setError(false);
    if (k === "del") {
      setPin((p) => p.slice(0, -1));
      return;
    }
    setPin((p) => {
      if (p.length >= 6) return p;
      const next = p + k;
      if (next.length === 6) {
        setTimeout(() => {
          if (next === correct) {
            onUnlock();
          } else {
            const a = attempts + 1;
            setAttempts(a);
            setError(true);
            setShake(true);
            setTimeout(() => {
              setShake(false);
              setPin("");
            }, 500);
            if (a >= MAX_ATTEMPTS) setLockLeft(LOCKOUT_SECONDS);
          }
        }, 120);
      }
      return next;
    });
  };

  const remaining = MAX_ATTEMPTS - attempts;
  const message = locked
    ? t("lock.lockout", { seconds: lockLeft })
    : error
      ? t("lock.incorrect", { count: remaining })
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
        <PinKeypad onKey={press} onBiometric={onUseBiometric} biometric={biometricAvailable} />
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
      <AppText size={11} faint style={{ marginTop: 10 }}>
        {t("lock.demoPasscode")}
      </AppText>
    </View>
  );
}
