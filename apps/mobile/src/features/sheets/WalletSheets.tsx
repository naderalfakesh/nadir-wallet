import React from "react";
import { View } from "react-native";
import { SheetHeader, AppText, Button, Card, Row, Icon, TokenGlyph } from "@/components";
import { useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { fmtUSD, fmtToken } from "@/utils/format";
import { displayAddress } from "@/services/wallet/account";
import { useWallet } from "@/providers/WalletDataProvider";
import { useApp } from "@/providers/AppProvider";
import { ACCOUNT, type DemoToken } from "@/features/wallet/data";
import type { SheetBodyProps } from "./types";

export function AccountsSheet({ close }: SheetBodyProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { prefs } = useApp();
  return (
    <View>
      <SheetHeader title={t("sheets.accounts.title")} onClose={close} />
      <Card padding={0} style={{ paddingHorizontal: 16 }}>
        <Row
          last
          left={<View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.accent }} />}
          title={ACCOUNT.label}
          sub={<AppText mono size={13} muted>{displayAddress(prefs.walletAddress)}</AppText>}
          right={<Icon name="checkCircle" size={22} color={theme.colors.accent} />}
        />
      </Card>
      <Button label={t("sheets.accounts.add")} icon="plus" variant="soft" style={{ marginTop: 14 }} onPress={close} />
    </View>
  );
}

export function PickTokenSheet({ params, close }: SheetBodyProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { tokens } = useWallet();
  const current = params?.current as string | undefined;
  const onPick = params?.onPick as ((token: DemoToken) => void) | undefined;

  return (
    <View>
      <SheetHeader title={t("sheets.pickToken.title")} onClose={close} />
      <Card padding={0} style={{ paddingHorizontal: 16 }}>
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
            sub={<AppText size={13} muted tnum>{fmtToken(token.amount, token.symbol)}</AppText>}
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
