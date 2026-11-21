import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText, Icon } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import type { LivenessSnapshot } from "../liveness.types";

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
      <Pressable
        onPress={onCancel}
        style={styles.close}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={t("common.actions.close")}
      >
        <Icon name="close" size={20} color="#FFFFFF" />
      </Pressable>
      <View style={styles.stepPill}>
        <AppText weight="semibold" size={12.5} color="#FFFFFF">
          {phase === "challenge"
            ? t("liveness.step", { n: index + 1, total })
            : t("liveness.title")}
        </AppText>
      </View>
      <View style={styles.headerSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  headerSpacer: {
    width: 36,
  },
});
