import React, { useMemo, useState } from "react";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { useSheets } from "@/providers/SheetProvider";
import { useApp } from "@/providers/AppProvider";
import { useWallet } from "@/providers/WalletDataProvider";
import type { Range } from "@/features/wallet/data";
import { createHomeStyles } from "./HomeScreen.styles";
import {
  AccountBar,
  BackendStatusNotice,
  BackupReminder,
  BalanceSummary,
  QuickActions,
  RecentActivity,
  TokenList,
} from "./HomeScreen.parts";
import { isPriceUnavailable } from "./home.utils";
import type { HomeQuickAction } from "./home.types";
import { useTheme } from "@/theme";

export function HomeScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createHomeStyles(theme), [theme]);
  const router = useRouter();
  const { t } = useTranslation();
  const sheets = useSheets();
  const { tokens, transactions, total, change, backend, price, refresh } = useWallet();
  const { prefs, setPref } = useApp();
  const [range, setRange] = useState<Range>("1W");
  const hidden = prefs.hideBalances;
  const recent = transactions.slice(0, 3);
  const priceUnavailable = isPriceUnavailable(price);

  const quickActions: HomeQuickAction[] = [
    { icon: "receive", label: t("common.actions.receive"), onPress: () => sheets.open("receive") },
    { icon: "send", label: t("common.actions.send"), primary: true, onPress: () => router.push("/send") },
    { icon: "swap", label: t("common.actions.swap"), onPress: () => sheets.open("soon", { title: "Swap" }) },
    { icon: "trend", label: t("common.actions.buy"), onPress: () => sheets.open("soon", { title: "Buy crypto" }) },
  ];

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <AccountBar
          hidden={hidden}
          onToggleBalances={() => setPref("hideBalances", !hidden)}
          onOpenAccounts={() => sheets.open("accounts")}
          onOpenScan={() => sheets.open("scan")}
        />

        <BackendStatusNotice status={backend} onRetry={refresh} />

        <BalanceSummary
          state={{ hidden, priceStatus: price, backendStatus: backend, total, change, range }}
          title={t("home.totalBalance")}
          unavailableLabel={t("home.valueUnavailable")}
          testnetLabel={t("common.testnet.badge")}
          todayLabel={t("home.today")}
          onRetry={refresh}
          onRangeChange={setRange}
        />

        <QuickActions actions={quickActions} />

        {!prefs.backupConfirmed && (
          <BackupReminder
            title={t("home.backup.title")}
            body={t("home.backup.body")}
            onPress={() => router.push("/backup")}
          />
        )}

        <TokenList
          title={t("home.tokens")}
          manageLabel={t("common.actions.manage")}
          state={{ tokens, hidden, priceUnavailable }}
          onTokenPress={(tokenId) => router.push(`/token/${tokenId}`)}
        />

        <RecentActivity
          title={t("home.recentActivity")}
          seeAllLabel={t("common.actions.seeAll")}
          state={{ transactions: recent }}
          onSeeAll={() => router.navigate("/activity")}
          onTransactionPress={(id) => sheets.open("txDetail", { id })}
        />
      </ScrollView>
    </Screen>
  );
}
