import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, AppText, Icon } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { useDemoState } from "@/providers/DemoStateProvider";
import { useWallet } from "@/providers/WalletDataProvider";
import { useTheme, alpha } from "@/theme";
import type { BackendStatus, PriceStatus, SendOutcome, SendSim } from "@/types/status";
import { Choice } from "./Choice";

type DataSource = "sample" | "live";

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
  const { apiReachable } = useWallet();

  const status = !liveApi
    ? { text: t("settings.demo.statusSample"), color: theme.colors.textFaint, neutral: true }
    : apiReachable === false
      ? { text: t("settings.demo.statusUnreachable"), color: theme.colors.warn, neutral: false }
      : { text: t("settings.demo.statusConnected"), color: theme.colors.pos, neutral: false };

  return (
    <Card padding={16}>
      <View style={styles.noteRow}>
        <Icon name="radar" size={16} color={theme.colors.textFaint} />
        <AppText faint size={12} style={styles.noteText}>
          {t("settings.demo.note")}
        </AppText>
      </View>

      <Choice<DataSource>
        label={t("settings.demo.dataSource")}
        value={liveApi ? "live" : "sample"}
        onChange={(source) => setLiveApi(source === "live")}
        options={[
          { value: "sample", label: t("settings.demo.sampleData"), testID: "live-api-data" },
          { value: "live", label: t("settings.demo.liveApi"), testID: "live-api-on" },
        ]}
      />
      <View
        style={[
          styles.status,
          { backgroundColor: alpha(status.color, status.neutral ? 0.08 : 0.12) },
        ]}
      >
        <View style={[styles.statusDot, { backgroundColor: status.color }]} />
        <AppText size={12} color={status.color} weight="semibold" style={styles.statusText}>
          {status.text}
        </AppText>
      </View>

      <View style={styles.group}>
        <AppText weight="bold" size={13}>
          {t("settings.demo.simulate")}
        </AppText>
        <Choice<SendSim>
          label={t("settings.demo.sim")}
          value={sendSim}
          onChange={setSendSim}
          options={[
            { value: "pass", label: t("settings.demo.simPass") },
            { value: "fail", label: t("settings.demo.simFail") },
          ]}
        />
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

      {!liveApi && (
        <View style={styles.group}>
          <AppText weight="bold" size={13}>
            {t("settings.demo.outages")}
          </AppText>
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
        </View>
      )}
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
  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    flex: 1,
  },
  group: {
    gap: 12,
    marginTop: 20,
  },
});
