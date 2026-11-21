import React from "react";
import { StyleSheet, View } from "react-native";
import { Icon, type IconName } from "@/components";
import { useTheme, useThemedStyles, type Theme } from "@/theme";

interface StepBadgeProps {
  icon: IconName;
  radius: number;
  stroke: number;
}

export function StepBadge({ icon, radius, stroke }: StepBadgeProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={[styles.badge, { borderRadius: radius }]}>
      <Icon name={icon} size={54} stroke={stroke} color={theme.colors.accent} />
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    badge: {
      width: 100,
      height: 100,
      backgroundColor: theme.colors.accentDim,
      alignItems: "center",
      justifyContent: "center",
    },
  });
