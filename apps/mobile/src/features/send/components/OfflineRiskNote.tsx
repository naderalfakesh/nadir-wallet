import React from "react";
import { StyleSheet, View } from "react-native";
import { AppText, Icon } from "@/components";
import { useTheme, useThemedStyles, type Theme } from "@/theme";

interface OfflineRiskNoteProps {
  text: string;
}

export function OfflineRiskNote({ text }: OfflineRiskNoteProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.offlineNote}>
      <Icon name="wifiOff" size={17} color={theme.colors.textFaint} />
      <AppText size={12.5} muted style={styles.offlineText}>
        {text}
      </AppText>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
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
  });
