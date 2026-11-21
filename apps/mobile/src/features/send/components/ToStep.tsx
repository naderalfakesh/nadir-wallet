import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { AppText, Card, Row, Icon, SectionLabel, RiskResult } from "@/components";
import { createStaleGuard } from "@/features/auth/staleGuard";
import { CHAINS, RECIPIENTS } from "@/features/wallet/data";
import type { AddressRisk } from "@/features/wallet/risk";
import { useTranslation } from "@/i18n/useTranslation";
import { readClipboardText } from "@/services/device";
import { useTheme, useThemedStyles, type Theme } from "@/theme";
import { shortAddr } from "@/utils/format";
import { getRecipientValidation, getRiskCopy } from "../send.utils";
import { OfflineRiskNote } from "./OfflineRiskNote";
import { RecipientIcon } from "./RecipientIcon";

interface ToStepProps {
  to: string;
  toError: boolean;
  toValid: boolean;
  risk: AddressRisk | null;
  riskUnavailable: boolean;
  onChangeTo: (value: string) => void;
  onScan: () => void;
}

export function ToStep({
  to,
  toError,
  toValid,
  risk,
  riskUnavailable,
  onChangeTo,
  onScan,
}: ToStepProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const [pasteFeedback, setPasteFeedback] = useState<"empty" | "invalid" | null>(null);
  const [pasteGuard] = useState(createStaleGuard);
  useEffect(() => () => pasteGuard.invalidate(), [pasteGuard]);

  const editRecipient = (value: string) => {
    pasteGuard.invalidate();
    setPasteFeedback(null);
    onChangeTo(value);
  };
  const paste = async () => {
    pasteGuard.invalidate();
    const { current, value } = await pasteGuard.run(readClipboardText);
    if (!current) return;
    if (getRecipientValidation(value).toValid) editRecipient(value);
    else setPasteFeedback(value ? "invalid" : "empty");
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.stepScroll}>
      <View
        style={[
          styles.toInput,
          { borderColor: toError ? theme.colors.neg : theme.colors.hairline },
        ]}
      >
        <TextInput
          testID="send-recipient"
          value={to}
          onChangeText={editRecipient}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          placeholder={t("send.to.placeholder")}
          placeholderTextColor={theme.colors.textFaint}
          style={styles.toTextInput}
        />
        <Pressable
          onPress={() => void paste()}
          accessibilityRole="button"
          accessibilityLabel={t("send.to.paste")}
          style={styles.iconInputButton}
        >
          <Icon name="paste" size={19} />
        </Pressable>
        <Pressable
          onPress={() => {
            pasteGuard.invalidate();
            onScan();
          }}
          accessibilityRole="button"
          accessibilityLabel={t("common.a11y.scanQr")}
          style={styles.iconInputButton}
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

      {toError && (
        <View style={styles.errorRow}>
          <Icon name="alert" size={16} color={theme.colors.neg} />
          <AppText size={12.5} color={theme.colors.neg}>
            {t("send.to.invalid")}
          </AppText>
        </View>
      )}

      {risk && (
        <View style={styles.riskResult}>
          <RiskResult level={risk.level} {...getRiskCopy(risk, t)} />
        </View>
      )}
      {toValid && riskUnavailable && <OfflineRiskNote text={t("send.to.riskUnavailable")} />}

      <View style={styles.spacer} />
      <SectionLabel>{t("send.to.samples")}</SectionLabel>
      <Card padding={0} style={styles.recipientsCard}>
        {RECIPIENTS.map((recipient, index) => (
          <Row
            key={recipient.addr}
            last={index === RECIPIENTS.length - 1}
            onPress={() => editRecipient(recipient.addr)}
            left={<RecipientIcon flagged={recipient.flagged} />}
            title={
              recipient.label ?? (
                <AppText mono weight="semibold" size={15} numberOfLines={1}>
                  {shortAddr(recipient.addr, 8, 6)}
                </AppText>
              )
            }
            sub={
              recipient.label ? (
                <AppText mono size={13} muted>
                  {shortAddr(recipient.addr, 8, 6)}
                </AppText>
              ) : (
                <AppText size={13} faint>
                  {CHAINS[recipient.network].name}
                </AppText>
              )
            }
            chevron
          />
        ))}
      </Card>
    </ScrollView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    stepScroll: {
      padding: theme.spacing.pad,
    },
    toInput: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderRadius: theme.radius.field,
      paddingLeft: 16,
      paddingRight: 6,
    },
    toTextInput: {
      flex: 1,
      color: theme.colors.text,
      fontFamily: theme.font.monoRegular,
      fontSize: 15,
      paddingVertical: 14,
    },
    iconInputButton: {
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
    riskResult: {
      marginTop: 12,
    },
    spacer: {
      height: 22,
    },
    recipientsCard: {
      paddingHorizontal: 16,
    },
  });
