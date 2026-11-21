import type { DemoPrefs, Prefs } from "./storage.types";

export const DEFAULT_PREFS: Prefs = {
  onboardingCompleted: false,
  backupConfirmed: false,
  biometricEnabled: false,
  autoLockMinutes: 1,
  hideBalances: false,
  txProtection: true,
  requireLivenessReveal: false,
  requireLivenessSend: false,
  lastAccountId: "main",
  walletAddress: "",
  walletCreatedAt: 0,
};

export const DEFAULT_DEMO: DemoPrefs = {
  liveApi: true,
  backend: "online",
  price: "fresh",
  sendSim: "pass",
  sendOutcome: "success",
};
