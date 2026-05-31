import React, { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { ScreenHeader, AppText, Button, Icon } from "@/components";
import { useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { DEMO_RECOVERY_PHRASE } from "./data";

// Mock validation only — no real import or persistence happens. A reviewer can
// reach the success path with "Paste", or trigger the invalid-word / checksum
// states by typing.
// TODO(pass 3): validate against a real BIP39 wordlist + checksum on-device.
export function ImportScreen({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [value, setValue] = useState("");

  const tokens = value.trim().split(/\s+/).filter(Boolean);
  const countOk = tokens.length === 12 || tokens.length === 24;
  const invalidWord = tokens.find((w) => !/^[a-z]+$/i.test(w)) ?? null;
  const demoPhrase = DEMO_RECOVERY_PHRASE.join(" ");
  const checksumOk = value.trim().toLowerCase() === demoPhrase;

  const error =
    invalidWord != null
      ? t("onboarding.import.invalidWord", { word: invalidWord })
      : countOk && !checksumOk
        ? t("onboarding.import.invalidChecksum")
        : null;

  const canContinue = countOk && invalidWord == null && checksumOk;

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title={t("onboarding.import.title")} subtitle={t("onboarding.import.sub")} onBack={onBack} />
      <View style={{ flex: 1, paddingHorizontal: theme.spacing.pad, paddingBottom: theme.spacing.pad }}>
        <TextInput
          value={value}
          onChangeText={setValue}
          autoFocus
          multiline
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
            onPress={() => setValue(demoPhrase)}
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
          <AppText weight="semibold" size={13} tnum color={countOk ? theme.colors.pos : theme.colors.textFaint}>
            {t("onboarding.import.words", { count: tokens.length })}
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
        <Button label={t("onboarding.import.cta")} disabled={!canContinue} onPress={onDone} />
      </View>
    </View>
  );
}
