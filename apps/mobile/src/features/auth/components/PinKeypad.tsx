import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText, Icon } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { biometryIcon } from "@/services/auth/biometry";
import { haptics } from "@/services/device/haptics";
import { useTheme, useThemedStyles, type Theme } from "@/theme";

interface PinKeypadProps {
  onKey: (key: string) => void;
  onBiometric?: () => void;
  biometric?: boolean;
}

export function PinKeypad({ onKey, onBiometric, biometric }: PinKeypadProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", biometric ? "bio" : "", "0", "del"];

  return (
    <View style={styles.grid}>
      {keys.map((k, i) => {
        if (k === "") return <View key={i} style={styles.blank} />;
        const isAction = k === "del" || k === "bio";
        return (
          <View key={i} style={styles.cell}>
            <Pressable
              onPress={() => {
                haptics.selection();
                if (k === "bio") onBiometric?.();
                else onKey(k);
              }}
              accessibilityRole="button"
              accessibilityLabel={
                k === "del" ? t("common.a11y.delete") : k === "bio" ? t("lock.useBiometric") : k
              }
              style={({ pressed }) => [
                styles.key,
                {
                  backgroundColor: isAction ? "transparent" : theme.colors.surface,
                  borderWidth: isAction ? 0 : 1,
                  opacity: pressed ? 0.6 : 1,
                },
              ]}
            >
              {k === "del" ? (
                <Icon name="chevronL" size={26} />
              ) : k === "bio" ? (
                <Icon name={biometryIcon()} size={28} color={theme.colors.accent} />
              ) : (
                <AppText weight="semibold" size={26}>
                  {k}
                </AppText>
              )}
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      maxWidth: 280,
      alignSelf: "center",
      width: "100%",
    },
    blank: { width: "33.33%", height: 64 },
    cell: { width: "33.33%", padding: 5 },
    key: {
      height: 64,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      borderColor: theme.colors.hairline,
    },
  });
