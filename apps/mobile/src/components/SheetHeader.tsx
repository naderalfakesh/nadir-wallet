import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "@/i18n/useTranslation";
import { useTheme, useThemedStyles, type Theme } from "@/theme";
import { Icon } from "./Icon";
import { AppText } from "./Text";

interface SheetHeaderProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
}

export function SheetHeader({ title, subtitle, onClose }: SheetHeaderProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <View style={styles.titleBlock}>
        <AppText weight="bold" size={19}>
          {title}
        </AppText>
        {subtitle && (
          <AppText size={13} muted style={styles.subtitle}>
            {subtitle}
          </AppText>
        )}
      </View>
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={t("common.a11y.close")}
        hitSlop={8}
        style={styles.closeButton}
      >
        <Icon name="close" size={18} color={theme.colors.textMuted} />
      </Pressable>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
    titleBlock: { flex: 1 },
    subtitle: { marginTop: 2 },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: theme.colors.surface2,
      alignItems: "center",
      justifyContent: "center",
    },
  });
