import React from "react";
import { StyleSheet, View } from "react-native";
import { AppText, Card, Icon, Row, SheetHeader } from "@/components";
import { CHAINS } from "@/features/wallet/chains";
import { useCopyFeedback } from "@/hooks";
import { useTranslation } from "@/i18n/useTranslation";
import { useWallet } from "@/providers/WalletDataProvider";
import { useTheme } from "@/theme";
import { fmtUSD, shortAddr } from "@/utils/format";
import { TxDetailHero } from "./components/TxDetailHero";
import type { SheetBodyProps } from "./types";

export function TxDetailSheet({ params, close }: SheetBodyProps<"txDetail">) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { transactions } = useWallet();
  const { copied, copy } = useCopyFeedback();

  const tx = transactions.find((item) => item.id === params.id) ?? transactions[0];
  if (!tx) return null;

  const incoming = tx.type === "receive";
  const chain = CHAINS[tx.chain];
  const partyLabel = tx.type === "swap" ? t("tx.pair") : incoming ? t("tx.from") : t("tx.to");

  return (
    <View>
      <SheetHeader title={t("tx.title")} onClose={close} />
      <TxDetailHero tx={tx} />

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
          onPress={() => copy(tx.hash)}
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

const styles = StyleSheet.create({
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
