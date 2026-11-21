import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Screen, Button } from "@/components";
import { DeviceAuthGate, type GateOutcome } from "@/features/auth/components/DeviceAuthGate";
import { PasscodeUnlock } from "@/features/auth/components/PasscodeUnlock";
import { createStaleGuard } from "@/features/auth/staleGuard";
import { useTranslation } from "@/i18n/useTranslation";
import { useApp } from "@/providers/AppProvider";
import { useThemedStyles, type Theme } from "@/theme";
import type { SendOutcome } from "@/types/status";
import { confirmSimulatedSend, nextSendPhase } from "../confirmSend";
import type { SendPhase } from "../send.types";

interface SendAuthStepProps {
  outcome: SendOutcome;
  setPhase: (p: SendPhase) => void;
  onCancel: () => void;
}

export function SendAuthStep({ outcome, setPhase, onCancel }: SendAuthStepProps) {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
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

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    footer: {
      paddingHorizontal: theme.spacing.pad,
      paddingBottom: theme.spacing.pad,
      gap: 10,
    },
  });
