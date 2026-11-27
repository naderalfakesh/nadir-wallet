import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText, Card, Icon, SheetHeader } from "@/components";
import { CURRENCIES, currencyCode } from "@/features/settings/currencies";
import { useTimeout } from "@/hooks";
import { useTranslation } from "@/i18n/useTranslation";
import { useApp } from "@/providers/AppProvider";
import { useTheme, useThemedStyles, type Theme } from "@/theme";
import { SHEET_DISMISS_DELAY_MS } from "./sheets.constants";
import type { SheetCloseProps } from "./types";

export function CurrencySheet({ close }: SheetCloseProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const { prefs, setPref } = useApp();
  const { schedule } = useTimeout();
  const selected = currencyCode(prefs.currency);

  return (
    <View>
      <SheetHeader
        title={t("sheets.currency.title")}
        subtitle={t("sheets.currency.sub")}
        onClose={close}
      />
      <Card padding={0} style={styles.cardInset}>
        {CURRENCIES.map((c, i) => {
          const on = c.code === selected;
          return (
            <Pressable
              key={c.code}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => {
                setPref("currency", c.code);
                schedule(close, SHEET_DISMISS_DELAY_MS);
              }}
              style={[styles.option, i < CURRENCIES.length - 1 && styles.divider]}
            >
              <View style={styles.symbol}>
                <AppText weight="bold" size={16}>
                  {c.symbol}
                </AppText>
              </View>
              <View style={styles.body}>
                <AppText weight="semibold" size={16}>
                  {c.code}
                </AppText>
                <AppText size={13} muted style={styles.name}>
                  {t(c.nameKey)}
                </AppText>
              </View>
              {on && <Icon name="checkCircle" size={22} color={theme.colors.accent} />}
            </Pressable>
          );
        })}
      </Card>
      <AppText size={12.5} muted style={styles.note}>
        {t("sheets.currency.note")}
      </AppText>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    cardInset: { paddingHorizontal: 16 },
    option: { flexDirection: "row", alignItems: "center", gap: 13, paddingVertical: 13 },
    divider: { borderBottomWidth: 1, borderBottomColor: theme.colors.hairline },
    symbol: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: theme.colors.surface2,
      alignItems: "center",
      justifyContent: "center",
    },
    body: { flex: 1 },
    name: { marginTop: 2 },
    note: { marginTop: 14, lineHeight: 19 },
  });
