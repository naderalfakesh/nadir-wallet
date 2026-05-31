import React from "react";
import { View } from "react-native";
import { AppText } from "./Text";

interface SectionLabelProps {
  children: string;
  trailing?: React.ReactNode;
}

export function SectionLabel({ children, trailing }: SectionLabelProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 2,
        paddingBottom: 10,
      }}
    >
      <AppText weight="bold" size={13} muted style={{ letterSpacing: 0.2 }}>
        {children}
      </AppText>
      {trailing}
    </View>
  );
}
