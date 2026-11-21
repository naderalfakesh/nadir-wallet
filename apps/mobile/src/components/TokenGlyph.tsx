import React from "react";
import { StyleSheet, View } from "react-native";
import { useThemedStyles, alpha, type Theme } from "@/theme";
import { AppText } from "./Text";

interface TokenGlyphProps {
  symbol: string;
  color: string;
  size?: number;
  // Chain badge: pass a color to show it (omitted for the primary network).
  chainColor?: string;
}

export function TokenGlyph({ symbol, color, size = 44, chainColor }: TokenGlyphProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: alpha(color, 0.2),
            borderColor: alpha(color, 0.38),
          },
        ]}
      >
        <AppText weight="bold" size={size * 0.38} color={color}>
          {symbol.slice(0, 1)}
        </AppText>
      </View>
      {chainColor && (
        <View
          style={[
            styles.chainBadge,
            {
              width: size * 0.42,
              height: size * 0.42,
              borderRadius: (size * 0.42) / 2,
              backgroundColor: chainColor,
            },
          ]}
        />
      )}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    circle: {
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    chainBadge: {
      position: "absolute",
      right: -2,
      bottom: -2,
      borderWidth: 2,
      borderColor: theme.colors.bg,
    },
  });
