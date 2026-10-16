import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { ScreenHeader, AppText, Button, Icon } from "@/components";
import { useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { generateMnemonic, validateMnemonicPhrase } from "@nadir-wallet/crypto-core";

// Real BIP39 validation. On success the phrase is handed up and the wallet is
// derived; the phrase never leaves the device.
export function ImportScreen({ onBack, onDone }: { onBack: () => void; onDone: (phrase: string) => void }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [value, setValue] = useState("");

  const result = validateMnemonicPhrase(value);
  const error =
    result.invalidWord != null
      ? t("onboarding.import.invalidWord", { word: result.invalidWord })
      : result.wordCountValid && !result.checksumValid
        ? t("onboarding.import.invalidChecksum")
        : null;

  const normalized = value.trim().toLowerCase().split(/\s+/).filter(Boolean).join(" ");

  // The field autofocuses, so without this the keyboard covers the Import
  // button. Android resizes the window itself; iOS needs the padding.
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScreenHeader title={t("onboarding.import.title")} subtitle={t("onboarding.import.sub")} onBack={onBack} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: theme.spacing.pad, paddingBottom: theme.spacing.pad }}
      >
        <TextInput
          value={value}
          onChangeText={setValue}
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
            onPress={() => setValue(generateMnemonic())}
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
          <AppText weight="semibold" size={13} tnum color={result.wordCountValid ? theme.colors.pos : theme.colors.textFaint}>
            {t("onboarding.import.words", { count: result.wordCount })}
          </AppText>
        </View>

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
        <Button label={t("onboarding.import.cta")} disabled={!result.valid} onPress={() => onDone(normalized)} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
