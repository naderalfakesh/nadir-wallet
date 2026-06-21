import React from "react";
import { Pressable, View } from "react-native";
import { useTheme } from "@/theme";
import { AppText } from "./Text";
import { Icon } from "./Icon";

interface RowProps {
  left?: React.ReactNode;
  title: React.ReactNode;
  sub?: React.ReactNode;
  right?: React.ReactNode;
  rightSub?: React.ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  last?: boolean;
}

export function Row({ left, title, sub, right, rightSub, onPress, chevron, last }: RowProps) {
  const theme = useTheme();

  const content = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 13,
        paddingVertical: 13,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.colors.hairline,
      }}
    >
      {left}
      <View style={{ flex: 1, minWidth: 0 }}>
        {typeof title === "string" ? (
          <AppText weight="semibold" size={16} numberOfLines={1}>
            {title}
          </AppText>
        ) : (
          title
        )}
        {sub != null &&
          (typeof sub === "string" ? (
            <AppText size={13} muted style={{ marginTop: 2 }}>
              {sub}
            </AppText>
          ) : (
            <View style={{ marginTop: 2 }}>{sub}</View>
          ))}
      </View>
      {(right != null || rightSub != null) && (
        <View style={{ alignItems: "flex-end" }}>
          {right != null &&
            (typeof right === "string" ? (
              <AppText weight="semibold" size={15.5} tnum numberOfLines={1}>
                {right}
              </AppText>
            ) : (
              right
            ))}
          {rightSub != null &&
            (typeof rightSub === "string" ? (
              <AppText size={13} muted tnum numberOfLines={1} style={{ marginTop: 2 }}>
                {rightSub}
              </AppText>
            ) : (
              <View style={{ marginTop: 2 }}>{rightSub}</View>
            ))}
        </View>
      )}
      {chevron && <Icon name="chevronR" size={18} color={theme.colors.textFaint} />}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => pressed && { opacity: 0.6 }}
      >
        {content}
      </Pressable>
    );
  }
  return content;
}
