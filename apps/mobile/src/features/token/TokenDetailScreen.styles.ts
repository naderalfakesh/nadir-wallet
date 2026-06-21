import { StyleSheet } from "react-native";
import { type Theme } from "@/theme";

export function createTokenDetailStyles(theme: Theme) {
  const { spacing } = theme;
  return StyleSheet.create({
    content: {
      paddingBottom: 24,
    },
    notice: {
      paddingHorizontal: spacing.pad,
      paddingBottom: 4,
    },
    body: {
      paddingHorizontal: spacing.pad,
    },
    hero: {
      alignItems: "center",
      paddingTop: 4,
    },
    heroAmount: {
      marginTop: 14,
      letterSpacing: -1,
    },
    heroValue: {
      marginTop: 4,
    },
    heroChange: {
      marginTop: 10,
    },
    chartWrap: {
      marginTop: 20,
      marginBottom: 12,
    },
    actions: {
      flexDirection: "row",
      gap: 10,
      marginTop: 20,
    },
    actionButton: {
      flex: 1,
    },
    spacer: {
      height: 22,
    },
    cardInset: {
      paddingHorizontal: 16,
    },
  });
}
