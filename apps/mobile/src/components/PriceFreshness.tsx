import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "@/i18n/useTranslation";
import { useTheme } from "@/theme";
import type { PriceStatus } from "@/types/status";
import { Icon } from "./Icon";
import { AppText } from "./Text";

interface PriceFreshnessProps {
  status?: PriceStatus;
  onRetry?: () => void;
}

export function PriceFreshness({ status = "fresh", onRetry }: PriceFreshnessProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  if (status === "unavailable") {
    return (
      <View style={styles.unavailable}>
        <Icon name="alert" size={14} color={colors.neg} />
        <AppText weight="semibold" size={11.5} color={colors.neg}>
          {t("status.price.unavailable")}
        </AppText>
        {onRetry && (
          <Pressable onPress={onRetry}>
            <AppText weight="semibold" size={11.5} color={colors.accent}>
              {t("status.backend.retry")}
            </AppText>
          </Pressable>
        )}
      </View>
    );
  }

  const stale = status === "stale";
  return (
    <View style={styles.available}>
      <View style={[styles.dot, { backgroundColor: stale ? colors.warn : colors.pos }]} />
      <AppText
        weight={stale ? "semibold" : "regular"}
        size={11.5}
        color={stale ? colors.warn : colors.textFaint}
      >
        {t(`status.price.${status}`)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  unavailable: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  available: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
