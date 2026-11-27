export type OnboardingStep =
  | "intro"
  | "welcome"
  | "identity"
  | "liveness"
  | "explain"
  | "reveal"
  | "verify"
  | "import"
  | "passcode"
  | "biometric"
  | "ready";

export type FinishState = "idle" | "saving" | "failed";
