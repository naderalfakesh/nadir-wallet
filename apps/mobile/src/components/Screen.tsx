import React from "react";
import { KeyboardAvoidingView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme";

interface ScreenProps {
  children: React.ReactNode;
  /** Tab screens sit above a tab bar that already handles the bottom inset. */
  bottomInset?: boolean;
  avoidKeyboard?: boolean;
}

export function Screen({ children, bottomInset = true, avoidKeyboard = false }: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const content = (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.bg,
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right,
        paddingBottom: bottomInset ? insets.bottom : 0,
      }}
    >
      {children}
    </View>
  );

  return avoidKeyboard ? (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      {content}
    </KeyboardAvoidingView>
  ) : content;
}
