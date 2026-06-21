import { StyleSheet } from "react-native";
import type { Theme } from "@/theme";

export function createHomeStyles(theme: Theme) {
  return StyleSheet.create({
    content: {
      paddingBottom: 16,
    },
    accountBar: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: theme.spacing.pad,
      paddingTop: 14,
      paddingBottom: 4,
    },
    accountPicker: {
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      height: 42,
      paddingLeft: 7,
      paddingRight: 12,
      borderRadius: 99,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.hairline,
    },
    accountAvatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.accent,
    },
    accountSpacer: {
      flex: 1,
    },
    noticeWrap: {
      paddingHorizontal: theme.spacing.pad,
      paddingTop: 10,
    },
    balanceWrap: {
      paddingHorizontal: theme.spacing.pad,
      paddingTop: 10,
    },
    balanceHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    unavailableValue: {
      letterSpacing: -0.6,
    },
    balanceValue: {
      letterSpacing: -1.4,
    },
    changeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      marginTop: 11,
    },
    chartWrap: {
      marginTop: 18,
      marginBottom: 12,
    },
    quickActions: {
      flexDirection: "row",
      gap: 6,
      paddingHorizontal: theme.spacing.pad,
      paddingTop: 20,
      paddingBottom: 4,
    },
    quickAction: {
      flex: 1,
      alignItems: "center",
      gap: 8,
    },
    quickActionIcon: {
      width: 58,
      height: 58,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryActionIcon: {
      backgroundColor: theme.colors.surface2,
      borderWidth: 1,
      borderColor: theme.colors.hairline,
    },
    primaryActionIcon: {
      backgroundColor: theme.colors.accent,
    },
    backupWrap: {
      paddingHorizontal: theme.spacing.pad,
      paddingTop: 16,
    },
    backupRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 13,
    },
    backupIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.colors.surface2,
      alignItems: "center",
      justifyContent: "center",
    },
    backupBody: {
      flex: 1,
    },
    backupText: {
      marginTop: 1,
    },
    section: {
      paddingHorizontal: theme.spacing.pad,
      paddingBottom: 14,
    },
    tokenSection: {
      paddingTop: 22,
    },
    cardInset: {
      paddingHorizontal: 16,
    },
    seeAll: {
      paddingVertical: 4,
      paddingLeft: 8,
    },
  });
}
