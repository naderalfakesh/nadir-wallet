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
  /** Require a passed liveness check before revealing the recovery phrase. */
  requireLivenessReveal: boolean;
  /** Require a passed liveness check before confirming a high-value send. */
  requireLivenessSend: boolean;
  lastAccountId: string;
  /** Public derived EVM address - non-secret. */
  walletAddress: string;
  walletCreatedAt: number;
  /** When the face check passed, epoch ms. 0 means not verified. */
  identityVerifiedAt: number;
  /** Display currency code (presentation only; amounts are not converted). */
  currency: string;
  /** Chain ids shown as enabled in Settings (presentation only). */
  enabledNetworks: string[];
  privacy: PrivacyPrefs;
  notifications: NotificationPrefs;
}

/** Demo-only flags: persisted but not acted on. */
export interface PrivacyPrefs {
  shareUsageData: boolean;
  hideInSwitcher: boolean;
}

/** Demo-only flags: the app sends no push notifications. */
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
  /** Serialized PBKDF2 record, or null until the user sets a PIN. */
  passcodeHash: string | null;
  lockout: LockoutState;
  /** The first-run intro was finished or skipped on this device. */
  introSeen: boolean;
}
