import React from "react";
import { StyleSheet, View } from "react-native";
import { Icon } from "@/components";
import { alpha, useTheme, useThemedStyles, type Theme } from "@/theme";

interface RecipientIconProps {
  flagged?: boolean;
}

export function RecipientIcon({ flagged }: RecipientIconProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const color = flagged ? theme.colors.neg : theme.colors.textMuted;
  const backgroundColor = flagged ? alpha(theme.colors.neg, 0.16) : theme.colors.surface3;

  return (
    <View style={[styles.recipientIcon, { backgroundColor }]}>
      <Icon name={flagged ? "shield" : "user"} size={20} color={color} />
    </View>
  );
}

const createStyles = (_theme: Theme) =>
  StyleSheet.create({
    recipientIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
  });
