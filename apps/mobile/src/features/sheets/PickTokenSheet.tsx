import React from "react";
import { StyleSheet, View } from "react-native";
import { SheetHeader, AppText, Card, Row, TokenGlyph } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { useWallet } from "@/providers/WalletDataProvider";
import { useTheme } from "@/theme";
import { fmtUSD, fmtToken } from "@/utils/format";
import type { SheetBodyProps } from "./types";

export function PickTokenSheet({ params, close }: SheetBodyProps<"pickToken">) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { tokens } = useWallet();
  const current = params?.current;
  const onPick = params?.onPick;

  return (
    <View>
      <SheetHeader title={t("sheets.pickToken.title")} onClose={close} />
      <Card padding={0} style={styles.cardInset}>
        {tokens.map((token, i) => (
          <Row
            key={token.id}
            last={i === tokens.length - 1}
            onPress={() => {
              onPick?.(token);
              close();
            }}
            left={<TokenGlyph symbol={token.symbol} color={token.color} />}
            title={token.name}
            sub={
              <AppText size={13} muted tnum>
                {fmtToken(token.amount, token.symbol)}
              </AppText>
            }
            right={fmtUSD(token.value)}
            rightSub={
              current === token.id ? (
                <AppText weight="semibold" size={12} color={theme.colors.accent}>
                  {t("sheets.pickToken.selected")}
                </AppText>
              ) : undefined
            }
          />
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  cardInset: {
    paddingHorizontal: 16,
  },
});
