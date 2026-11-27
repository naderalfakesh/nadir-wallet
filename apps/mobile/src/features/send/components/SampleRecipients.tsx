import React from "react";
import { StyleSheet } from "react-native";
import { AppText, Card, Row, SectionLabel } from "@/components";
import { CHAINS } from "@/features/wallet/chains";
import { RECIPIENTS } from "@/features/wallet/demoData";
import { useTranslation } from "@/i18n/useTranslation";
import { shortAddr } from "@/utils/format";
import { RecipientIcon } from "./RecipientIcon";

interface SampleRecipientsProps {
  onSelect: (address: string) => void;
}

export function SampleRecipients({ onSelect }: SampleRecipientsProps) {
  const { t } = useTranslation();

  return (
    <>
      <SectionLabel>{t("send.to.samples")}</SectionLabel>
      <Card padding={0} style={styles.card}>
        {RECIPIENTS.map((recipient, index) => (
          <Row
            key={recipient.addr}
            last={index === RECIPIENTS.length - 1}
            onPress={() => onSelect(recipient.addr)}
            left={<RecipientIcon flagged={recipient.flagged} />}
            title={
              recipient.label ?? (
                <AppText mono weight="semibold" size={15} numberOfLines={1}>
                  {shortAddr(recipient.addr, 8, 6)}
                </AppText>
              )
            }
            sub={
              recipient.label ? (
                <AppText mono size={13} muted>
                  {shortAddr(recipient.addr, 8, 6)}
                </AppText>
              ) : (
                <AppText size={13} faint>
                  {CHAINS[recipient.network].name}
                </AppText>
              )
            }
            chevron
          />
        ))}
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 16,
  },
});
