import { StyleSheet } from "react-native";
import { type Theme } from "@/theme";

export function createOverlayStyles(theme: Theme) {
  const { colors, spacing, radius } = theme;
  return StyleSheet.create({
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.pad,
    },
    authBadge: {
      width: 92,
      height: 92,
      borderRadius: 28,
      backgroundColor: colors.accentDim,
      alignItems: "center",
      justifyContent: "center",
    },
    resultBadge: {
      width: 96,
      height: 96,
      borderRadius: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    resultBody: {
      marginTop: 8,
      lineHeight: 21,
      textAlign: "center",
    },
    pillGap: {
      marginTop: 16,
    },
    hashCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginTop: 18,
      padding: 14,
      borderRadius: radius.card,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.hairline,
      width: "100%",
    },
    hashValue: {
      flex: 1,
      textAlign: "right",
    },
    footer: {
      paddingHorizontal: spacing.pad,
      gap: 10,
    },
    footerRow: {
      flexDirection: "row",
      gap: 10,
    },
    footerButton: {
      flex: 1,
    },
  });
}
