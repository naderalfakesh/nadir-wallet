import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "@/components";
import { CHAINS } from "@/features/wallet/chains";
import type { ChainId } from "@/features/wallet/types";
import { alpha, useTheme, useThemedStyles, type Theme } from "@/theme";

interface ChainSelectorProps {
  selected: ChainId;
  onSelect: (chain: ChainId) => void;
}

const CHAIN_LIST = Object.values(CHAINS);

export function ChainSelector({ selected, onSelect }: ChainSelectorProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.chains}>
      {CHAIN_LIST.map((chain) => {
        const active = selected === chain.id;
        return (
          <Pressable
            key={chain.id}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(chain.id)}
            style={[
              styles.chip,
              {
                backgroundColor: active ? alpha(theme.colors.accent, 0.15) : theme.colors.surface2,
                borderColor: active ? "transparent" : theme.colors.hairline,
              },
            ]}
          >
            <View style={[styles.chipDot, { backgroundColor: chain.color }]} />
            <AppText
              weight="semibold"
              size={13.5}
              color={active ? theme.colors.accent : theme.colors.textMuted}
            >
              {chain.name}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    chains: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 16,
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      height: 36,
      paddingHorizontal: 13,
      borderRadius: theme.radius.chip,
      borderWidth: 1,
    },
    chipDot: {
      width: 9,
      height: 9,
      borderRadius: 5,
    },
  });
