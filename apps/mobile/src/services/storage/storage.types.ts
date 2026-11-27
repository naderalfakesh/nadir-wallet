import type { LockoutState } from "@/services/auth/lockout";
import type { ThemePreference } from "@/theme";
import type {
  BackendStatus,
  PriceStatus,
  SecurityEvent,
  SendOutcome,
  SendSim,
} from "@/types/status";

export interface Prefs {
  onboardingCompleted: boolean;
  backupConfirmed: boolean;
  biometricEnabled: boolean;
  autoLockMinutes: number;
  hideBalances: boolean;
  txProtection: boolean;
  requireLivenessReveal: boolean;
  requireLivenessSend: boolean;
  lastAccountId: string;
  walletAddress: string;
  walletCreatedAt: number;
  identityVerifiedAt: number;
  currency: string;
  enabledNetworks: string[];
  privacy: PrivacyPrefs;
  notifications: NotificationPrefs;
}

export interface PrivacyPrefs {
  shareUsageData: boolean;
  hideInSwitcher: boolean;
}

export interface NotificationPrefs {
  incoming: boolean;
  sent: boolean;
  security: boolean;
  price: boolean;
}

export interface DemoPrefs {
  liveApi: boolean;
  backend: BackendStatus;
  price: PriceStatus;
  sendSim: SendSim;
  sendOutcome: SendOutcome;
}

export interface PersistedState {
  prefs: Prefs;
  theme: ThemePreference;
  demo: DemoPrefs;
  events: SecurityEvent[];
  passcodeHash: string | null;
  lockout: LockoutState;
  introSeen: boolean;
}
