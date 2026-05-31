import React from "react";
import { Pressable, View } from "react-native";
import { useTheme } from "@/theme";
import { AppText } from "./Text";
import { Icon } from "./Icon";

interface SheetHeaderProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
}

export function SheetHeader({ title, subtitle, onClose }: SheetHeaderProps) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
      <View style={{ flex: 1 }}>
        <AppText weight="bold" size={19}>
          {title}
        </AppText>
        {subtitle && (
          <AppText size={13} muted style={{ marginTop: 2 }}>
            {subtitle}
          </AppText>
        )}
      </View>
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close"
        hitSlop={8}
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          backgroundColor: theme.colors.surface2,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="close" size={18} color={theme.colors.textMuted} />
      </Pressable>
    </View>
  );
}
