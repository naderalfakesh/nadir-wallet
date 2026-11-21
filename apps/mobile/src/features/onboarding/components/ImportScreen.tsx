import React from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { ScreenHeader, AppText, Button, Icon } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { useTheme, useThemedStyles, type Theme } from "@/theme";
import { useMnemonicInput } from "../useMnemonicInput";

interface ImportScreenProps {
  onBack: () => void;
  onDone: (phrase: string) => void;
}

// Real BIP39 validation. On success the phrase is handed up and the wallet is
// derived; the phrase never leaves the device.
export function ImportScreen({ onBack, onDone }: ImportScreenProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const {
    value,
    clipboardEmpty,
    editValue,
    paste,
    result,
    suggestions,
    normalized,
    applySuggestion,
    fillSample,
  } = useMnemonicInput();
  const error =
    result.invalidWord != null
      ? t("onboarding.import.invalidWord", { word: result.invalidWord })
      : result.wordCountValid && !result.checksumValid
        ? t("onboarding.import.invalidChecksum")
        : null;

  return (
    <>
      <ScreenHeader
        title={t("onboarding.import.title")}
        subtitle={t("onboarding.import.sub")}
        onBack={onBack}
      />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={styles.content}
      >
        <TextInput
          value={value}
          onChangeText={editValue}
          spellCheck={false}
          autoFocus
          multiline
          // Words are space-separated, so Return closes the keyboard instead of
          // adding a newline. No onSubmitEditing: import stays an explicit press.
          submitBehavior="blurAndSubmit"
          returnKeyType="done"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder={t("onboarding.import.placeholder")}
          placeholderTextColor={theme.colors.textFaint}
          style={[styles.input, { borderColor: error ? theme.colors.neg : theme.colors.hairline }]}
        />

        <View style={styles.actionsRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => void paste()}
            style={styles.pasteButton}
          >
            <Icon name="paste" size={16} color={theme.colors.textMuted} />
            <AppText weight="semibold" size={13.5} muted>
              {t("onboarding.import.paste")}
            </AppText>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={fillSample} style={styles.sampleButton}>
            <AppText weight="semibold" size={13} color={theme.colors.accent}>
              {t("onboarding.import.sample")}
            </AppText>
          </Pressable>
          <AppText
            weight="semibold"
            size={13}
            tnum
            color={result.wordCountValid ? theme.colors.pos : theme.colors.textFaint}
          >
            {t("onboarding.import.words", { count: result.wordCount })}
          </AppText>
        </View>

        {suggestions.length > 0 && (
          <View style={styles.suggestions}>
            {suggestions.map((word) => (
              <Pressable
                key={word}
                accessibilityRole="button"
                onPress={() => applySuggestion(word)}
                style={styles.suggestion}
              >
                <AppText mono size={13}>
                  {word}
                </AppText>
              </Pressable>
            ))}
          </View>
        )}

        {clipboardEmpty && (
          <AppText size={12.5} muted accessibilityLiveRegion="polite" style={styles.clipboardEmpty}>
            {t("common.actions.clipboardEmpty")}
          </AppText>
        )}

        {error && (
          <View style={styles.errorRow}>
            <Icon name="alert" size={16} color={theme.colors.neg} />
            <AppText size={12.5} color={theme.colors.neg} style={styles.errorText}>
              {error}
            </AppText>
          </View>
        )}

        <View style={styles.noteRow}>
          <Icon name="lock" size={16} color={theme.colors.textFaint} />
          <AppText faint size={12} style={styles.noteText}>
            {t("onboarding.import.securityNote")}
          </AppText>
        </View>

        <View style={styles.spacer} />
        <Button
          testID="import-wallet"
          label={t("onboarding.import.cta")}
          disabled={!result.valid}
          onPress={() => onDone(normalized)}
        />
      </ScrollView>
    </>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    content: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.pad,
      paddingBottom: theme.spacing.pad,
    },
    input: {
      minHeight: 140,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderRadius: theme.radius.field,
      color: theme.colors.text,
      fontFamily: theme.font.monoRegular,
      fontSize: 15,
      lineHeight: 26,
      padding: 16,
      textAlignVertical: "top",
    },
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
    suggestions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
    suggestion: {
      backgroundColor: theme.colors.surface2,
      borderRadius: theme.radius.chip,
      padding: 10,
    },
    clipboardEmpty: { marginTop: 8 },
    errorRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
    errorText: { flex: 1 },
    noteRow: { flexDirection: "row", gap: 9, marginTop: 18, paddingHorizontal: 2 },
    noteText: { flex: 1, lineHeight: 17 },
    spacer: { flex: 1 },
  });
