import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText, Icon, SheetHeader } from "@/components";
import { useTimeout } from "@/hooks";
import { useTranslation } from "@/i18n/useTranslation";
import { useTheme, useThemeControls, useThemedStyles, type Theme } from "@/theme";
import { SHEET_DISMISS_DELAY_MS, THEME_OPTIONS } from "./sheets.constants";
import type { SheetCloseProps } from "./types";

export function ThemeSheet({ close }: SheetCloseProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { preference, setPreference } = useThemeControls();
  const { t } = useTranslation();
  const { schedule } = useTimeout();

  return (
    <View>
      <SheetHeader
        title={t("sheets.theme.title")}
        subtitle={t("sheets.theme.sub")}
        onClose={close}
      />
      <View style={styles.list}>
        {THEME_OPTIONS.map((option) => {
          const active = preference === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              onPress={() => {
                setPreference(option.value);
                schedule(close, SHEET_DISMISS_DELAY_MS);
              }}
              style={[
                styles.option,
                { borderColor: active ? theme.colors.accent : theme.colors.hairline },
              ]}
            >
              <View style={styles.swatch}>
                <View style={[styles.swatchHalf, { backgroundColor: option.swatch[0] }]} />
                <View style={[styles.swatchHalf, { backgroundColor: option.swatch[1] }]} />
              </View>
              <View style={styles.optionBody}>
                <AppText weight="bold" size={15.5}>
                  {t(option.labelKey)}
                </AppText>
                <AppText size={12.5} muted style={styles.optionSub}>
                  {t(option.subKey)}
                </AppText>
              </View>
              <Icon
                name={active ? "checkCircle" : "chevronR"}
                size={active ? 22 : 18}
                color={active ? theme.colors.accent : theme.colors.textFaint}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    list: {
      gap: 10,
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      gap: 13,
      padding: 14,
      borderRadius: theme.radius.card,
      backgroundColor: theme.colors.surface,
      borderWidth: 1.5,
    },
    swatch: {
      width: 44,
      height: 44,
      borderRadius: 13,
      overflow: "hidden",
      flexDirection: "row",
      borderWidth: 1,
      borderColor: theme.colors.hairline,
    },
    swatchHalf: {
      flex: 1,
    },
    optionBody: {
      flex: 1,
    },
    optionSub: {
      marginTop: 1,
    },
  });
