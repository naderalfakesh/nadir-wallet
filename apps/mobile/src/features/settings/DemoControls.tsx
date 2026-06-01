import React from "react";
import { Pressable, View } from "react-native";
import { Card, AppText, Icon, Toggle } from "@/components";
import { useTheme, alpha } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { useDemoState } from "@/providers/DemoStateProvider";
import { useWallet } from "@/providers/WalletDataProvider";
import type { BackendStatus, PriceStatus } from "@/types/status";
import type { SendSim, SendOutcome } from "@/providers/DemoStateProvider";

function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const theme = useTheme();
  return (
    <View style={{ gap: 8 }}>
      <AppText weight="semibold" size={12.5} muted>
        {label}
      </AppText>
      <View style={{ flexDirection: "row", backgroundColor: theme.colors.surface2, borderRadius: 12, padding: 3, gap: 2 }}>
        {options.map((o) => {
          const on = o.value === value;
          return (
            <Pressable
              key={o.value}
              onPress={() => onChange(o.value)}
              style={{
                flex: 1,
                height: 32,
                borderRadius: 9,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: on ? theme.colors.surface3 : "transparent",
              }}
            >
              <AppText weight="semibold" size={12.5} color={on ? theme.colors.text : theme.colors.textFaint}>
                {o.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function DemoControls() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { liveApi, backend, price, sendSim, sendOutcome, setLiveApi, setBackend, setPrice, setSendSim, setSendOutcome } =
    useDemoState();
  const { backend: liveBackend } = useWallet();
  const apiOnline = liveBackend === "online";

  return (
    <Card padding={16}>
      <View style={{ flexDirection: "row", gap: 9, marginBottom: 14 }}>
        <Icon name="radar" size={16} color={theme.colors.textFaint} />
        <AppText faint size={12} style={{ flex: 1, lineHeight: 17 }}>
          {t("settings.demo.note")}
        </AppText>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <AppText weight="semibold" size={14}>
            {t("settings.demo.liveApi")}
          </AppText>
          <AppText size={12} muted style={{ marginTop: 1 }}>
            {liveApi ? t("settings.demo.liveOn") : t("settings.demo.liveOff")}
          </AppText>
        </View>
        <Toggle on={liveApi} onChange={() => setLiveApi(!liveApi)} />
      </View>

      {liveApi ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginTop: 12,
            padding: 10,
            borderRadius: 12,
            backgroundColor: alpha(apiOnline ? theme.colors.pos : theme.colors.warn, 0.12),
          }}
        >
          <View
            style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: apiOnline ? theme.colors.pos : theme.colors.warn }}
          />
          <AppText size={12} color={apiOnline ? theme.colors.pos : theme.colors.warn} weight="semibold">
            {apiOnline ? t("settings.demo.apiOnline") : t("settings.demo.apiOffline")}
          </AppText>
        </View>
      ) : (
        <View style={{ gap: 14, marginTop: 16 }}>
          <Choice<BackendStatus>
            label={t("settings.demo.backend")}
            value={backend}
            onChange={setBackend}
            options={[
              { value: "online", label: t("settings.demo.backendOnline") },
              { value: "api_unavailable", label: t("settings.demo.backendApi") },
              { value: "rpc_unavailable", label: t("settings.demo.backendRpc") },
            ]}
          />
          <Choice<PriceStatus>
            label={t("settings.demo.price")}
            value={price}
            onChange={setPrice}
            options={[
              { value: "fresh", label: t("settings.demo.priceFresh") },
              { value: "stale", label: t("settings.demo.priceStale") },
              { value: "unavailable", label: t("settings.demo.priceNone") },
            ]}
          />
          <Choice<SendSim>
            label={t("settings.demo.sim")}
            value={sendSim}
            onChange={setSendSim}
            options={[
              { value: "pass", label: t("settings.demo.simPass") },
              { value: "fail", label: t("settings.demo.simFail") },
            ]}
          />
        </View>
      )}

      <View style={{ marginTop: 16 }}>
        <Choice<SendOutcome>
          label={t("settings.demo.outcome")}
          value={sendOutcome}
          onChange={setSendOutcome}
          options={[
            { value: "success", label: t("settings.demo.outcomeSuccess") },
            { value: "pending", label: t("settings.demo.outcomePending") },
            { value: "failed", label: t("settings.demo.outcomeFailed") },
          ]}
        />
      </View>
    </Card>
  );
}
