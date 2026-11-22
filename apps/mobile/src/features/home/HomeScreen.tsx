import React, { useCallback, useRef, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Screen } from "@/components";
import { beginScan } from "@/features/scan/scanBridge";
import type { ScanTarget } from "@/features/scan/scanPayload";
import { pickTokenForScan } from "@/features/send/send.utils";
import { handOffScanToSend } from "@/features/send/sendHandoff";
import type { Range } from "@/features/wallet/chart";
import { tokenById } from "@/features/wallet/demoData";
import { useTranslation } from "@/i18n/useTranslation";
import { useApp } from "@/providers/AppProvider";
import { useSheets } from "@/providers/SheetProvider";
import { useWallet } from "@/providers/WalletDataProvider";
import { useTheme } from "@/theme";
import { AccountBar } from "./components/AccountBar";
import { BackupReminder } from "./components/BackupReminder";
import { BalanceSummary } from "./components/BalanceSummary";
import { QuickActions } from "./components/QuickActions";
import { RecentActivity } from "./components/RecentActivity";
import { TokenList } from "./components/TokenList";
import type { HomeQuickAction } from "./home.types";
import { isPriceUnavailable } from "./home.utils";

export function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const sheets = useSheets();
  const { tokens, transactions, total, change, backend, price, refresh, loading, initialLoading } =
    useWallet();
  const { prefs, setPref } = useApp();
  const [range, setRange] = useState<Range>("1W");
  const hidden = prefs.hideBalances;
  const recent = transactions.slice(0, 3);
  const priceUnavailable = isPriceUnavailable(price);

  // The scanner pops itself after a hit; Send opens once Home has focus again,
  // so that pop can't close it.
  const scanned = useRef<ScanTarget | null>(null);
  useFocusEffect(
    useCallback(() => {
      const target = scanned.current;
      if (!target) return;
      scanned.current = null;
      handOffScanToSend(target);
      router.push("/send");
    }, [router]),
  );
  const openScanner = () => {
    scanned.current = null;
    beginScan(
      (target) => {
        scanned.current = target;
      },
      (target) => {
        const pick = pickTokenForScan(target, tokens, tokenById("eth"));
        return pick.ok ? null : pick.reason;
      },
    );
    router.push("/scan");
  };

  const quickActions: HomeQuickAction[] = [
    { icon: "receive", label: t("common.actions.receive"), onPress: () => sheets.open("receive") },
    {
      icon: "send",
      label: t("common.actions.send"),
      primary: true,
      onPress: () => router.push("/send"),
    },
    {
      icon: "swap",
      label: t("common.actions.swap"),
      onPress: () => sheets.open("soon", { title: t("common.soon.swap") }),
    },
    {
      icon: "trend",
      label: t("common.actions.buy"),
      onPress: () => sheets.open("soon", { title: t("common.soon.buy") }),
    },
  ];

  return (
    <Screen bottomInset={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading && !initialLoading}
            onRefresh={refresh}
            tintColor={theme.colors.accent}
          />
        }
      >
        <AccountBar
          hidden={hidden}
          onToggleBalances={() => setPref("hideBalances", !hidden)}
          onOpenAccounts={() => sheets.open("accounts")}
          onOpenScan={openScanner}
        />

        <BalanceSummary
          hidden={hidden}
          priceStatus={price}
          backendStatus={backend}
          total={total}
          change={change}
          range={range}
          loading={initialLoading}
          onRetry={refresh}
          onRangeChange={setRange}
        />

        <QuickActions actions={quickActions} />

        {!prefs.backupConfirmed && <BackupReminder onPress={() => router.push("/backup")} />}

        <TokenList
          loading={initialLoading}
          onManage={() => sheets.open("soon", { title: t("home.manageTokens") })}
          tokens={tokens}
          hidden={hidden}
          priceUnavailable={priceUnavailable}
          onTokenPress={(tokenId) => router.push(`/token/${tokenId}`)}
        />

        <RecentActivity
          transactions={recent}
          onSeeAll={() => router.navigate("/activity")}
          onTransactionPress={(id) => sheets.open("txDetail", { id })}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 16,
  },
});
