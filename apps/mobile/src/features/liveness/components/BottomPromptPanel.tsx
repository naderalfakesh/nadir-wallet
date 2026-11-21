import React from "react";
import { StyleSheet, View } from "react-native";
import { AppText, Button } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { alpha } from "@/theme";
import type { LivenessMode } from "../liveness.types";

interface BottomPromptPanelProps {
  bottomInset: number;
  mode: LivenessMode;
  prompt: React.ReactNode;
  hasPassed: boolean;
  hasFailed: boolean;
  onRetry: () => void;
  onPass: () => void;
  onCancel: () => void;
}

export function BottomPromptPanel({
  bottomInset,
  mode,
  prompt,
  hasPassed,
  hasFailed,
  onRetry,
  onPass,
  onCancel,
}: BottomPromptPanelProps) {
  const { t } = useTranslation();
  const resultBody = hasPassed ? t("liveness.passedBody") : t("liveness.failedTimeout");
  const primaryLabel = hasPassed
    ? mode === "gate"
      ? t("liveness.continue")
      : t("liveness.done")
    : t("liveness.cancel");

  return (
    <View style={[styles.bottom, { paddingBottom: bottomInset + 18 }]}>
      {prompt}
      {(hasPassed || hasFailed) && (
        <AppText size={13} color={alpha("#FFFFFF", 0.75)} style={styles.resultBody}>
          {resultBody}
        </AppText>
      )}
      {hasPassed || hasFailed ? (
        <View style={styles.actions}>
          {hasFailed && (
            <View style={styles.actionButton}>
              <Button label={t("liveness.retry")} onPress={onRetry} />
            </View>
          )}
          <View style={styles.actionButton}>
            <Button
              label={primaryLabel}
              variant={hasPassed ? "primary" : "ghost"}
              onPress={hasPassed ? onPass : onCancel}
            />
          </View>
        </View>
      ) : (
        <AppText size={11.5} color={alpha("#FFFFFF", 0.5)} style={styles.scopeNote}>
          {t("liveness.scopeNote")}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  resultBody: {
    textAlign: "center",
    marginTop: 5,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  actionButton: {
    flex: 1,
  },
  scopeNote: {
    textAlign: "center",
    marginTop: 14,
  },
});
