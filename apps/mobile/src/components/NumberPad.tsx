import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "@/i18n/useTranslation";
import { haptics } from "@/services/device/haptics";
import { Icon } from "./Icon";
import { AppText } from "./Text";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"] as const;

interface NumberPadProps {
  onKey: (key: string) => void;
}

export function NumberPad({ onKey }: NumberPadProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.grid}>
      {KEYS.map((k) => (
        <Pressable
          key={k}
          onPress={() => {
            haptics.selection();
            onKey(k);
          }}
          accessibilityRole="button"
          accessibilityLabel={
            k === "del" ? t("common.a11y.delete") : k === "." ? t("common.a11y.decimalPoint") : k
          }
          style={({ pressed }) => [styles.key, { opacity: pressed ? 0.5 : 1 }]}
        >
          {k === "del" ? (
            <Icon name="chevronL" size={24} />
          ) : (
            <AppText weight="semibold" size={24}>
              {k}
            </AppText>
          )}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap" },
  key: {
    width: "33.33%",
    height: 58,
    alignItems: "center",
    justifyContent: "center",
  },
});
