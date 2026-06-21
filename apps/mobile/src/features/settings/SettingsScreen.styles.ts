import { StyleSheet } from "react-native";
import { type Theme } from "@/theme";

export function createSettingsStyles(theme: Theme) {
  const { colors, spacing } = theme;
  return StyleSheet.create({
    content: {
      paddingBottom: 24,
    },
    body: {
      paddingHorizontal: spacing.pad,
    },
    gap: {
      height: 18,
    },
    cardInset: {
      paddingHorizontal: 16,
    },
    accountRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    accountAvatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.accent,
    },
    accountInfo: {
      flex: 1,
      minWidth: 0,
    },
    accountNameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    accountCaption: {
      marginTop: 2,
    },
    accountAddress: {
      marginTop: 3,
    },
    footer: {
      alignItems: "center",
      paddingVertical: 20,
      gap: 4,
    },
    footerNote: {
      textAlign: "center",
    },
  });
}
