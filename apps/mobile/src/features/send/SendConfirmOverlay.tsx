import React, { useCallback, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { AppText, Button, Icon, StatusPill } from "@/components";
import { LivenessFlow } from "@/features/liveness/LivenessFlow";
import { CHAINS } from "@/features/wallet/chains";
import type { PortfolioToken } from "@/features/wallet/types";
import { useTranslation } from "@/i18n/useTranslation";
import { alpha, useTheme } from "@/theme";
import type { SendOutcome } from "@/types/status";
import { fmtToken, fmtUSD, shortAddr } from "@/utils/format";
import { SendAuthStep } from "./components/SendAuthStep";
import { SendResultLayout } from "./components/SendResultLayout";
import type { SendPhase } from "./send.types";

interface OverlayProps {
  phase: SendPhase;
  setPhase: (p: SendPhase) => void;
  outcome: SendOutcome;
  token: PortfolioToken;
  amount: number;
  fiat: number;
  to: string;
  onRetry: () => void;
  onCancel: () => void;
}

export function SendConfirmOverlay({
  phase,
  setPhase,
  outcome,
  token,
  amount,
  fiat,
  to,
  onRetry,
  onCancel,
}: OverlayProps) {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const chain = CHAINS[token.chain];
  const goWallet = useCallback(() => router.replace("/home"), [router]);

  useEffect(() => {
    if (phase === "pending" && outcome === "success") {
      const id = setTimeout(() => setPhase("success"), 1900);
      return () => clearTimeout(id);
    }
  }, [phase, outcome, setPhase]);

  if (phase === "liveness") {
    return <LivenessFlow mode="gate" onPass={() => setPhase("auth")} onCancel={onCancel} />;
  }

  if (phase === "auth") {
    return <SendAuthStep outcome={outcome} setPhase={setPhase} onCancel={onCancel} />;
  }

  if (phase === "pending") {
    return (
      <SendResultLayout
        badgeColor={alpha(theme.colors.warn, 0.16)}
        icon={<Icon name="clock" size={46} color={theme.colors.warn} />}
        title={t("send.overlay.submitted")}
        titleGap={22}
        footer={<Button label={t("send.overlay.backToWallet")} onPress={goWallet} />}
      >
        <AppText size={14} muted style={[styles.resultBody, styles.maxWidth260]}>
          {t("send.overlay.submittedBody", { network: chain.name })}
        </AppText>
        <View style={styles.pillGap}>
          <StatusPill status="pending" />
        </View>
      </SendResultLayout>
    );
  }

  if (phase === "failed") {
    return (
      <SendResultLayout
        badgeColor={alpha(theme.colors.neg, 0.15)}
        icon={<Icon name="close" size={46} stroke={2.6} color={theme.colors.neg} />}
        title={t("send.overlay.failedTitle")}
        titleGap={22}
        footer={
          <>
            <Button label={t("send.overlay.retry")} icon="refresh" onPress={onRetry} />
            <Button label={t("send.overlay.backToWallet")} variant="ghost" onPress={goWallet} />
          </>
        }
      >
        <AppText size={14} muted style={[styles.resultBody, styles.maxWidth270]}>
          {t("send.overlay.failedBody")}
        </AppText>
      </SendResultLayout>
    );
  }

  return (
    <SendResultLayout
      badgeColor={theme.colors.accentDim}
      icon={<Icon name="check" size={50} stroke={2.4} color={theme.colors.accent} />}
      title={t("send.overlay.sentTitle")}
      titleGap={24}
      footer={<Button label={t("send.overlay.done")} onPress={goWallet} />}
    >
      <AppText size={16} muted tnum style={styles.sentAmount}>
        {t("send.overlay.sentSummary", {
          amount: fmtToken(amount, token.symbol),
          fiat: fmtUSD(fiat),
        })}
      </AppText>
      <AppText mono size={12.5} faint style={styles.sentTo}>
        {t("send.overlay.sentTo", { addr: shortAddr(to, 8, 6) })}
      </AppText>
      <AppText size={13} muted style={[styles.resultBody, styles.maxWidth270]}>
        {t("send.overlay.sentBody", { network: chain.name })}
      </AppText>
    </SendResultLayout>
  );
}

const styles = StyleSheet.create({
  sentAmount: {
    marginTop: 6,
  },
  sentTo: {
    marginTop: 6,
  },
  resultBody: {
    marginTop: 8,
    lineHeight: 21,
    textAlign: "center",
  },
  maxWidth260: {
    maxWidth: 260,
  },
  maxWidth270: {
    maxWidth: 270,
  },
  pillGap: {
    marginTop: 16,
  },
});
