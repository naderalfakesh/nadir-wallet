import React, { useMemo } from "react";
import { Pressable, View } from "react-native";
import {
  AppText,
  BackendNotice,
  Card,
  ChangeBadge,
  Icon,
  IconButton,
  PriceFreshness,
  Row,
  SectionLabel,
  Segmented,
  Sparkline,
  TestnetBadge,
  TokenGlyph,
} from "@/components";
import { useTheme } from "@/theme";
import { ACCOUNT, RANGES, SPARKLINE, chainBadgeColor } from "@/features/wallet/data";
import { TransactionRow } from "@/features/wallet/TransactionRow";
import { getTransactionTime } from "@/features/wallet/transactions";
import { createHomeStyles } from "./HomeScreen.styles";
import { getBalanceChange, getBalanceValue, getTokenAmount, getTokenValue } from "./home.utils";
import type { BalanceSummaryState, HomeQuickAction, RecentActivityState, TokenListState } from "./home.types";

interface AccountBarProps {
  hidden: boolean;
  onToggleBalances: () => void;
  onOpenAccounts: () => void;
  onOpenScan: () => void;
}

export function AccountBar({ hidden, onToggleBalances, onOpenAccounts, onOpenScan }: AccountBarProps) {
  const theme = useTheme();
  const styles = useMemo(() => createHomeStyles(theme), [theme]);

  return (
    <View style={styles.accountBar}>
      <Pressable onPress={onOpenAccounts} style={styles.accountPicker}>
        <View style={styles.accountAvatar} />
        <AppText weight="bold" size={14.5}>
          {ACCOUNT.label}
        </AppText>
        <Icon name="chevronD" size={16} color={theme.colors.textMuted} />
      </Pressable>
      <View style={styles.accountSpacer} />
      <IconButton
        name={hidden ? "eyeOff" : "eye"}
        onPress={onToggleBalances}
        accessibilityLabel={hidden ? "Show balances" : "Hide balances"}
      />
      <IconButton name="scan" accessibilityLabel="Scan QR code" onPress={onOpenScan} />
    </View>
  );
}

interface BackendStatusNoticeProps {
  status: BalanceSummaryState["backendStatus"];
  onRetry: () => void;
}

export function BackendStatusNotice({ status, onRetry }: BackendStatusNoticeProps) {
  const theme = useTheme();
  const styles = useMemo(() => createHomeStyles(theme), [theme]);

  if (status === "online") return null;

  return (
    <View style={styles.noticeWrap}>
      <BackendNotice status={status} onRetry={onRetry} />
    </View>
  );
}

interface BalanceSummaryProps {
  state: BalanceSummaryState;
  title: string;
  unavailableLabel: string;
  testnetLabel: string;
  todayLabel: string;
  onRetry: () => void;
  onRangeChange: (range: BalanceSummaryState["range"]) => void;
}

export function BalanceSummary({
  state,
  title,
  unavailableLabel,
  testnetLabel,
  todayLabel,
  onRetry,
  onRangeChange,
}: BalanceSummaryProps) {
  const theme = useTheme();
  const styles = useMemo(() => createHomeStyles(theme), [theme]);
  const priceUnavailable = state.priceStatus === "unavailable";
  const balanceValue = getBalanceValue(state.total, state.hidden, priceUnavailable, unavailableLabel);
  const changeValue = getBalanceChange(state.total, state.change, state.hidden);
  const chartOpacity = state.backendStatus === "rpc_unavailable" || priceUnavailable ? 0.4 : 1;

  return (
    <View style={styles.balanceWrap}>
      <View style={styles.balanceHeader}>
        <AppText weight="semibold" size={13.5} muted>
          {title}
        </AppText>
        <TestnetBadge label={testnetLabel} />
      </View>
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
          <ChangeBadge pct={state.change} />
          <AppText size={14} muted tnum>
            {changeValue} · {todayLabel}
          </AppText>
        </View>
      )}
      <PriceFreshness status={state.priceStatus} onRetry={onRetry} />
      <View style={[styles.chartWrap, { opacity: chartOpacity }]}>
        <Sparkline data={SPARKLINE} up={state.change >= 0} height={92} />
      </View>
      <Segmented options={RANGES} value={state.range} onChange={onRangeChange} small />
    </View>
  );
}

export function QuickActions({ actions }: { actions: HomeQuickAction[] }) {
  const theme = useTheme();
  const styles = useMemo(() => createHomeStyles(theme), [theme]);

  return (
    <View style={styles.quickActions}>
      {actions.map((action) => (
        <Pressable key={action.icon} onPress={action.onPress} style={styles.quickAction}>
          <View
            style={[
              styles.quickActionIcon,
              action.primary ? styles.primaryActionIcon : styles.secondaryActionIcon,
              action.primary && theme.shadows.accentGlow,
            ]}
          >
            <Icon
              name={action.icon}
              size={25}
              stroke={2.2}
              color={action.primary ? theme.colors.accentInk : theme.colors.text}
            />
          </View>
          <AppText weight="semibold" size={12.5} muted>
            {action.label}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

interface BackupReminderProps {
  title: string;
  body: string;
  onPress: () => void;
}

export function BackupReminder({ title, body, onPress }: BackupReminderProps) {
  const theme = useTheme();
  const styles = useMemo(() => createHomeStyles(theme), [theme]);

  return (
    <View style={styles.backupWrap}>
      <Card padding={15} style={{ backgroundColor: theme.colors.surface }} onPress={onPress}>
        <View style={styles.backupRow}>
          <View style={styles.backupIcon}>
            <Icon name="backup" size={22} color={theme.colors.warn} />
          </View>
          <View style={styles.backupBody}>
            <AppText weight="bold" size={14.5}>
              {title}
            </AppText>
            <AppText size={12.5} muted style={styles.backupText}>
              {body}
            </AppText>
          </View>
          <Icon name="chevronR" size={18} color={theme.colors.warn} />
        </View>
      </Card>
    </View>
  );
}

interface TokenListProps {
  title: string;
  manageLabel: string;
  state: TokenListState;
  onTokenPress: (tokenId: string) => void;
}

export function TokenList({ title, manageLabel, state, onTokenPress }: TokenListProps) {
  const theme = useTheme();
  const styles = useMemo(() => createHomeStyles(theme), [theme]);

  return (
    <View style={[styles.section, styles.tokenSection]}>
      <SectionLabel
        trailing={
          <AppText weight="semibold" size={13} color={theme.colors.accent}>
            {manageLabel}
          </AppText>
        }
      >
        {title}
      </SectionLabel>
      <Card padding={0} style={styles.cardInset}>
        {state.tokens.map((token, index) => (
          <Row
            key={token.id}
            last={index === state.tokens.length - 1}
            onPress={() => onTokenPress(token.id)}
            left={<TokenGlyph symbol={token.symbol} color={token.color} chainColor={chainBadgeColor(token.chain)} />}
            title={token.name}
            sub={
              <AppText size={13} muted tnum>
                {getTokenAmount(token)}
              </AppText>
            }
            right={getTokenValue(token, state.hidden, state.priceUnavailable)}
            rightSub={state.priceUnavailable ? undefined : <ChangeBadge pct={token.change} size={12} plain />}
          />
        ))}
      </Card>
    </View>
  );
}

interface RecentActivityProps {
  title: string;
  seeAllLabel: string;
  state: RecentActivityState;
  onSeeAll: () => void;
  onTransactionPress: (id: string) => void;
}

export function RecentActivity({
  title,
  seeAllLabel,
  state,
  onSeeAll,
  onTransactionPress,
}: RecentActivityProps) {
  const theme = useTheme();
  const styles = useMemo(() => createHomeStyles(theme), [theme]);

  return (
    <View style={styles.section}>
      <SectionLabel
        trailing={
          <Pressable onPress={onSeeAll} style={styles.seeAll}>
            <AppText weight="semibold" size={13} color={theme.colors.accent}>
              {seeAllLabel}
            </AppText>
          </Pressable>
        }
      >
        {title}
      </SectionLabel>
      <Card padding={0} style={styles.cardInset}>
        {state.transactions.map((tx, index) => (
          <TransactionRow
            key={tx.id}
            tx={tx}
            subtitle={getTransactionTime(tx)}
            last={index === state.transactions.length - 1}
            onPress={() => onTransactionPress(tx.id)}
          />
        ))}
      </Card>
    </View>
  );
}
