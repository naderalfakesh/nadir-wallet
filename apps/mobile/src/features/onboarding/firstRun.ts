import type { IconName } from "@/components/Icon";

export const INTRO_STEPS = [
  { id: "nadir", icon: null },
  { id: "keys", icon: "key" },
  { id: "practice", icon: "shield" },
] as const satisfies readonly { id: string; icon: IconName | null }[];

export type IntroStepId = (typeof INTRO_STEPS)[number]["id"];

export function initialOnboardingStep(introSeen: boolean): "intro" | "welcome" {
  return introSeen ? "welcome" : "intro";
}

export function nextIntroIndex(index: number): number | null {
  return index + 1 < INTRO_STEPS.length ? index + 1 : null;
}

export function stepAfterIdentity(viaImport: boolean): "explain" | "import" {
  return viaImport ? "import" : "explain";
}
