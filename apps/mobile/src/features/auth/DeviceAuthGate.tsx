import React, { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { useTheme } from "@/theme";
import { AppText, Button } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import type { OsAuthFailure } from "@/services/auth/osAuth";
import { BiometricBadge } from "./BiometricBadge";
import { usePulse } from "./usePulse";
import { biometryIcon } from "@/services/auth/biometry";

export type GateFailure = OsAuthFailure | "missing";
export type GateOutcome = { ok: true } | { ok: false; reason: GateFailure };

interface DeviceAuthGateProps {
  title: string;
  subtitle: string;
  /** Runs the OS prompt (and any protected read); the gate only renders the outcome. */
  authenticate: () => Promise<GateOutcome>;
  /** Prompt as soon as the gate mounts. */
  auto?: boolean;
}

export function DeviceAuthGate({
  title,
  subtitle,
  authenticate,
  auto = false,
}: DeviceAuthGateProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [status, setStatus] = useState<"idle" | "authenticating" | GateFailure>("idle");
  const mounted = useRef(true);
  const autoStarted = useRef(false);
  const pulse = usePulse(status === "authenticating");

  // On success the parent swaps the gate out, so only failures update status.
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
  const message = status === "idle" ? subtitle : t(`lock.osAuth.${status}`);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: theme.spacing.pad,
      }}
    >
      <BiometricBadge pulse={pulse} active={status === "authenticating"} ringSize={116} />
      <AppText weight="bold" size={21} style={{ marginTop: 26 }}>
        {title}
      </AppText>
      <AppText
        size={14}
        color={failed ? theme.colors.warn : theme.colors.textMuted}
        style={{ marginTop: 6, textAlign: "center", maxWidth: 290, lineHeight: 20 }}
      >
        {message}
      </AppText>
      {status !== "authenticating" && (
        <Button
          label={failed ? t("lock.tryAgain") : t("lock.osAuth.authenticate")}
          icon={biometryIcon()}
          variant="soft"
          onPress={() => void go()}
          height={48}
          style={{ marginTop: 26, paddingHorizontal: 26 }}
        />
      )}
    </View>
  );
}
