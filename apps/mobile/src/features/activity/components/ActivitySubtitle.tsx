import React from "react";
import { AppText } from "@/components";
import { getTransactionTime } from "@/features/wallet/transactions";
import type { PortfolioTransaction } from "@/features/wallet/types";
import { useTranslation } from "@/i18n/useTranslation";
import { getActivitySubtitle } from "../activity.utils";

interface ActivitySubtitleProps {
  tx: PortfolioTransaction;
}

// Addresses use the mono font because the display font renders "x" in "0x..." as a multiplication sign.
export function ActivitySubtitle({ tx }: ActivitySubtitleProps) {
  const { t } = useTranslation();
  if (!tx.party.startsWith("0x")) {
    return (
      <AppText size={13} muted numberOfLines={1}>
        {getActivitySubtitle(tx, t)}
      </AppText>
    );
  }
  return (
    <AppText size={13} muted numberOfLines={1}>
      {tx.type === "receive" ? t("activity.from") : t("activity.to")}
      <AppText mono size={12.5} muted>
        {tx.party}
      </AppText>
      {`  ·  ${getTransactionTime(tx)}`}
    </AppText>
  );
}
