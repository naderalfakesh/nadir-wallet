import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme, useThemedStyles, type Theme } from "@/theme";
import { Icon, type IconName } from "./Icon";

type TxType = "send" | "receive" | "swap";

const map: Record<
  TxType,
  { icon: IconName; color: (c: ReturnType<typeof useTheme>["colors"]) => string }
> = {
  receive: { icon: "arrowDownLeft", color: (c) => c.pos },
  send: { icon: "arrowUpRight", color: (c) => c.text },
  swap: { icon: "swap", color: (c) => c.accent },
};

interface TxIconProps {
  type: TxType;
  size?: number;
}

export function TxIcon({ type, size = 44 }: TxIconProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const m = map[type];
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      <Icon name={m.icon} size={size * 0.5} stroke={2.2} color={m.color(theme.colors)} />
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface2,
      borderWidth: 1,
      borderColor: theme.colors.hairline,
      alignItems: "center",
      justifyContent: "center",
    },
  });
