import React from "react";
import { Linking, StyleSheet, View } from "react-native";
import { AppText, Button, Icon } from "@/components";
import { alpha, useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { cameraPanelCopy, type CameraStatus } from "./cameraStatus";

interface CameraStatusPanelProps {
  feature: "scan" | "liveness";
  status: Exclude<CameraStatus, "ready">;
  onRequestPermission: () => void;
}

/** Shown in place of the preview whenever the camera can't run. */
export function CameraStatusPanel({ feature, status, onRequestPermission }: CameraStatusPanelProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const copy = cameraPanelCopy(feature, status);
  const onAction =
    copy.action === "request"
      ? onRequestPermission
      : copy.action === "settings"
        ? () => void Linking.openSettings()
        : null;

  return (
    <View style={styles.root}>
      <Icon name="scan" size={36} color={status === "unavailable" ? colors.warn : colors.accent} />
      <AppText weight="bold" size={18} color="#FFFFFF" style={styles.title} accessibilityRole="header">
        {t(copy.titleKey)}
      </AppText>
      <AppText size={13.5} color={alpha("#FFFFFF", 0.7)} style={styles.body}>
        {t(copy.bodyKey)}
      </AppText>
      {onAction && copy.actionKey ? (
        <Button label={t(copy.actionKey)} onPress={onAction} style={styles.button} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
  },
  title: {
    marginTop: 14,
    textAlign: "center",
  },
  body: {
    marginTop: 6,
    textAlign: "center",
  },
  button: {
    marginTop: 20,
    alignSelf: "stretch",
  },
});
