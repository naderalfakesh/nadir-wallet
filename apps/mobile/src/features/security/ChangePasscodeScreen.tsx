import React, { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen, ScreenHeader, AppText, Button, Icon } from "@/components";
import { useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { PinDots, PinKeypad } from "@/features/auth/PinPad";
import { usePinEntry } from "@/features/auth/usePinEntry";
import { useApp } from "@/providers/AppProvider";

type Stage = "current" | "new" | "confirm" | "done";

export function ChangePasscodeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { verifyPasscode, setPasscode, logEvent } = useApp();
  const [stage, setStage] = useState<Stage>("current");
  const [first, setFirst] = useState("");

  const { pin, error, shake, press, clear } = usePinEntry({
    onComplete: (entered, helpers) => {
      if (stage === "current") {
        void verifyPasscode(entered).then((ok) => {
          if (ok) {
            helpers.clear();
            setStage("new");
          } else helpers.fail();
        });
      } else if (stage === "new") {
        setFirst(entered);
        helpers.clear();
        setStage("confirm");
      } else if (stage === "confirm") {
        if (entered === first) {
          helpers.clear();
          void setPasscode(entered).then(() => {
            logEvent("passcode_changed");
            setStage("done");
          });
        } else
          helpers.fail(() => {
            setFirst("");
            setStage("new");
          });
      }
    },
  });

  if (stage === "done") {
    return (
      <Screen>
        <ScreenHeader title={t("settings.changePin.title")} onBack={() => router.back()} />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing.pad }}>
          <View
            style={{
              width: 92,
              height: 92,
              borderRadius: 46,
              backgroundColor: theme.colors.accentDim,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="check" size={48} stroke={2.4} color={theme.colors.accent} />
          </View>
          <AppText weight="bold" size={23} style={{ marginTop: 22 }}>
            {t("settings.changePin.doneTitle")}
          </AppText>
          <AppText size={14} muted style={{ marginTop: 8, lineHeight: 21, textAlign: "center", maxWidth: 250 }}>
            {t("settings.changePin.doneBody")}
          </AppText>
        </View>
        <View style={{ paddingHorizontal: theme.spacing.pad, paddingBottom: insets.bottom + theme.spacing.pad }}>
          <Button label={t("common.actions.done")} onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  const copy = {
    current: { title: t("settings.changePin.current"), hint: t("settings.changePin.currentHint") },
    new: { title: t("settings.changePin.new"), hint: t("settings.changePin.newHint") },
    confirm: { title: t("settings.changePin.confirm"), hint: t("settings.changePin.confirmHint") },
  }[stage];

  const back =
    stage === "current"
      ? () => router.back()
      : () => {
          clear();
          setStage(stage === "confirm" ? "new" : "current");
        };

  const errorText = stage === "current" ? t("settings.changePin.incorrect") : t("settings.changePin.mismatch");

  return (
    <Screen>
      <ScreenHeader title={t("settings.changePin.title")} onBack={back} />
      <View style={{ flex: 1, alignItems: "center", padding: theme.spacing.pad }}>
        <View style={{ height: 12 }} />
        <View
          style={{
            width: 58,
            height: 58,
            borderRadius: 18,
            backgroundColor: theme.colors.surface2,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="key" size={26} />
        </View>
        <AppText weight="bold" size={20} style={{ marginTop: 16 }}>
          {copy.title}
        </AppText>
        <AppText
          size={13.5}
          color={error ? theme.colors.neg : theme.colors.textMuted}
          weight={error ? "semibold" : "regular"}
          style={{ marginTop: 6, height: 18 }}
        >
          {error ? errorText : copy.hint}
        </AppText>
        <View style={{ marginTop: 24, marginBottom: 6 }}>
          <PinDots filled={pin.length} error={error} shake={shake} />
        </View>
        <View style={{ flex: 1, minHeight: 24 }} />
        <PinKeypad onKey={press} />
      </View>
    </Screen>
  );
}
