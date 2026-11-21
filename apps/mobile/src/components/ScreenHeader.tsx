import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "@/i18n/useTranslation";
import { useThemedStyles, type Theme } from "@/theme";
import { Icon } from "./Icon";
import { AppText } from "./Text";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  trailing?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, onBack, trailing }: ScreenHeaderProps) {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const centered = !!onBack;
  return (
    <View style={styles.container}>
      {onBack ? (
        <View style={styles.leading}>
          <Pressable
            onPress={onBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t("common.a11y.back")}
            style={styles.backButton}
          >
            <Icon name="chevronL" size={22} />
          </Pressable>
        </View>
      ) : (
        <View style={styles.leadingSpacer} />
      )}
      <View style={centered ? styles.titleBlockCentered : styles.titleBlock}>
        <AppText weight="bold" size={19} style={{ textAlign: centered ? "center" : "left" }}>
          {title}
        </AppText>
        {subtitle && (
          <AppText
            size={12.5}
            muted
            style={[styles.subtitle, { textAlign: centered ? "center" : "left" }]}
          >
            {subtitle}
          </AppText>
        )}
      </View>
      <View style={centered ? styles.trailingCentered : styles.trailing}>{trailing}</View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: theme.spacing.pad,
      paddingTop: 8,
      paddingBottom: 12,
      minHeight: 56,
    },
    leading: { flex: 1, minWidth: 40, alignItems: "flex-start" },
    leadingSpacer: { width: 4 },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 13,
      backgroundColor: theme.colors.surface2,
      alignItems: "center",
      justifyContent: "center",
    },
    titleBlockCentered: { flexShrink: 1, maxWidth: "56%" },
    titleBlock: { flex: 1, minWidth: 0 },
    subtitle: { marginTop: 1 },
    trailingCentered: { flex: 1, minWidth: 40, alignItems: "flex-end" },
    trailing: { alignItems: "flex-end" },
  });
