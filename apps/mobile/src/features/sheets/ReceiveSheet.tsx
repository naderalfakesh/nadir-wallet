import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { SheetHeader, AppText, Button, Icon, QRCode, TestnetBadge } from "@/components";
import { useTheme, alpha } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { copyText, shareText } from "@/services/device";
import { useApp } from "@/providers/AppProvider";
import { CHAINS, TOKENS, type ChainId } from "@/features/wallet/data";
import type { SheetBodyProps } from "./types";

export function ReceiveSheet({ params, close }: SheetBodyProps<"receive">) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { prefs } = useApp();
  const address = prefs.walletAddress;
  const symbol = params?.token;
  const initialChain = symbol ? (TOKENS.find((x) => x.symbol === symbol)?.chain ?? "ethereum") : "ethereum";
  const [chain, setChain] = useState<ChainId>(initialChain);
  const [copied, setCopied] = useState(false);
  const ch = CHAINS[chain];

  return (
    <View>
      <SheetHeader title={t("receive.title")} subtitle={t("receive.sub")} onClose={close} />

      <View style={{ alignItems: "center", marginBottom: 14 }}>
        <TestnetBadge label={t("receive.testnetBadge", { chain: ch.name })} />
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {Object.values(CHAINS).map((c) => {
          const on = chain === c.id;
          return (
            <Pressable
              key={c.id}
              onPress={() => setChain(c.id)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 7,
                height: 36,
                paddingHorizontal: 13,
                borderRadius: theme.radius.chip,
                backgroundColor: on ? alpha(theme.colors.accent, 0.15) : theme.colors.surface2,
                borderWidth: 1,
                borderColor: on ? "transparent" : theme.colors.hairline,
              }}
            >
              <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: c.color }} />
              <AppText weight="semibold" size={13.5} color={on ? theme.colors.accent : theme.colors.textMuted}>
                {c.name}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <View style={{ alignItems: "center" }}>
        <View style={{ padding: 16, backgroundColor: "#fff", borderRadius: 22 }}>
          <QRCode value={address} size={188} />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 16 }}>
          <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: ch.color }} />
          <AppText weight="semibold" size={13.5} muted>
            {t("receive.addressLabel", { chain: ch.name })}
          </AppText>
        </View>
      </View>

      <View
        style={{
          marginTop: 14,
          padding: 16,
          borderRadius: theme.radius.card,
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.hairline,
        }}
      >
        <AppText mono size={13} style={{ lineHeight: 20 }}>
          {address}
        </AppText>
      </View>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
        <Button
          label={copied ? t("common.actions.copied") : t("common.actions.copy")}
          icon={copied ? "check" : "copy"}
          variant="ghost"
          height={52}
          style={{ flex: 1 }}
          onPress={() => {
            void copyText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        />
        <Button label={t("common.actions.share")} icon="external" height={52} style={{ flex: 1 }} onPress={() => void shareText(address)} />
      </View>

      <View style={{ flexDirection: "row", gap: 9, marginTop: 14, paddingHorizontal: 2 }}>
        <Icon name="info" size={16} color={theme.colors.textFaint} />
        <AppText faint size={12} style={{ flex: 1, lineHeight: 17 }}>
          {t("receive.warning", { chain: ch.name })}
        </AppText>
      </View>
    </View>
  );
}
