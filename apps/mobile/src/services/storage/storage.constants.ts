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
  identityVerifiedAt: 0,
  currency: "USD",
  enabledNetworks: ["ethereum", "base", "arbitrum", "optimism", "polygon"],
  privacy: { shareUsageData: false, hideInSwitcher: true },
  notifications: { incoming: true, sent: true, security: true, price: false },
};

export const DEFAULT_DEMO: DemoPrefs = {
  liveApi: true,
  backend: "online",
  price: "fresh",
  sendSim: "pass",
  sendOutcome: "success",
};
