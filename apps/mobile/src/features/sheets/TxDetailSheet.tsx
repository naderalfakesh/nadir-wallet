import React, { useState } from "react";
import { View } from "react-native";
import { SheetHeader, AppText, Button, Card, Row, Icon, TxIcon, StatusPill } from "@/components";
import { useTheme, alpha } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { copyText, openExplorer } from "@/services/device";
import { fmtUSD, fmtToken, shortAddr } from "@/utils/format";
import { CHAINS, TRANSACTIONS, type TxType } from "@/features/wallet/data";
import type { SheetBodyProps } from "./types";

export function TxDetailSheet({ params, close }: SheetBodyProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const id = params?.id as string | undefined;
  const tx = TRANSACTIONS.find((x) => x.id === id) ?? TRANSACTIONS[0];
  const incoming = tx.type === "receive";
  const chain = CHAINS[tx.chain];
  const verb: Record<TxType, string> = {
    receive: t("activity.verb.receive"),
    send: t("activity.verb.send"),
    swap: t("activity.verb.swap"),
  };
  const amtColor = tx.status === "failed" ? theme.colors.textFaint : incoming ? theme.colors.pos : theme.colors.text;
  const partyLabel = tx.type === "swap" ? t("tx.pair") : incoming ? t("tx.from") : t("tx.to");

  return (
    <View>
      <SheetHeader title={t("tx.title")} onClose={close} />

      <View style={{ alignItems: "center", paddingBottom: 8 }}>
        <TxIcon type={tx.type} size={60} />
        <AppText weight="semibold" size={15} muted style={{ marginTop: 12 }}>
          {verb[tx.type]} {tx.token}
        </AppText>
        <AppText
          weight="bold"
          size={30}
          tnum
          color={amtColor}
          style={[{ marginTop: 4 }, tx.status === "failed" ? { textDecorationLine: "line-through" } : null]}
        >
          {incoming ? "+" : "−"}
          {fmtToken(tx.amount, tx.token)}
        </AppText>
        <AppText size={14} muted tnum style={{ marginTop: 3 }}>
          {fmtUSD(tx.fiat)}
        </AppText>
        <View style={{ marginTop: 12 }}>
          <StatusPill status={tx.status} />
        </View>
      </View>

      {tx.status === "failed" && tx.failReason && (
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            marginTop: 14,
            padding: 13,
            borderRadius: 14,
            backgroundColor: alpha(theme.colors.neg, 0.12),
            borderWidth: 1,
            borderColor: alpha(theme.colors.neg, 0.28),
          }}
        >
          <Icon name="alert" size={19} color={theme.colors.neg} />
          <AppText size={12.5} muted style={{ flex: 1, lineHeight: 18 }}>
            {tx.failReason}
          </AppText>
        </View>
      )}

      <Card padding={0} style={{ paddingHorizontal: 16, marginTop: 16 }}>
        <Row title={partyLabel} right={<AppText mono size={13.5}>{tx.party}</AppText>} />
        <Row title={t("tx.network")} right={chain.name} />
        <Row title={t("tx.date")} right={tx.when} />
        <Row title={t("tx.fee")} right={fmtUSD(tx.fee)} />
        {tx.status === "confirmed" && (
          <Row title={t("tx.confirmations")} right={<AppText size={15.5} tnum>{tx.confirmations.toLocaleString()}</AppText>} />
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
            <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
              <AppText mono size={13}>
                {shortAddr(tx.hash, 8, 6)}
              </AppText>
              <Icon name={copied ? "check" : "copy"} size={16} color={copied ? theme.colors.pos : theme.colors.textFaint} />
            </View>
          }
        />
      </Card>

      <Button
        label={t("tx.viewOn", { explorer: chain.explorerName })}
        icon="external"
        variant="ghost"
        style={{ marginTop: 14 }}
        onPress={() => void openExplorer(chain.explorerHost, `tx/${tx.hash}`)}
      />
    </View>
  );
}
