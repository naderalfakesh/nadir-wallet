import React, { useState } from "react";
import { View } from "react-native";
import { ScreenHeader, AppText, Icon } from "@/components";
import { useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { PinDots, PinKeypad } from "@/features/auth/PinPad";

// Demo-only passcode setup — nothing is persisted. The flow exists to mirror
// the design's app-lock step. The PIN is handed back so the flow can store it
// in the device keychain.
export function CreatePasscode({ onDone, onBack }: { onDone: (pin: string) => void; onBack: () => void }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [stage, setStage] = useState<"set" | "confirm">("set");
  const [first, setFirst] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const press = (k: string) => {
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
          if (stage === "set") {
            setFirst(next);
            setPin("");
            setStage("confirm");
          } else if (next === first) {
            onDone(next);
          } else {
            setError(true);
            setShake(true);
            setTimeout(() => {
              setShake(false);
              setPin("");
              setFirst("");
              setStage("set");
            }, 600);
          }
        }, 120);
      }
      return next;
    });
  };

  const back = stage === "confirm" ? () => { setStage("set"); setPin(""); setFirst(""); } : onBack;

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader
        title={t("onboarding.passcode.title")}
        subtitle={stage === "set" ? t("onboarding.passcode.step1") : t("onboarding.passcode.step2")}
        onBack={back}
      />
      <View style={{ flex: 1, alignItems: "center", padding: theme.spacing.pad }}>
        <View style={{ height: 12 }} />
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 19,
            backgroundColor: theme.colors.accentDim,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="lock" size={28} color={theme.colors.accent} />
        </View>
        <AppText weight="bold" size={21} style={{ marginTop: 16 }}>
          {stage === "set" ? t("onboarding.passcode.create") : t("onboarding.passcode.confirm")}
        </AppText>
        <AppText
          size={13.5}
          color={error ? theme.colors.neg : theme.colors.textMuted}
          weight={error ? "semibold" : "regular"}
          style={{ marginTop: 6, height: 18 }}
        >
          {error
            ? t("onboarding.passcode.mismatch")
            : stage === "set"
              ? t("onboarding.passcode.createHint")
              : t("onboarding.passcode.confirmHint")}
        </AppText>
        <View style={{ marginTop: 26, marginBottom: 6 }}>
          <PinDots filled={pin.length} error={error} shake={shake} />
        </View>
        <View style={{ flex: 1, minHeight: 24 }} />
        <PinKeypad onKey={press} />
      </View>
    </View>
  );
}
