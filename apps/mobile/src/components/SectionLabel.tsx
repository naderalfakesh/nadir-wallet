import React from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "./Text";

interface SectionLabelProps {
  children: string;
  trailing?: React.ReactNode;
}

export function SectionLabel({ children, trailing }: SectionLabelProps) {
  return (
    <View style={styles.container}>
      <AppText weight="bold" size={13} muted style={styles.label}>
        {children}
      </AppText>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
    paddingBottom: 10,
  },
  label: { letterSpacing: 0.2 },
});
