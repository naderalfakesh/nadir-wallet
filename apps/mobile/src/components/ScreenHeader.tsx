import React from "react";
import { Pressable, View } from "react-native";
import { useTheme } from "@/theme";
import { AppText } from "./Text";
import { Icon } from "./Icon";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  trailing?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, onBack, trailing }: ScreenHeaderProps) {
  const theme = useTheme();
  const centered = !!onBack;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: theme.spacing.pad,
        paddingTop: 8,
        paddingBottom: 12,
        minHeight: 56,
      }}
    >
      {onBack ? (
        <Pressable
          onPress={onBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={{
            width: 40,
            height: 40,
            borderRadius: 13,
            backgroundColor: theme.colors.surface2,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="chevronL" size={22} />
        </Pressable>
      ) : (
        <View style={{ width: 4 }} />
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText weight="bold" size={19} style={{ textAlign: centered ? "center" : "left" }}>
          {title}
        </AppText>
        {subtitle && (
          <AppText size={12.5} muted style={{ marginTop: 1, textAlign: centered ? "center" : "left" }}>
            {subtitle}
          </AppText>
        )}
      </View>
      <View style={{ width: centered ? 40 : undefined, alignItems: "flex-end" }}>{trailing}</View>
    </View>
  );
}
