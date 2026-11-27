import React from "react";
import { StyleSheet, View } from "react-native";
import { AppText, Icon, StatusPill, TxIcon } from "@/components";
import { getTransactionAmount, getTransactionVerbs } from "@/features/wallet/transactions";
import type { PortfolioTransaction } from "@/features/wallet/types";
import { useTranslation } from "@/i18n/useTranslation";
import { alpha, useTheme, useThemedStyles, type Theme } from "@/theme";
import { fmtUSD } from "@/utils/format";

interface TxDetailHeroProps {
  tx: PortfolioTransaction;
}

export function TxDetailHero({ tx }: TxDetailHeroProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const verbs = getTransactionVerbs(t);
  const amount = getTransactionAmount(tx, theme);

  return (
    <>
      <View style={styles.hero}>
        <TxIcon type={tx.type} size={60} />
        <AppText weight="semibold" size={15} muted style={styles.verb}>
          {verbs[tx.type]} {tx.token}
        </AppText>
        <AppText
          weight="bold"
          size={30}
          tnum
          color={amount.color}
          style={[styles.amount, amount.style]}
        >
          {amount.prefix}
          {amount.text}
        </AppText>
        <AppText size={14} muted tnum style={styles.fiat}>
          {fmtUSD(tx.fiat)}
        </AppText>
        <View style={styles.pill}>
          <StatusPill status={tx.status} />
        </View>
      </View>

      {tx.status === "failed" && tx.failReason && (
        <View style={styles.failBox}>
          <Icon name="alert" size={19} color={theme.colors.neg} />
          <AppText size={12.5} muted style={styles.failText}>
            {tx.failReason}
          </AppText>
        </View>
      )}
    </>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    hero: {
      alignItems: "center",
      paddingBottom: 8,
    },
    verb: {
      marginTop: 12,
    },
    amount: {
      marginTop: 4,
    },
    fiat: {
      marginTop: 3,
    },
    pill: {
      marginTop: 12,
    },
    failBox: {
      flexDirection: "row",
      gap: 10,
      marginTop: 14,
      padding: 13,
      borderRadius: 14,
      backgroundColor: alpha(theme.colors.neg, 0.12),
      borderWidth: 1,
      borderColor: alpha(theme.colors.neg, 0.28),
    },
    failText: {
      flex: 1,
      lineHeight: 18,
    },
  });
