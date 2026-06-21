import React from "react";
import { Pressable, View } from "react-native";
import { AppText } from "./Text";
import { Icon } from "./Icon";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"] as const;

export function NumberPad({ onKey }: { onKey: (key: string) => void }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
      {KEYS.map((k) => (
        <Pressable
          key={k}
          onPress={() => onKey(k)}
          accessibilityRole="button"
          accessibilityLabel={k === "del" ? "Delete" : k === "." ? "Decimal point" : k}
          style={({ pressed }) => ({
            width: "33.33%",
            height: 58,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.5 : 1,
          })}
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
