import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { RiskResult } from "@/components";
import { createStaleGuard } from "@/features/auth/staleGuard";
import type { AddressRisk } from "@/features/wallet/risk";
import { useTranslation } from "@/i18n/useTranslation";
import { readClipboardText } from "@/services/device";
import { useThemedStyles, type Theme } from "@/theme";
import { getRecipientValidation, getRiskCopy } from "../send.utils";
import { OfflineRiskNote } from "./OfflineRiskNote";
import { RecipientInput } from "./RecipientInput";
import { SampleRecipients } from "./SampleRecipients";

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

  const scan = () => {
    pasteGuard.invalidate();
    onScan();
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.stepScroll}>
      <RecipientInput
        value={to}
        hasError={toError}
        pasteFeedback={pasteFeedback}
        onChangeText={editRecipient}
        onPaste={() => void paste()}
        onScan={scan}
      />

      {risk && (
        <View style={styles.riskResult}>
          <RiskResult level={risk.level} {...getRiskCopy(risk, t)} />
        </View>
      )}
      {toValid && riskUnavailable && <OfflineRiskNote text={t("send.to.riskUnavailable")} />}

      <View style={styles.spacer} />
      <SampleRecipients onSelect={editRecipient} />
    </ScrollView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    stepScroll: {
      padding: theme.spacing.pad,
    },
    riskResult: {
      marginTop: 12,
    },
    spacer: {
      height: 22,
    },
  });
