import React from "react";
import { StyleSheet, View } from "react-native";
import {
  AppText,
  ChangeBadge,
  PriceFreshness,
  Segmented,
  Skeleton,
  Sparkline,
  TestnetBadge,
} from "@/components";
import { getDemoChart } from "@/features/wallet/chart";
import { RANGES, type Range } from "@/features/wallet/chart";
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
  const balanceValue = getBalanceValue(total, hidden, priceUnavailable, t("home.valueUnavailable"));
  const chart = getDemoChart("portfolio", range, change);
  const changeValue = getBalanceChange(total, chart.change, hidden);
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
              <ChangeBadge pct={chart.change} />
              <AppText size={14} muted tnum>
                {changeValue} · {t("home.demoHistory", { range })}
              </AppText>
            </View>
          )}
          <PriceFreshness status={priceStatus} onRetry={onRetry} />
          {!priceUnavailable && (
            <>
              <View style={[styles.chartWrap, { opacity: chartOpacity }]}>
                <Sparkline data={chart.data} up={chart.change >= 0} height={92} />
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
