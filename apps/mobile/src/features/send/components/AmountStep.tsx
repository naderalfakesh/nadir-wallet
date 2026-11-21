import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { AppText, Button, Icon, TokenGlyph, NumberPad } from "@/components";
import type { PortfolioToken } from "@/features/wallet/data";
import { useTranslation } from "@/i18n/useTranslation";
import { useTheme, useThemedStyles, type Theme } from "@/theme";
import { fmtUSD, fmtToken } from "@/utils/format";

interface AmountStepProps {
  token: PortfolioToken;
  amt: string;
  amtNum: number;
  fiat: number;
  onKey: (key: string) => void;
  onMax: () => void;
  onPickToken: () => void;
  onReview: () => void;
}

export function AmountStep({
  token,
  amt,
  amtNum,
  fiat,
  onKey,
  onMax,
  onPickToken,
  onReview,
}: AmountStepProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

  return (
    <ScrollView contentContainerStyle={styles.amountStep}>
      <Pressable onPress={onPickToken} style={styles.tokenPicker}>
        <TokenGlyph symbol={token.symbol} color={token.color} size={32} />
        <AppText weight="bold" size={15}>
          {token.symbol}
        </AppText>
        <Icon name="chevronD" size={16} color={theme.colors.textMuted} />
      </Pressable>

      <View style={styles.amountDisplay}>
        <View style={styles.amountRow}>
          <AppText
            weight="bold"
            size={52}
            tnum
            color={amtNum > 0 ? theme.colors.text : theme.colors.textFaint}
            style={styles.amountText}
          >
            {amt}
          </AppText>
          <AppText size={26} muted>
            {token.symbol}
          </AppText>
        </View>
        <AppText size={16} muted tnum style={styles.fiatText}>
          {t("send.amount.demoApprox", { value: fmtUSD(fiat) })}
        </AppText>
        <Pressable onPress={onMax} style={styles.maxButton}>
          <AppText weight="semibold" size={13.5} muted>
            {t("send.amount.max")} ·
          </AppText>
          <AppText weight="semibold" size={13.5} muted tnum>
            {fmtToken(token.amount, token.symbol)}
          </AppText>
        </Pressable>
      </View>

      <NumberPad onKey={onKey} />
      <View style={styles.amountCta}>
        <Button
          label={amtNum > token.amount ? t("send.amount.insufficient") : t("send.amount.review")}
          disabled={amtNum <= 0 || amtNum > token.amount}
          onPress={onReview}
        />
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    amountStep: {
      flexGrow: 1,
      padding: theme.spacing.pad,
    },
    tokenPicker: {
      alignSelf: "center",
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      height: 44,
      paddingLeft: 6,
      paddingRight: 14,
      borderRadius: 99,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.hairline,
      marginBottom: 8,
    },
    amountDisplay: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    amountRow: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 8,
    },
    amountText: {
      letterSpacing: -1.6,
    },
    fiatText: {
      marginTop: 8,
    },
    maxButton: {
      marginTop: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      height: 36,
      paddingHorizontal: 13,
      borderRadius: theme.radius.chip,
      backgroundColor: theme.colors.surface2,
      borderWidth: 1,
      borderColor: theme.colors.hairline,
    },
    amountCta: {
      paddingTop: 12,
    },
  });
