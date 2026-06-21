import type { LivenessSnapshot } from "./liveness.types";

export type LivenessTranslator = (key: string, values?: Record<string, string | number>) => string;

export function isCameraActivePhase(phase: LivenessSnapshot["phase"]): boolean {
  return phase === "align" || phase === "challenge";
}

export function getChallengeProgress(state: LivenessSnapshot): number {
  if (state.phase === "passed") return 1;
  return Math.min(state.index / state.challenges.length, 1);
}

export function getLivenessPrompt(state: LivenessSnapshot, t: LivenessTranslator): string {
  if (state.phase === "align") {
    if (state.faceFit === "ok") return t("liveness.alignHold");
    return state.faceFit === "outside" ? t("liveness.align") : t("liveness.noFace");
  }

  if (state.phase === "challenge") {
    return t(`liveness.challenge.${state.challenges[state.index]}`);
  }

  return state.phase === "passed" ? t("liveness.passed") : t("liveness.failed");
}
