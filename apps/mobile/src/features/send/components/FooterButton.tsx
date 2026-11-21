import React from "react";
import { StyleSheet, View } from "react-native";
import { useThemedStyles, type Theme } from "@/theme";

interface FooterButtonProps {
  children: React.ReactNode;
}

export function FooterButton({ children }: FooterButtonProps) {
  const styles = useThemedStyles(createStyles);

  return <View style={styles.footer}>{children}</View>;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    footer: {
      padding: theme.spacing.pad,
      backgroundColor: theme.colors.bg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.hairline,
    },
  });
