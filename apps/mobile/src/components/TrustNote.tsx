import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@/theme";
import { Icon, type IconName } from "./Icon";
import { AppText } from "./Text";

interface TrustNoteProps {
  children: string;
  icon?: IconName;
}

export function TrustNote({ children, icon = "lock" }: TrustNoteProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Icon name={icon} size={15} color={colors.textFaint} />
      <AppText faint size={11.5} style={styles.text}>
        {children}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", gap: 9, paddingHorizontal: 2 },
  text: { flex: 1, lineHeight: 17 },
});
