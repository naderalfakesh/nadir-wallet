import { useCallback, useState } from "react";
import { type GateOutcome } from "@/features/auth/components/DeviceAuthGate";
import { useSensitiveReveal } from "@/features/auth/useSensitiveReveal";
import { t } from "@/i18n";
import { useApp } from "@/providers/AppProvider";
import { revealMnemonic } from "@/services/storage/mnemonic";
import { revealWhileCurrent } from "./revealPhrase";

export type Step = "intro" | "auth" | "reveal" | "verify" | "done";

export function useBackupFlow() {
  const { setPref, logEvent } = useApp();
  const [step, setStep] = useState<Step>("intro");
  const [words, setWords] = useState<string[]>([]);

  const clear = useCallback(() => {
    setWords([]);
    setStep((prev) => (prev === "done" ? prev : "intro"));
  }, []);
  const guard = useSensitiveReveal(clear);
  const restart = () => {
    guard.invalidate();
    clear();
  };

  const unlock = useCallback(
    (): Promise<GateOutcome> =>
      revealWhileCurrent(
        guard,
        () => revealMnemonic(t("onboarding.backup.revealPrompt")),
        (revealed) => {
          setWords(revealed);
          setStep("reveal");
        },
      ),
    [guard],
  );

  const confirmBackup = () => {
    setPref("backupConfirmed", true);
    logEvent("backup");
    setWords([]);
    setStep("done");
  };

  return { step, setStep, words, restart, unlock, confirmBackup };
}
