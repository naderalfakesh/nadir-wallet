import React, { useMemo } from "react";
import { AppText, Row, StatusPill, TxIcon } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { useTheme } from "@/theme";
import { fmtUSD } from "@/utils/format";
import { getTransactionAmount, getTransactionVerbs } from "../transactions";
import type { PortfolioTransaction } from "../types";

interface TransactionRowProps {
  tx: PortfolioTransaction;
  subtitle: React.ReactNode;
  last?: boolean;
  iconSize?: number;
  showValue?: boolean;
  onPress?: () => void;
}

export function TransactionRow({
  tx,
  subtitle,
  last,
  iconSize,
  showValue = true,
  onPress,
}: TransactionRowProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const verbs = useMemo(() => getTransactionVerbs(t), [t]);
  const amount = getTransactionAmount(tx, theme);

  const rightSub = !showValue ? undefined : tx.status !== "confirmed" ? (
    <StatusPill status={tx.status} />
  ) : (
    <AppText size={13} muted tnum>
      {fmtUSD(tx.fiat)}
    </AppText>
  );

  return (
    <Row
      last={last}
      onPress={onPress}
      left={<TxIcon type={tx.type} size={iconSize} />}
      title={`${verbs[tx.type]} ${tx.token}`}
      sub={subtitle}
      right={
        <AppText weight="semibold" size={15.5} tnum color={amount.color} style={amount.style}>
          {amount.prefix}
          {amount.text}
        </AppText>
      }
      rightSub={rightSub}
    />
  );
}
