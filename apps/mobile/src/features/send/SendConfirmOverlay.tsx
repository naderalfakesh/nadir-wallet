import React, { useEffect } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen, AppText, Button, Icon, StatusPill } from "@/components";
import { useTheme, alpha } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { openExplorer } from "@/services/device";
import { fmtUSD, fmtToken, shortAddr } from "@/utils/format";
import { CHAINS, type DemoToken } from "@/features/wallet/data";
import type { SendOutcome } from "@/providers/DemoStateProvider";
import { LivenessFlow } from "@/features/liveness/LivenessFlow";

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

function demoHash(token: DemoToken, to: string): string {
  const seed = `${token.id}${to}`.replace(/[^0-9a-f]/gi, "a").toLowerCase();
  return `0x${(seed + "7a3f9c2e10bd5648af029e7a3f9c2e10bd5648af").slice(0, 60)}`;
}

function Centered({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing.pad }}>
      {children}
    </View>
  );
}

export function SendConfirmOverlay({ phase, setPhase, outcome, token, amount, fiat, to, onRetry, onCancel }: OverlayProps) {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const chain = CHAINS[token.chain];
  const hash = demoHash(token, to);
  const goWallet = () => router.replace("/home");

  useEffect(() => {
    if (phase === "auth") {
      const id = setTimeout(() => setPhase(outcome === "failed" ? "failed" : "pending"), 1700);
      return () => clearTimeout(id);
    }
    if (phase === "pending" && outcome === "success") {
      const id = setTimeout(() => setPhase("success"), 1900);
      return () => clearTimeout(id);
    }
  }, [phase, outcome, setPhase]);

  // Step-up liveness gate before signing a high-value send (after hooks, so
  // hook order stays stable across phases).
  if (phase === "liveness") {
    return <LivenessFlow mode="gate" onPass={() => setPhase("auth")} onCancel={onCancel} />;
  }

  if (phase === "auth") {
    return (
      <Screen>
        <Centered>
          <View
            style={{
              width: 92,
              height: 92,
              borderRadius: 28,
              backgroundColor: theme.colors.accentDim,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="faceid" size={48} stroke={1.8} color={theme.colors.accent} />
          </View>
          <AppText weight="bold" size={20} style={{ marginTop: 26 }}>
            {t("send.overlay.signing")}
          </AppText>
          <AppText size={14} muted style={{ marginTop: 6 }}>
            {t("send.overlay.signingSub")}
          </AppText>
        </Centered>
      </Screen>
    );
  }

  if (phase === "pending") {
    return (
      <Screen>
        <Centered>
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: alpha(theme.colors.warn, 0.16),
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="clock" size={46} color={theme.colors.warn} />
          </View>
          <AppText weight="bold" size={23} style={{ marginTop: 22 }}>
            {t("send.overlay.submitted")}
          </AppText>
          <AppText size={14} muted style={{ marginTop: 8, lineHeight: 21, textAlign: "center", maxWidth: 260 }}>
            {t("send.overlay.submittedBody", { network: chain.name })}
          </AppText>
          <View style={{ marginTop: 16 }}>
            <StatusPill status="pending" />
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginTop: 18,
              padding: 14,
              borderRadius: theme.radius.card,
              backgroundColor: theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.colors.hairline,
              width: "100%",
            }}
          >
            <AppText size={12} muted>
              {t("send.overlay.hash")}
            </AppText>
            <AppText mono size={12.5} style={{ flex: 1, textAlign: "right" }}>
              {shortAddr(hash, 10, 8)}
            </AppText>
          </View>
        </Centered>
        <View style={{ paddingHorizontal: theme.spacing.pad, paddingBottom: insets.bottom + theme.spacing.pad, gap: 10 }}>
          <Button
            label={t("send.overlay.viewOn", { explorer: chain.explorerName })}
            icon="external"
            variant="ghost"
            onPress={() => void openExplorer(chain.explorerHost, `tx/${hash}`)}
          />
          <Button label={t("send.overlay.backToWallet")} onPress={goWallet} />
        </View>
      </Screen>
    );
  }

  if (phase === "failed") {
    return (
      <Screen>
        <Centered>
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: alpha(theme.colors.neg, 0.15),
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="close" size={46} stroke={2.6} color={theme.colors.neg} />
          </View>
          <AppText weight="bold" size={23} style={{ marginTop: 22 }}>
            {t("send.overlay.failedTitle")}
          </AppText>
          <AppText size={14} muted style={{ marginTop: 8, lineHeight: 21, textAlign: "center", maxWidth: 270 }}>
            {t("send.overlay.failedBody")}
          </AppText>
        </Centered>
        <View style={{ paddingHorizontal: theme.spacing.pad, paddingBottom: insets.bottom + theme.spacing.pad, gap: 10 }}>
          <Button label={t("send.overlay.retry")} icon="refresh" onPress={onRetry} />
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Button
              label={t("send.overlay.details")}
              icon="external"
              variant="ghost"
              style={{ flex: 1 }}
              onPress={() => void openExplorer(chain.explorerHost, `tx/${hash}`)}
            />
            <Button label={t("send.overlay.backToWallet")} variant="ghost" onPress={goWallet} style={{ flex: 1 }} />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Centered>
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: theme.colors.accentDim,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
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
        <View style={{ marginTop: 14 }}>
          <StatusPill status="confirmed" />
        </View>
      </Centered>
      <View style={{ paddingHorizontal: theme.spacing.pad, paddingBottom: insets.bottom + theme.spacing.pad, gap: 10 }}>
        <Button
          label={t("send.overlay.viewOn", { explorer: chain.explorerName })}
          icon="external"
          variant="ghost"
          onPress={() => void openExplorer(chain.explorerHost, `tx/${hash}`)}
        />
        <Button label={t("send.overlay.done")} onPress={goWallet} />
      </View>
    </Screen>
  );
}
