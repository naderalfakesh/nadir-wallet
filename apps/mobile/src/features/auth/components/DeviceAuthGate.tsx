import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppText, Button } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { biometryIcon } from "@/services/auth/biometry";
import type { OsAuthFailure } from "@/services/auth/osAuth";
import { useTheme, useThemedStyles, type Theme } from "@/theme";
import { BiometricBadge } from "./BiometricBadge";
import { usePulse } from "../usePulse";

export type GateFailure = OsAuthFailure | "missing";
export type GateOutcome = { ok: true } | { ok: false; reason: GateFailure };

interface DeviceAuthGateProps {
  title: string;
  subtitle: string;
  authenticate: () => Promise<GateOutcome>;
  auto?: boolean;
  failureCopy?: Partial<Record<GateFailure, string>>;
  unavailableFallback?: { message: string; label: string; onPress: () => void };
}

export function DeviceAuthGate({
  title,
  subtitle,
  authenticate,
  auto = false,
  failureCopy,
  unavailableFallback,
}: DeviceAuthGateProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const [status, setStatus] = useState<"idle" | "authenticating" | GateFailure>("idle");
  const mounted = useRef(true);
  const autoStarted = useRef(false);
  const pulse = usePulse(status === "authenticating");

  const go = useCallback(async () => {
    setStatus("authenticating");
    let res: GateOutcome;
    try {
      res = await authenticate();
    } catch {
      res = { ok: false, reason: "failed" };
    }
    if (mounted.current && !res.ok) setStatus(res.reason);
  }, [authenticate]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!auto || autoStarted.current) return;
    autoStarted.current = true;
    void go();
  }, [auto, go]);

  const failed = status !== "idle" && status !== "authenticating";
  const fallback = status === "unavailable" ? unavailableFallback : undefined;
  const message =
    status === "idle" || status === "authenticating"
      ? subtitle
      : (fallback?.message ?? failureCopy?.[status] ?? t(`lock.osAuth.${status}`));

  return (
    <View style={styles.root}>
      <BiometricBadge pulse={pulse} active={status === "authenticating"} ringSize={116} />
      <AppText weight="bold" size={21} style={styles.title}>
        {title}
      </AppText>
      <AppText
        size={14}
        color={failed ? theme.colors.warn : theme.colors.textMuted}
        style={styles.message}
      >
        {message}
      </AppText>
      {fallback ? (
        <Button
          label={fallback.label}
          icon="lock"
          variant="soft"
          onPress={fallback.onPress}
          height={48}
          style={styles.actionButton}
        />
      ) : (
        status !== "authenticating" && (
          <Button
            label={failed ? t("lock.tryAgain") : t("lock.osAuth.authenticate")}
            icon={biometryIcon()}
            variant="soft"
            onPress={() => void go()}
            height={48}
            style={styles.actionButton}
          />
        )
      )}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    root: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing.pad,
    },
    title: { marginTop: 26 },
    message: { marginTop: 6, textAlign: "center", maxWidth: 290, lineHeight: 20 },
    actionButton: { marginTop: 26, paddingHorizontal: 26 },
  });
