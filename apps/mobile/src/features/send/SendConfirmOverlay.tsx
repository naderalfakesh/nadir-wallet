import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen, AppText, Button, Icon, StatusPill } from "@/components";
import { DeviceAuthGate, type GateOutcome } from "@/features/auth/components/DeviceAuthGate";
import { PasscodeUnlock } from "@/features/auth/components/PasscodeUnlock";
import { createStaleGuard } from "@/features/auth/staleGuard";
import { LivenessFlow } from "@/features/liveness/LivenessFlow";
import { CHAINS, type PortfolioToken } from "@/features/wallet/data";
import { useTranslation } from "@/i18n/useTranslation";
import { useApp } from "@/providers/AppProvider";
import { useTheme, useThemedStyles, alpha, type Theme } from "@/theme";
import type { SendOutcome } from "@/types/status";
import { fmtUSD, fmtToken, shortAddr } from "@/utils/format";
import { confirmSimulatedSend, nextSendPhase } from "./confirmSend";

export type SendPhase = "liveness" | "auth" | "pending" | "success" | "failed";

interface OverlayProps {
  phase: SendPhase;
  setPhase: (p: SendPhase) => void;
  outcome: SendOutcome;
  token: PortfolioToken;
  amount: number;
  fiat: number;
  to: string;
  onRetry: () => void;
  /** Dismiss the overlay back to the review step (used by the liveness gate). */
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
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const { t } = useTranslation();
  const chain = CHAINS[token.chain];
  const goWallet = () => router.replace("/home");

  const { verifyPasscode, lockout, recordUnlockFailure, clearLockout } = useApp();
  // A device with no screen lock has nothing for the OS to check, so the app
  // passcode confirms the simulated send there instead.
  const [usePasscode, setUsePasscode] = useState(false);

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
        {usePasscode ? (
          <PasscodeUnlock
            verify={verifyPasscode}
            lockout={lockout}
            onFailure={recordUnlockFailure}
            onUnlock={() => {
              clearLockout();
              setUsePasscode(false);
              setPhase(nextSendPhase(outcome));
            }}
            onUseBiometric={() => setUsePasscode(false)}
            biometricAvailable={false}
            hint={t("send.overlay.prompt")}
          />
        ) : (
          <DeviceAuthGate
            title={t("send.overlay.confirmTitle")}
            subtitle={t("send.overlay.confirmSub")}
            authenticate={confirm}
            auto
            failureCopy={{
              cancelled: t("send.overlay.authCancelled"),
              failed: t("send.overlay.authFailed"),
              needsStrongBiometric: t("send.overlay.authNeedsStrongBiometric"),
            }}
            unavailableFallback={{
              message: t("send.overlay.noDeviceLock"),
              label: t("send.overlay.usePasscode"),
              onPress: () => setUsePasscode(true),
            }}
          />
        )}
        <View style={styles.footer}>
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
          <AppText weight="bold" size={23} style={styles.resultTitle}>
            {t("send.overlay.submitted")}
          </AppText>
          <AppText size={14} muted style={[styles.resultBody, styles.maxWidth260]}>
            {t("send.overlay.submittedBody", { network: chain.name })}
          </AppText>
          <View style={styles.pillGap}>
            <StatusPill status="pending" />
          </View>
        </View>
        <View style={styles.footer}>
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
          <AppText weight="bold" size={23} style={styles.resultTitle}>
            {t("send.overlay.failedTitle")}
          </AppText>
          <AppText size={14} muted style={[styles.resultBody, styles.maxWidth270]}>
            {t("send.overlay.failedBody")}
          </AppText>
        </View>
        <View style={styles.footer}>
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
        <AppText weight="bold" size={23} style={styles.sentTitle}>
          {t("send.overlay.sentTitle")}
        </AppText>
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
      </View>
      <View style={styles.footer}>
        <Button label={t("send.overlay.done")} onPress={goWallet} />
      </View>
    </Screen>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing.pad,
    },
    resultBadge: {
      width: 96,
      height: 96,
      borderRadius: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    resultTitle: {
      marginTop: 22,
    },
    sentTitle: {
      marginTop: 24,
    },
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
    footer: {
      paddingHorizontal: theme.spacing.pad,
      paddingBottom: theme.spacing.pad,
      gap: 10,
    },
  });
