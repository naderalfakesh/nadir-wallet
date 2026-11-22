import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  AppText,
  ChangeBadge,
  PriceFreshness,
  Segmented,
  Skeleton,
  ScrubbableChart,
  TestnetBadge,
} from "@/components";
import {
  RANGES,
  changeAtPoint,
  formatChartTime,
  getChartTimestamps,
  getDemoChart,
  valueAtPoint,
  type Range,
} from "@/features/wallet/chart";
import { useTranslation } from "@/i18n/useTranslation";
import { useThemedStyles, type Theme } from "@/theme";
import type { BackendStatus, PriceStatus } from "@/types/status";
import { getBalanceChange, getBalanceValue } from "../home.utils";

interface BalanceSummaryProps {
  hidden: boolean;
  priceStatus: PriceStatus;
  backendStatus: BackendStatus;
  total: number;
  change: number;
  range: Range;
  loading: boolean;
  onRetry: () => void;
  onRangeChange: (range: Range) => void;
}

export function BalanceSummary({
  hidden,
  priceStatus,
  backendStatus,
  total,
  change,
  range,
  loading,
  onRetry,
  onRangeChange,
}: BalanceSummaryProps) {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const priceUnavailable = priceStatus === "unavailable";
  const chart = getDemoChart("portfolio", range, change);
  const [scrub, setScrub] = useState<{ range: Range; index: number; now: number } | null>(null);
  const active = scrub && scrub.range === range ? scrub : null;
  const shownTotal = active ? valueAtPoint(total, chart.data, active.index) : total;
  const shownPct = active ? changeAtPoint(chart.data, active.index) : chart.change;
  const historyLabel = active
    ? formatChartTime(
        getChartTimestamps(range, chart.data.length, active.now)[active.index],
        range,
        new Date(active.now),
      )
    : t("home.demoHistory", { range });
  const balanceValue = getBalanceValue(
    shownTotal,
    hidden,
    priceUnavailable,
    t("home.valueUnavailable"),
  );
  const changeValue = getBalanceChange(shownTotal, shownPct, hidden);
  const chartOpacity = backendStatus === "rpc_unavailable" ? 0.4 : 1;

  return (
    <View style={styles.balanceWrap}>
      <View style={styles.balanceHeader}>
        <AppText weight="semibold" size={13.5} muted>
          {t("home.totalBalance")}
        </AppText>
        <TestnetBadge label={t("common.testnet.badge")} />
      </View>
      {loading ? (
        <Skeleton width="56%" height={52} />
      ) : (
        <>
          <AppText
            weight="bold"
            size={priceUnavailable ? 26 : 44}
            muted={priceUnavailable}
            tnum={!priceUnavailable}
            style={priceUnavailable ? styles.unavailableValue : styles.balanceValue}
          >
            {balanceValue}
          </AppText>
          {!priceUnavailable && (
            <View style={styles.changeRow}>
              <ChangeBadge pct={shownPct} />
              <AppText size={14} muted tnum>
                {changeValue} · {historyLabel}
              </AppText>
            </View>
          )}
          <PriceFreshness status={priceStatus} onRetry={onRetry} />
          {!priceUnavailable && (
            <>
              <View style={[styles.chartWrap, { opacity: chartOpacity }]}>
                <ScrubbableChart
                  data={chart.data}
                  up={chart.change >= 0}
                  height={92}
                  onScrub={(index) =>
                    setScrub(index === null ? null : { range, index, now: Date.now() })
                  }
                />
              </View>
              <Segmented options={RANGES} value={range} onChange={onRangeChange} small />
            </>
          )}
        </>
      )}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    balanceWrap: {
      paddingHorizontal: theme.spacing.pad,
      paddingTop: 10,
    },
    balanceHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    unavailableValue: {
      letterSpacing: -0.6,
    },
    balanceValue: {
      letterSpacing: -1.4,
    },
    changeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      marginTop: 11,
    },
    chartWrap: {
      marginTop: 18,
      marginBottom: 12,
    },
  });
