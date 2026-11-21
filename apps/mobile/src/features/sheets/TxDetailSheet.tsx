import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SheetHeader, AppText, Card, Row, Icon, TxIcon, StatusPill } from "@/components";
import { CHAINS } from "@/features/wallet/data";
import { getTransactionAmount, getTransactionVerbs } from "@/features/wallet/transactions";
import { useTranslation } from "@/i18n/useTranslation";
import { useWallet } from "@/providers/WalletDataProvider";
import { copyText } from "@/services/device";
import { useTheme, useThemedStyles, alpha, type Theme } from "@/theme";
import { fmtUSD, shortAddr } from "@/utils/format";
import type { SheetBodyProps } from "./types";

export function TxDetailSheet({ params, close }: SheetBodyProps<"txDetail">) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const { transactions } = useWallet();
  const [copied, setCopied] = useState(false);

  const tx = transactions.find((x) => x.id === params.id) ?? transactions[0];
  const incoming = tx.type === "receive";
  const chain = CHAINS[tx.chain];
  const verbs = getTransactionVerbs(t);
  const amount = getTransactionAmount(tx, theme);
  const partyLabel = tx.type === "swap" ? t("tx.pair") : incoming ? t("tx.from") : t("tx.to");

  return (
    <View>
      <SheetHeader title={t("tx.title")} onClose={close} />

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

      <Card padding={0} style={styles.detailCard}>
        <Row
          title={partyLabel}
          right={
            tx.party.startsWith("0x") ? (
              <AppText mono size={13.5}>
                {tx.party}
              </AppText>
            ) : (
              tx.party
            )
          }
        />
        <Row title={t("tx.network")} right={chain.name} />
        <Row title={t("tx.date")} right={tx.when} />
        {tx.type !== "receive" && <Row title={t("tx.fee")} right={fmtUSD(tx.fee)} />}
        {tx.status === "confirmed" && (
          <Row
            title={t("tx.confirmations")}
            right={
              <AppText size={15.5} tnum>
                {tx.confirmations.toLocaleString()}
              </AppText>
            }
          />
        )}
        <Row
          title={t("tx.hash")}
          last
          onPress={() => {
            void copyText(tx.hash);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          right={
            <View style={styles.hashRight}>
              <AppText mono size={13}>
                {shortAddr(tx.hash, 8, 6)}
              </AppText>
              <Icon
                name={copied ? "check" : "copy"}
                size={16}
                color={copied ? theme.colors.pos : theme.colors.textFaint}
              />
            </View>
          }
        />
      </Card>

      <AppText size={12.5} faint style={styles.demoNote}>
        {t("tx.demoNote")}
      </AppText>
    </View>
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
    detailCard: {
      paddingHorizontal: 16,
      marginTop: 16,
    },
    hashRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },
    demoNote: {
      marginTop: 12,
      textAlign: "center",
    },
  });
