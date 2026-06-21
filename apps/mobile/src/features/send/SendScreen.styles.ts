import { StyleSheet } from "react-native";
import { alpha, type Theme } from "@/theme";

export function createSendStyles(theme: Theme) {
  return StyleSheet.create({
    progress: {
      flexDirection: "row",
      gap: 5,
      paddingHorizontal: theme.spacing.pad,
      paddingBottom: 8,
    },
    progressTrack: {
      flex: 1,
      height: 3,
      borderRadius: 9,
    },
    stepScroll: {
      padding: theme.spacing.pad,
    },
    toInput: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderRadius: theme.radius.field,
      paddingLeft: 16,
      paddingRight: 6,
    },
    toTextInput: {
      flex: 1,
      color: theme.colors.text,
      fontFamily: theme.font.monoRegular,
      fontSize: 15,
      paddingVertical: 14,
    },
    iconInputButton: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: theme.colors.surface2,
      alignItems: "center",
      justifyContent: "center",
    },
    errorRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 10,
    },
    riskResult: {
      marginTop: 12,
    },
    spacer: {
      height: 22,
    },
    recipientsCard: {
      paddingHorizontal: 16,
    },
    recipientIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    amountStep: {
      flex: 1,
      padding: theme.spacing.pad,
    },
    tokenPicker: {
      alignSelf: "center",
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      height: 44,
      paddingLeft: 6,
      paddingRight: 14,
      borderRadius: 99,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.hairline,
      marginBottom: 8,
    },
    amountDisplay: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    amountText: {
      letterSpacing: -1.6,
    },
    fiatText: {
      marginTop: 8,
    },
    maxButton: {
      marginTop: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      height: 36,
      paddingHorizontal: 13,
      borderRadius: theme.radius.chip,
      backgroundColor: theme.colors.surface2,
      borderWidth: 1,
      borderColor: theme.colors.hairline,
    },
    amountCta: {
      paddingTop: 12,
    },
    reviewHero: {
      alignItems: "center",
      paddingTop: 4,
      paddingBottom: 18,
    },
    reviewAmount: {
      marginTop: 12,
    },
    reviewFiat: {
      marginTop: 3,
    },
    mismatch: {
      flexDirection: "row",
      gap: 11,
      marginTop: 12,
      padding: 13,
      borderRadius: 14,
      backgroundColor: alpha(theme.colors.warn, 0.12),
      borderWidth: 1,
      borderColor: alpha(theme.colors.warn, 0.3),
    },
    mismatchBody: {
      flex: 1,
    },
    mismatchText: {
      lineHeight: 18,
      marginTop: 2,
    },
    trustNote: {
      marginTop: 12,
    },
    footer: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      padding: theme.spacing.pad,
      backgroundColor: theme.colors.bg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.hairline,
    },
    offlineNote: {
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      marginTop: 12,
      padding: 12,
      borderRadius: 13,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.hairline,
    },
    offlineText: {
      flex: 1,
      lineHeight: 17,
    },
    simulationCard: {
      marginTop: 12,
      padding: 14,
      borderRadius: theme.radius.card,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
    },
    simulationHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      marginBottom: 11,
    },
    simulationTitle: {
      flex: 1,
    },
    simulationPill: {
      paddingHorizontal: 9,
      paddingVertical: 3,
      borderRadius: 7,
    },
    simulationBody: {
      lineHeight: 19,
    },
    simulationRows: {
      gap: 7,
    },
    simulationRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    simulationNote: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.hairline,
      marginTop: 11,
      paddingTop: 10,
    },
    simulationNoteText: {
      lineHeight: 16,
    },
  });
}
