import React from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { AppText, Icon } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { useTheme, useThemedStyles, type Theme } from "@/theme";

interface RecipientInputProps {
  value: string;
  hasError: boolean;
  pasteFeedback: "empty" | "invalid" | null;
  onChangeText: (value: string) => void;
  onPaste: () => void;
  onScan: () => void;
}

export function RecipientInput({
  value,
  hasError,
  pasteFeedback,
  onChangeText,
  onPaste,
  onScan,
}: RecipientInputProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

  return (
    <>
      <View
        style={[styles.field, { borderColor: hasError ? theme.colors.neg : theme.colors.hairline }]}
      >
        <TextInput
          testID="send-recipient"
          value={value}
          onChangeText={onChangeText}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          placeholder={t("send.to.placeholder")}
          placeholderTextColor={theme.colors.textFaint}
          style={styles.input}
        />
        <Pressable
          onPress={onPaste}
          accessibilityRole="button"
          accessibilityLabel={t("send.to.paste")}
          style={styles.iconButton}
        >
          <Icon name="paste" size={19} />
        </Pressable>
        <Pressable
          onPress={onScan}
          accessibilityRole="button"
          accessibilityLabel={t("common.a11y.scanQr")}
          style={styles.iconButton}
        >
          <Icon name="scan" size={19} />
        </Pressable>
      </View>

      {pasteFeedback && (
        <AppText size={12.5} muted accessibilityLiveRegion="polite" style={styles.errorRow}>
          {t(
            pasteFeedback === "empty"
              ? "common.actions.clipboardEmpty"
              : "send.to.clipboardInvalid",
          )}
        </AppText>
      )}

      {hasError && (
        <View style={styles.errorRow}>
          <Icon name="alert" size={16} color={theme.colors.neg} />
          <AppText size={12.5} color={theme.colors.neg}>
            {t("send.to.invalid")}
          </AppText>
        </View>
      )}
    </>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    field: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderRadius: theme.radius.field,
      paddingLeft: 16,
      paddingRight: 6,
    },
    input: {
      flex: 1,
      color: theme.colors.text,
      fontFamily: theme.font.monoRegular,
      fontSize: 15,
      paddingVertical: 14,
    },
    iconButton: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: theme.colors.surface2,
      alignItems: "center",
      justifyContent: "center",
    },
    errorRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 10,
    },
  });
