import React, { useEffect, useState } from "react";
import { AppState, Pressable, ScrollView, TextInput, View } from "react-native";
import { ScreenHeader, AppText, Button, Icon } from "@/components";
import { useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { generateMnemonic, suggestBip39Words, validateMnemonicPhrase } from "@nadir-wallet/crypto-core";

import { readClipboardText } from "@/services/device";
import { createStaleGuard } from "@/features/auth/staleGuard";

// Real BIP39 validation. On success the phrase is handed up and the wallet is
// derived; the phrase never leaves the device.
export function ImportScreen({ onBack, onDone }: { onBack: () => void; onDone: (phrase: string) => void }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const [clipboardEmpty, setClipboardEmpty] = useState(false);
  const [pasteGuard] = useState(createStaleGuard);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "background") {
        pasteGuard.invalidate();
        setValue("");
        setClipboardEmpty(false);
      }
    });
    return () => {
      subscription.remove();
      pasteGuard.invalidate();
    };
  }, [pasteGuard]);

  const editValue = (text: string) => {
    pasteGuard.invalidate();
    setClipboardEmpty(false);
    setValue(text);
  };
  const paste = async () => {
    pasteGuard.invalidate();
    const { current, value: text } = await pasteGuard.run(readClipboardText);
    if (!current) return;
    if (text) editValue(text);
    else setClipboardEmpty(true);
  };

  const result = validateMnemonicPhrase(value);
  const prefix = value.match(/(?:^|\s)([a-z]+)$/i)?.[1] ?? "";
  const suggestions = result.valid ? [] : suggestBip39Words(prefix);
  const error =
    result.invalidWord != null
      ? t("onboarding.import.invalidWord", { word: result.invalidWord })
      : result.wordCountValid && !result.checksumValid
        ? t("onboarding.import.invalidChecksum")
        : null;

  const normalized = value.trim().toLowerCase().split(/\s+/).filter(Boolean).join(" ");

  return (
    <>
      <ScreenHeader title={t("onboarding.import.title")} subtitle={t("onboarding.import.sub")} onBack={onBack} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: theme.spacing.pad, paddingBottom: theme.spacing.pad }}
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
          style={{
            minHeight: 140,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: error ? theme.colors.neg : theme.colors.hairline,
            borderRadius: theme.radius.field,
            color: theme.colors.text,
            fontFamily: theme.font.monoRegular,
            fontSize: 15,
            lineHeight: 26,
            padding: 16,
            textAlignVertical: "top",
          }}
        />

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
          <Pressable
            accessibilityRole="button"
            onPress={() => void paste()}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 7,
              height: 36,
              paddingHorizontal: 13,
              borderRadius: theme.radius.chip,
              backgroundColor: theme.colors.surface2,
              borderWidth: 1,
              borderColor: theme.colors.hairline,
            }}
          >
            <Icon name="paste" size={16} color={theme.colors.textMuted} />
            <AppText weight="semibold" size={13.5} muted>
              {t("onboarding.import.paste")}
            </AppText>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => editValue(generateMnemonic())} style={{ paddingVertical: 10 }}>
            <AppText weight="semibold" size={13} color={theme.colors.accent}>
              {t("onboarding.import.sample")}
            </AppText>
          </Pressable>
          <AppText weight="semibold" size={13} tnum color={result.wordCountValid ? theme.colors.pos : theme.colors.textFaint}>
            {t("onboarding.import.words", { count: result.wordCount })}
          </AppText>
        </View>

        {suggestions.length > 0 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {suggestions.map((word) => (
              <Pressable
                key={word}
                accessibilityRole="button"
                onPress={() => editValue(value.slice(0, -prefix.length) + word + " ")}
                style={{ backgroundColor: theme.colors.surface2, borderRadius: theme.radius.chip, padding: 10 }}
              >
                <AppText mono size={13}>{word}</AppText>
              </Pressable>
            ))}
          </View>
        )}

        {clipboardEmpty && (
          <AppText size={12.5} muted accessibilityLiveRegion="polite" style={{ marginTop: 8 }}>
            {t("common.actions.clipboardEmpty")}
          </AppText>
        )}

        {error && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 }}>
            <Icon name="alert" size={16} color={theme.colors.neg} />
            <AppText size={12.5} color={theme.colors.neg} style={{ flex: 1 }}>
              {error}
            </AppText>
          </View>
        )}

        <View style={{ flexDirection: "row", gap: 9, marginTop: 18, paddingHorizontal: 2 }}>
          <Icon name="lock" size={16} color={theme.colors.textFaint} />
          <AppText faint size={12} style={{ flex: 1, lineHeight: 17 }}>
            {t("onboarding.import.securityNote")}
          </AppText>
        </View>

        <View style={{ flex: 1 }} />
        <Button testID="import-wallet" label={t("onboarding.import.cta")} disabled={!result.valid} onPress={() => onDone(normalized)} />
      </ScrollView>
    </>
  );
}
