import { StyleSheet } from "react-native";
import { type Theme } from "@/theme";

export function createOnboardingStyles(theme: Theme) {
  const { colors, spacing } = theme;
  return StyleSheet.create({
    badge: {
      width: 100,
      height: 100,
      backgroundColor: colors.accentDim,
      alignItems: "center",
      justifyContent: "center",
    },
    centerStep: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.pad,
    },
    heroTitle: {
      marginTop: 24,
      letterSpacing: -0.4,
    },
    heroTitleLarge: {
      marginTop: 24,
      letterSpacing: -0.5,
    },
    heroBody: {
      marginTop: 10,
      lineHeight: 22,
      textAlign: "center",
    },
    footer: {
      paddingHorizontal: spacing.pad,
      gap: 11,
    },
    explainList: {
      flex: 1,
      paddingHorizontal: spacing.pad,
      gap: 12,
    },
    explainRow: {
      flexDirection: "row",
      gap: 13,
    },
    explainIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: colors.accentDim,
      alignItems: "center",
      justifyContent: "center",
    },
    explainBody: {
      flex: 1,
    },
    explainText: {
      lineHeight: 19,
      marginTop: 3,
    },
    spacer: {
      flex: 1,
    },
  });
}
