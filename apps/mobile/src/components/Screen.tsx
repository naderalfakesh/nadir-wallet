import React from "react";
import { KeyboardAvoidingView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemedStyles, type Theme } from "@/theme";

interface ScreenProps {
  children: React.ReactNode;
  bottomInset?: boolean;
  avoidKeyboard?: boolean;
}

export function Screen({ children, bottomInset = true, avoidKeyboard = false }: ScreenProps) {
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();

  const content = (
    <View
      style={[
        styles.content,
        {
          paddingTop: insets.top,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          paddingBottom: bottomInset ? insets.bottom : 0,
        },
      ]}
    >
      {children}
    </View>
  );

  return avoidKeyboard ? (
    <KeyboardAvoidingView behavior="padding" style={styles.keyboardAvoiding}>
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    content: { flex: 1, backgroundColor: theme.colors.bg },
    keyboardAvoiding: { flex: 1, backgroundColor: theme.colors.bg },
  });
