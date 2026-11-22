import type { IconName } from "@/components/Icon";

/**
 * The first-run intro is a few screens shown before wallet setup. It lives
 * inside the onboarding route group, so it can only appear while no wallet
 * exists; once one does, that group is closed and lock/wallet open instead.
 */
export const INTRO_STEPS = [
  { id: "nadir", icon: null },
  { id: "keys", icon: "key" },
  { id: "practice", icon: "shield" },
] as const satisfies readonly { id: string; icon: IconName | null }[];

export type IntroStepId = (typeof INTRO_STEPS)[number]["id"];

export function initialOnboardingStep(introSeen: boolean): "intro" | "welcome" {
  return introSeen ? "welcome" : "intro";
}

/** Index of the next intro step, or null when the intro is finished. */
export function nextIntroIndex(index: number): number | null {
  return index + 1 < INTRO_STEPS.length ? index + 1 : null;
}

/** The step after the identity check: the phrase explainer when creating, the phrase entry when importing. */
export function stepAfterIdentity(viaImport: boolean): "explain" | "import" {
  return viaImport ? "import" : "explain";
}
