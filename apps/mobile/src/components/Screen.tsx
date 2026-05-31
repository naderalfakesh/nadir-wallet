import React from "react";
import { View, type ViewStyle, type StyleProp } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme";

interface ScreenProps {
  children: React.ReactNode;
  // Apply the top safe-area inset (screens without a native header want this).
  topInset?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Screen({ children, topInset = true, style }: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        { flex: 1, backgroundColor: theme.colors.bg, paddingTop: topInset ? insets.top : 0 },
        style,
      ]}
    >
      {children}
    </View>
  );
}
