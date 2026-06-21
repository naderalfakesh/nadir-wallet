import { StyleSheet } from "react-native";
import { type Theme } from "@/theme";
import { RING_SIZE } from "./security.constants";

export function createSecurityStyles(theme: Theme) {
  const { colors, spacing } = theme;
  return StyleSheet.create({
    section: {
      paddingHorizontal: spacing.pad,
      paddingTop: 18,
    },
    scoreRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 20,
    },
    ring: {
      width: RING_SIZE,
      height: RING_SIZE,
    },
    ringCenter: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: "center",
      justifyContent: "center",
    },
    scoreInfo: {
      flex: 1,
    },
    scoreTier: {
      marginVertical: 2,
    },
    scoreBody: {
      lineHeight: 18,
    },
    modelList: {
      gap: 13,
    },
    modelRow: {
      flexDirection: "row",
      gap: 12,
    },
    modelIcon: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor: colors.accentDim,
      alignItems: "center",
      justifyContent: "center",
    },
    modelBody: {
      flex: 1,
    },
    modelText: {
      lineHeight: 18,
      marginTop: 2,
    },
    cardRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 13,
    },
    cardRowBody: {
      flex: 1,
    },
    cardRowSub: {
      marginTop: 1,
    },
    deviceChecks: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 16,
    },
    deviceCheck: {
      width: "50%",
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 5,
    },
    riskDivider: {
      borderTopWidth: 1,
      borderTopColor: colors.hairline,
      marginTop: 14,
      paddingTop: 14,
      gap: 9,
    },
    riskHeading: {
      letterSpacing: 0.3,
    },
    riskRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
    riskBadge: {
      width: 64,
      paddingVertical: 3,
      borderRadius: 7,
      alignItems: "center",
    },
    riskBody: {
      flex: 1,
      lineHeight: 17,
    },
  });
}
