import React, { useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen, ScreenHeader, AppText, Button, Icon } from "@/components";
import { PinDots } from "@/features/auth/components/PinDots";
import { PinKeypad } from "@/features/auth/components/PinKeypad";
import { usePinEntry } from "@/features/auth/usePinEntry";
import { useTranslation } from "@/i18n/useTranslation";
import { useApp } from "@/providers/AppProvider";
import { useTheme, useThemedStyles, type Theme } from "@/theme";

type Stage = "current" | "new" | "confirm" | "done";
type EntryError = "incorrect" | "mismatch" | "saveFailed";

export function ChangePasscodeScreen() {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const { t } = useTranslation();
  const { verifyPasscode, setPasscode, logEvent } = useApp();
  const [stage, setStage] = useState<Stage>("current");
  const [first, setFirst] = useState("");
  const [entryError, setEntryError] = useState<EntryError>("incorrect");
  // Hashing and the keychain write take a moment; ignore keys until it settles
  // so a re-entered PIN can't start a second save or log the change twice.
  const saving = useRef(false);

  const { pin, error, shake, press, clear } = usePinEntry({
    onComplete: (entered, helpers) => {
      if (stage === "current") {
        void verifyPasscode(entered).then((ok) => {
          if (ok) {
            helpers.clear();
            setStage("new");
          } else {
            setEntryError("incorrect");
            helpers.fail();
          }
        });
      } else if (stage === "new") {
        setFirst(entered);
        helpers.clear();
        setStage("confirm");
      } else if (stage === "confirm") {
        if (entered === first) {
          if (saving.current) return;
          saving.current = true;
          setPasscode(entered).then(
            () => {
              saving.current = false;
              helpers.clear();
              logEvent("passcode_changed");
              setStage("done");
            },
            // The old PIN stays in place; start the new-PIN entry over.
            () => {
              saving.current = false;
              setEntryError("saveFailed");
              helpers.fail(() => {
                setFirst("");
                setStage("new");
              });
            },
          );
        } else {
          setEntryError("mismatch");
          helpers.fail(() => {
            setFirst("");
            setStage("new");
          });
        }
      }
    },
  });

  if (stage === "done") {
    return (
      <Screen>
        <ScreenHeader title={t("settings.changePin.title")} onBack={() => router.back()} />
        <View style={styles.doneBody}>
          <View style={styles.doneIcon}>
            <Icon name="check" size={48} stroke={2.4} color={theme.colors.accent} />
          </View>
          <AppText weight="bold" size={23} style={styles.doneTitle}>
            {t("settings.changePin.doneTitle")}
          </AppText>
          <AppText size={14} muted style={styles.doneText}>
            {t("settings.changePin.doneBody")}
          </AppText>
        </View>
        <View style={styles.footer}>
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

  const errorText = t(`settings.changePin.${entryError}`);

  return (
    <Screen>
      <ScreenHeader title={t("settings.changePin.title")} onBack={back} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topSpacer} />
        <View style={styles.keyIcon}>
          <Icon name="key" size={26} />
        </View>
        <AppText weight="bold" size={20} style={styles.title}>
          {copy.title}
        </AppText>
        <AppText
          size={13.5}
          color={error ? theme.colors.neg : theme.colors.textMuted}
          weight={error ? "semibold" : "regular"}
          style={styles.hint}
        >
          {error ? errorText : copy.hint}
        </AppText>
        <View style={styles.dots}>
          <PinDots filled={pin.length} error={error} shake={shake} />
        </View>
        <View style={styles.flexSpacer} />
        <PinKeypad
          onKey={(key) => {
            if (!saving.current) press(key);
          }}
        />
      </ScrollView>
    </Screen>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    doneBody: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing.pad,
    },
    doneIcon: {
      width: 92,
      height: 92,
      borderRadius: 46,
      backgroundColor: theme.colors.accentDim,
      alignItems: "center",
      justifyContent: "center",
    },
    doneTitle: {
      marginTop: 22,
    },
    doneText: {
      marginTop: 8,
      lineHeight: 21,
      textAlign: "center",
      maxWidth: 250,
    },
    footer: {
      paddingHorizontal: theme.spacing.pad,
      paddingBottom: theme.spacing.pad,
    },
    content: {
      flexGrow: 1,
      alignItems: "center",
      padding: theme.spacing.pad,
    },
    topSpacer: {
      height: 12,
    },
    keyIcon: {
      width: 58,
      height: 58,
      borderRadius: 18,
      backgroundColor: theme.colors.surface2,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      marginTop: 16,
    },
    hint: {
      marginTop: 6,
      height: 18,
    },
    dots: {
      marginTop: 24,
      marginBottom: 6,
    },
    flexSpacer: {
      flex: 1,
      minHeight: 24,
    },
  });
