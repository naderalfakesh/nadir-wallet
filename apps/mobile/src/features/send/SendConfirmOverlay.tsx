import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen, AppText, Button, Icon, StatusPill } from "@/components";
import { useTheme, alpha } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { fmtUSD, fmtToken, shortAddr } from "@/utils/format";
import { CHAINS, type DemoToken } from "@/features/wallet/data";
import type { SendOutcome } from "@/providers/DemoStateProvider";
import { LivenessFlow } from "@/features/liveness/LivenessFlow";
import { DeviceAuthGate, type GateOutcome } from "@/features/auth/DeviceAuthGate";
import { createStaleGuard } from "@/features/auth/staleGuard";
import { confirmSimulatedSend } from "./confirmSend";
import { createOverlayStyles } from "./SendConfirmOverlay.styles";

export type SendPhase = "liveness" | "auth" | "pending" | "success" | "failed";

interface OverlayProps {
  phase: SendPhase;
  setPhase: (p: SendPhase) => void;
  outcome: SendOutcome;
  token: DemoToken;
  amount: number;
  fiat: number;
  to: string;
  onRetry: () => void;
  /** Dismiss the overlay back to the review step (used by the liveness gate). */
  onCancel: () => void;
}

export function SendConfirmOverlay({ phase, setPhase, outcome, token, amount, fiat, to, onRetry, onCancel }: OverlayProps) {
  const theme = useTheme();
  const styles = useMemo(() => createOverlayStyles(theme), [theme]);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const chain = CHAINS[token.chain];
  const goWallet = () => router.replace("/home");
  const footerPad = { paddingBottom: insets.bottom + theme.spacing.pad };

  const [guard] = useState(createStaleGuard);
  useEffect(() => () => guard.invalidate(), [guard]);

  const confirm = useCallback(async (): Promise<GateOutcome> => {
    const { current, value } = await guard.run(() =>
      confirmSimulatedSend(t("send.overlay.prompt"), outcome),
    );
    if (!current) return { ok: false, reason: "cancelled" };
    if (value.ok) setPhase(value.next);
    return value;
  }, [guard, t, outcome, setPhase]);
  const backToReview = () => {
    guard.invalidate();
    onCancel();
  };

  useEffect(() => {
    if (phase === "pending" && outcome === "success") {
      const id = setTimeout(() => setPhase("success"), 1900);
      return () => clearTimeout(id);
    }
  }, [phase, outcome, setPhase]);

  // Step-up liveness gate before confirming a high-value send (after hooks, so
  // hook order stays stable across phases).
  if (phase === "liveness") {
    return <LivenessFlow mode="gate" onPass={() => setPhase("auth")} onCancel={onCancel} />;
  }

  if (phase === "auth") {
    return (
      <Screen>
        <DeviceAuthGate title={t("send.overlay.confirmTitle")} subtitle={t("send.overlay.confirmSub")} authenticate={confirm} auto />
        <View style={[styles.footer, footerPad]}>
          <Button label={t("send.overlay.backToReview")} variant="ghost" onPress={backToReview} />
        </View>
      </Screen>
    );
  }

  if (phase === "pending") {
    return (
      <Screen>
        <View style={styles.centered}>
          <View style={[styles.resultBadge, { backgroundColor: alpha(theme.colors.warn, 0.16) }]}>
            <Icon name="clock" size={46} color={theme.colors.warn} />
          </View>
          <AppText weight="bold" size={23} style={{ marginTop: 22 }}>
            {t("send.overlay.submitted")}
          </AppText>
          <AppText size={14} muted style={[styles.resultBody, { maxWidth: 260 }]}>
            {t("send.overlay.submittedBody", { network: chain.name })}
          </AppText>
          <View style={styles.pillGap}>
            <StatusPill status="pending" />
          </View>
        </View>
        <View style={[styles.footer, footerPad]}>
          <Button label={t("send.overlay.backToWallet")} onPress={goWallet} />
        </View>
      </Screen>
    );
  }

  if (phase === "failed") {
    return (
      <Screen>
        <View style={styles.centered}>
          <View style={[styles.resultBadge, { backgroundColor: alpha(theme.colors.neg, 0.15) }]}>
            <Icon name="close" size={46} stroke={2.6} color={theme.colors.neg} />
          </View>
          <AppText weight="bold" size={23} style={{ marginTop: 22 }}>
            {t("send.overlay.failedTitle")}
          </AppText>
          <AppText size={14} muted style={[styles.resultBody, { maxWidth: 270 }]}>
            {t("send.overlay.failedBody")}
          </AppText>
        </View>
        <View style={[styles.footer, footerPad]}>
          <Button label={t("send.overlay.retry")} icon="refresh" onPress={onRetry} />
          <Button label={t("send.overlay.backToWallet")} variant="ghost" onPress={goWallet} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.centered}>
        <View style={[styles.resultBadge, { backgroundColor: theme.colors.accentDim }]}>
          <Icon name="check" size={50} stroke={2.4} color={theme.colors.accent} />
        </View>
        <AppText weight="bold" size={23} style={{ marginTop: 24 }}>
          {t("send.overlay.sentTitle")}
        </AppText>
        <AppText size={16} muted tnum style={{ marginTop: 6 }}>
          {fmtToken(amount, token.symbol)} · {fmtUSD(fiat)} demo
        </AppText>
        <AppText mono size={12.5} faint style={{ marginTop: 6 }}>
          {t("send.overlay.sentTo", { addr: shortAddr(to, 8, 6) })}
        </AppText>
        <AppText size={13} muted style={[styles.resultBody, { maxWidth: 270 }]}>
          {t("send.overlay.sentBody", { network: chain.name })}
        </AppText>
      </View>
      <View style={[styles.footer, footerPad]}>
        <Button label={t("send.overlay.done")} onPress={goWallet} />
      </View>
    </Screen>
  );
}
