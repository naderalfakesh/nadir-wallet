import React, { useRef, useState } from "react";
import { View } from "react-native";
import { ScreenHeader, AppText, Icon } from "@/components";
import { useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { PinDots, PinKeypad } from "@/features/auth/PinPad";
import { usePinEntry } from "@/features/auth/usePinEntry";

// Two-stage set/confirm entry. Nothing is persisted here: the PIN is handed
// back so the flow can hash it and store the record in the device keychain.
// `onDone` resolves false when that write failed, and entry starts over.
export function CreatePasscode({
  onDone,
  onBack,
}: {
  onDone: (pin: string) => Promise<boolean>;
  onBack: () => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [stage, setStage] = useState<"set" | "confirm">("set");
  const [first, setFirst] = useState("");
  const [saveFailed, setSaveFailed] = useState(false);
  // Hashing and the keychain write take a moment; keys pressed meanwhile would
  // start a second save of a PIN the user is still looking at.
  const saving = useRef(false);

  const { pin, error, shake, press, clear } = usePinEntry({
    onComplete: (entered, helpers) => {
      if (stage === "set") {
        setFirst(entered);
        setSaveFailed(false);
        helpers.clear();
        setStage("confirm");
      } else if (entered === first) {
        if (saving.current) return;
        saving.current = true;
        void onDone(entered).then((saved) => {
          saving.current = false;
          if (saved) return;
          setSaveFailed(true);
          helpers.fail(() => {
            setFirst("");
            setStage("set");
          });
        });
      } else {
        helpers.fail(() => {
          setFirst("");
          setStage("set");
        });
      }
    },
  });

  const back = stage === "confirm" ? () => { setStage("set"); clear(); setFirst(""); } : onBack;

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
            ? t(saveFailed ? "onboarding.passcode.saveFailed" : "onboarding.passcode.mismatch")
            : saveFailed
              ? t("onboarding.passcode.saveFailed")
              : stage === "set"
                ? t("onboarding.passcode.createHint")
                : t("onboarding.passcode.confirmHint")}
        </AppText>
        <View style={{ marginTop: 26, marginBottom: 6 }}>
          <PinDots filled={pin.length} error={error} shake={shake} />
        </View>
        <View style={{ flex: 1, minHeight: 24 }} />
        <PinKeypad
          onKey={(key) => {
            if (!saving.current) press(key);
          }}
        />
      </View>
    </View>
  );
}
