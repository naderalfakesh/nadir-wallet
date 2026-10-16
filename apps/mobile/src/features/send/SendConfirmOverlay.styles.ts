import { StyleSheet } from "react-native";
import { type Theme } from "@/theme";

export function createOverlayStyles(theme: Theme) {
  const { spacing } = theme;
  return StyleSheet.create({
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.pad,
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
    footer: {
      paddingHorizontal: spacing.pad,
      gap: 10,
    },
  });
}
