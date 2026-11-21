import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, AppText, Icon, Toggle } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { useDemoState } from "@/providers/DemoStateProvider";
import { useWallet } from "@/providers/WalletDataProvider";
import { useTheme, alpha } from "@/theme";
import type { BackendStatus, PriceStatus, SendOutcome, SendSim } from "@/types/status";
import { Choice } from "./Choice";

export function DemoControls() {
  const theme = useTheme();
  const { t } = useTranslation();
  const {
    liveApi,
    backend,
    price,
    sendSim,
    sendOutcome,
    setLiveApi,
    setBackend,
    setPrice,
    setSendSim,
    setSendOutcome,
  } = useDemoState();
  const { backend: liveBackend } = useWallet();
  const apiOnline = liveBackend === "online";

  return (
    <Card padding={16}>
      <View style={styles.noteRow}>
        <Icon name="radar" size={16} color={theme.colors.textFaint} />
        <AppText faint size={12} style={styles.noteText}>
          {t("settings.demo.note")}
        </AppText>
      </View>

      <View style={styles.liveRow}>
        <View style={styles.liveInfo}>
          <AppText weight="semibold" size={14}>
            {t("settings.demo.liveApi")}
          </AppText>
          <AppText size={12} muted style={styles.liveSub}>
            {liveApi ? t("settings.demo.liveOn") : t("settings.demo.liveOff")}
          </AppText>
        </View>
        <Toggle
          testID="live-api-data"
          label={t("settings.demo.liveApi")}
          on={liveApi}
          onChange={() => setLiveApi(!liveApi)}
        />
      </View>

      {liveApi ? (
        <View
          style={[
            styles.apiStatus,
            { backgroundColor: alpha(apiOnline ? theme.colors.pos : theme.colors.warn, 0.12) },
          ]}
        >
          <View
            style={[
              styles.apiDot,
              { backgroundColor: apiOnline ? theme.colors.pos : theme.colors.warn },
            ]}
          />
          <AppText
            size={12}
            color={apiOnline ? theme.colors.pos : theme.colors.warn}
            weight="semibold"
          >
            {apiOnline ? t("settings.demo.apiOnline") : t("settings.demo.apiOffline")}
          </AppText>
        </View>
      ) : (
        <View style={styles.simulated}>
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

      <View style={styles.outcome}>
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

const styles = StyleSheet.create({
  noteRow: {
    flexDirection: "row",
    gap: 9,
    marginBottom: 14,
  },
  noteText: {
    flex: 1,
    lineHeight: 17,
  },
  liveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  liveInfo: {
    flex: 1,
  },
  liveSub: {
    marginTop: 1,
  },
  apiStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
  },
  apiDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  simulated: {
    gap: 14,
    marginTop: 16,
  },
  outcome: {
    marginTop: 16,
  },
});
