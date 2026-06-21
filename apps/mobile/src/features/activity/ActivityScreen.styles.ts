import { StyleSheet } from "react-native";
import { type Theme } from "@/theme";

export function createActivityStyles(theme: Theme) {
  const { spacing, radius } = theme;
  return StyleSheet.create({
    notice: {
      paddingHorizontal: spacing.pad,
      paddingBottom: 4,
    },
    filters: {
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: spacing.pad,
      paddingBottom: 4,
    },
    list: {
      paddingBottom: 24,
    },
    listInner: {
      paddingHorizontal: spacing.pad,
      paddingTop: 8,
    },
    daySection: {
      marginBottom: 6,
    },
    dayCard: {
      paddingHorizontal: 16,
      marginBottom: 14,
    },
    footer: {
      alignItems: "center",
      paddingVertical: 4,
    },
    chip: {
      height: 36,
      paddingHorizontal: 13,
      borderRadius: radius.chip,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },
  });
}
