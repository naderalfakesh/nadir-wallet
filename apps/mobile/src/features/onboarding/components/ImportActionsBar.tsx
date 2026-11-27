import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText, Icon } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { useTheme, useThemedStyles, type Theme } from "@/theme";

interface ImportActionsBarProps {
  wordCount: number;
  wordCountValid: boolean;
  onPaste: () => void;
  onFillSample: () => void;
}

export function ImportActionsBar({
  wordCount,
  wordCountValid,
  onPaste,
  onFillSample,
}: ImportActionsBarProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

  return (
    <View style={styles.actionsRow}>
      <Pressable accessibilityRole="button" onPress={onPaste} style={styles.pasteButton}>
        <Icon name="paste" size={16} color={theme.colors.textMuted} />
        <AppText weight="semibold" size={13.5} muted>
          {t("onboarding.import.paste")}
        </AppText>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={onFillSample} style={styles.sampleButton}>
        <AppText weight="semibold" size={13} color={theme.colors.accent}>
          {t("onboarding.import.sample")}
        </AppText>
      </Pressable>
      <AppText
        weight="semibold"
        size={13}
        tnum
        color={wordCountValid ? theme.colors.pos : theme.colors.textFaint}
      >
        {t("onboarding.import.words", { count: wordCount })}
      </AppText>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    actionsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 12,
    },
    pasteButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      height: 36,
      paddingHorizontal: 13,
      borderRadius: theme.radius.chip,
      backgroundColor: theme.colors.surface2,
      borderWidth: 1,
      borderColor: theme.colors.hairline,
    },
    sampleButton: { paddingVertical: 10 },
  });
