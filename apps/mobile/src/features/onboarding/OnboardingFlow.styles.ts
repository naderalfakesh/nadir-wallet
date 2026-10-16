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
    introTopBar: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.pad,
    },
    introDots: {
      flexDirection: "row",
      gap: 6,
      paddingVertical: 8,
    },
    introDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: colors.surface3,
    },
    introDotActive: {
      width: 22,
      backgroundColor: colors.accent,
    },
    introSkip: {
      minHeight: 44,
      minWidth: 44,
      justifyContent: "center",
      alignItems: "flex-end",
    },
    // flexGrow (not flex) so large text scrolls instead of clipping.
    introBody: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.pad,
    },
    introText: {
      marginTop: 12,
      lineHeight: 23,
      textAlign: "center",
      maxWidth: 320,
    },
    introBadge: {
      marginTop: 20,
    },
  });
}
