import React from "react";
import { Pressable, View } from "react-native";
import { AppText, Button, Icon } from "@/components";
import { alpha, useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { livenessStyles as styles } from "./LivenessFlow.styles";
import type { LivenessMode, LivenessSnapshot } from "./liveness.types";

interface PermissionPanelProps {
  onRequestPermission: () => void;
}

export function PermissionPanel({ onRequestPermission }: PermissionPanelProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.permission}>
      <Icon name="scan" size={36} color={colors.accent} />
      <AppText weight="bold" size={18} color="#FFFFFF" style={styles.permissionTitle}>
        {t("liveness.permissionTitle")}
      </AppText>
      <AppText size={13.5} color={alpha("#FFFFFF", 0.7)} style={styles.permissionBody}>
        {t("liveness.permissionBody")}
      </AppText>
      <Button label={t("liveness.grant")} onPress={onRequestPermission} style={styles.permissionButton} />
    </View>
  );
}

interface LivenessHeaderProps {
  topInset: number;
  phase: LivenessSnapshot["phase"];
  index: number;
  total: number;
  onCancel: () => void;
}

export function LivenessHeader({ topInset, phase, index, total, onCancel }: LivenessHeaderProps) {
  const { t } = useTranslation();

  return (
    <View style={[styles.header, { top: topInset + 8 }]}>
      <Pressable onPress={onCancel} style={styles.close} hitSlop={10}>
        <Icon name="close" size={20} color="#FFFFFF" />
      </Pressable>
      <View style={styles.stepPill}>
        <AppText weight="semibold" size={12.5} color="#FFFFFF">
          {phase === "challenge" ? t("liveness.step", { n: index + 1, total }) : t("liveness.title")}
        </AppText>
      </View>
      <View style={styles.headerSpacer} />
    </View>
  );
}

interface ResultBadgeProps {
  visible: boolean;
  children: React.ReactNode;
}

export function ResultBadge({ visible, children }: ResultBadgeProps) {
  if (!visible) return null;

  return <View style={styles.badgeWrap} pointerEvents="none">{children}</View>;
}

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
