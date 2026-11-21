import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme, useThemedStyles, alpha, type Theme } from "@/theme";
import { Button } from "./Button";
import { Icon, type IconName } from "./Icon";
import { AppText } from "./Text";

type Tone = "muted" | "warn" | "neg";

interface EmptyStateProps {
  icon: IconName;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: Tone;
}

export function EmptyState({
  icon,
  title,
  body,
  actionLabel,
  onAction,
  tone = "muted",
}: EmptyStateProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const c =
    tone === "neg"
      ? theme.colors.neg
      : tone === "warn"
        ? theme.colors.warn
        : theme.colors.textMuted;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconBox,
          { backgroundColor: tone === "muted" ? theme.colors.surface2 : alpha(c, 0.14) },
        ]}
      >
        <Icon name={icon} size={34} color={c} />
      </View>
      <AppText weight="bold" size={17} style={styles.title}>
        {title}
      </AppText>
      {body && (
        <AppText size={13.5} muted style={styles.body}>
          {body}
        </AppText>
      )}
      {actionLabel && onAction && (
        <Button
          label={actionLabel}
          variant="soft"
          onPress={onAction}
          height={48}
          style={styles.action}
        />
      )}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 40,
      paddingHorizontal: theme.spacing.pad,
    },
    iconBox: {
      width: 72,
      height: 72,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
    },
    title: { marginTop: 18 },
    body: { marginTop: 7, lineHeight: 20, textAlign: "center", maxWidth: 260 },
    action: { marginTop: 20 },
  });
