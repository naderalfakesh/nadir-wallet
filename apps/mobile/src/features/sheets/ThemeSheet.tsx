import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SheetHeader, AppText, Icon } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import {
  useTheme,
  useThemeControls,
  useThemedStyles,
  type Theme,
  type ThemePreference,
} from "@/theme";
import type { SheetCloseProps } from "./types";

export function ThemeSheet({ close }: SheetCloseProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { preference, setPreference } = useThemeControls();
  const { t } = useTranslation();

  const options: {
    value: ThemePreference;
    label: string;
    sub: string;
    swatch: [string, string];
  }[] = [
    {
      value: "system",
      label: t("sheets.theme.system"),
      sub: t("sheets.theme.systemSub"),
      swatch: ["#14171d", "#ffffff"],
    },
    {
      value: "dark",
      label: t("sheets.theme.dark"),
      sub: t("sheets.theme.darkSub"),
      swatch: ["#14171d", "#23272f"],
    },
    {
      value: "light",
      label: t("sheets.theme.light"),
      sub: t("sheets.theme.lightSub"),
      swatch: ["#ffffff", "#eef0f4"],
    },
  ];

  return (
    <View>
      <SheetHeader
        title={t("sheets.theme.title")}
        subtitle={t("sheets.theme.sub")}
        onClose={close}
      />
      <View style={styles.list}>
        {options.map((o) => {
          const on = preference === o.value;
          return (
            <Pressable
              key={o.value}
              onPress={() => {
                setPreference(o.value);
                setTimeout(close, 220);
              }}
              style={[
                styles.option,
                { borderColor: on ? theme.colors.accent : theme.colors.hairline },
              ]}
            >
              <View style={styles.swatch}>
                <View style={[styles.swatchHalf, { backgroundColor: o.swatch[0] }]} />
                <View style={[styles.swatchHalf, { backgroundColor: o.swatch[1] }]} />
              </View>
              <View style={styles.optionBody}>
                <AppText weight="bold" size={15.5}>
                  {o.label}
                </AppText>
                <AppText size={12.5} muted style={styles.optionSub}>
                  {o.sub}
                </AppText>
              </View>
              <Icon
                name={on ? "checkCircle" : "chevronR"}
                size={on ? 22 : 18}
                color={on ? theme.colors.accent : theme.colors.textFaint}
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
