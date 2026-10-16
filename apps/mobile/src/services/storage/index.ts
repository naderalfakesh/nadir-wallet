import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { hashPasscode, isPasscodeRecord } from "@nadir-wallet/crypto-core";
import type { ColorScheme } from "@/theme";
import { EMPTY_LOCKOUT, sanitizeLockout, type LockoutState } from "@/features/auth/lockout";
import type { BackendStatus, PriceStatus, SecurityEvent } from "@/types/status";
import type { SendSim, SendOutcome } from "@/providers/DemoStateProvider";
import { INTRO_SEEN_VALUE, parseIntroSeen } from "@/features/onboarding/firstRun";
import { deleteMnemonic, saveMnemonic } from "./mnemonic";

// Centralised so screens never touch storage keys directly.
const KEYS = {
  prefs: "nadir.prefs",
  theme: "nadir.theme",
  demo: "nadir.demo",
  events: "nadir.events",
  lockout: "nadir.lockout",
  // Device-level, so clearWallet leaves it: a reset shouldn't replay the intro.
  intro: "nadir.intro",
} as const;

// SecureStore (device keychain) holds the only real secret, the BIP39
// mnemonic (see ./mnemonic), plus the salted hash of the app-lock PIN.
// Never AsyncStorage.
const SECURE_PASSCODE = "nadir.passcode";

export interface Prefs {
  onboardingCompleted: boolean;
  backupConfirmed: boolean;
  biometricEnabled: boolean;
  autoLockMinutes: number;
  hideBalances: boolean;
  /** Require a passed liveness check before revealing the recovery phrase. */
  requireLivenessReveal: boolean;
  /** Require a passed liveness check before confirming a high-value send. */
  requireLivenessSend: boolean;
  lastAccountId: string;
  /** Public derived EVM address - non-secret. */
  walletAddress: string;
  walletCreatedAt: number;
}

export interface DemoPrefs {
  liveApi: boolean;
  backend: BackendStatus;
  price: PriceStatus;
  sendSim: SendSim;
  sendOutcome: SendOutcome;
}

export const DEFAULT_PREFS: Prefs = {
  onboardingCompleted: false,
  backupConfirmed: false,
  biometricEnabled: false,
  autoLockMinutes: 1,
  hideBalances: false,
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

export interface PersistedState {
  prefs: Prefs;
  theme: ColorScheme;
  demo: DemoPrefs;
  events: SecurityEvent[];
  /** Serialized PBKDF2 record, or null until the user sets a PIN. */
  passcodeHash: string | null;
  lockout: LockoutState;
  /** The first-run intro was finished or skipped on this device. */
  introSeen: boolean;
}

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...(JSON.parse(raw) as Partial<T>) };
  } catch {
    return fallback;
  }
}

async function getPasscodeHash(): Promise<string | null> {
  try {
    const stored = await SecureStore.getItemAsync(SECURE_PASSCODE);
    if (!stored) return null;
    if (isPasscodeRecord(stored)) return stored;
    // Earlier builds kept the PIN itself in the keychain. Upgrade it in place.
    const record = hashPasscode(stored);
    await SecureStore.setItemAsync(SECURE_PASSCODE, record);
    return record;
  } catch {
    return null;
  }
}

async function getLockout(): Promise<LockoutState> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.lockout);
    return raw ? sanitizeLockout(JSON.parse(raw)) : EMPTY_LOCKOUT;
  } catch {
    return EMPTY_LOCKOUT;
  }
}

export async function loadPersistedState(): Promise<PersistedState> {
  const [prefs, demo, events, passcodeHash, theme, lockout, introSeen] = await Promise.all([
    readJson<Prefs>(KEYS.prefs, DEFAULT_PREFS),
    readJson<DemoPrefs>(KEYS.demo, DEFAULT_DEMO),
    AsyncStorage.getItem(KEYS.events).then((raw) => {
      try {
        return raw ? (JSON.parse(raw) as SecurityEvent[]) : null;
      } catch {
        return null;
      }
    }),
    getPasscodeHash(),
    AsyncStorage.getItem(KEYS.theme).then((v) => (v === "light" ? "light" : "dark") as ColorScheme),
    getLockout(),
    AsyncStorage.getItem(KEYS.intro).then(parseIntroSeen, () => false),
  ]);
  return { prefs, demo, events: events ?? [], passcodeHash, theme, lockout, introSeen };
}

export const storage = {
  savePrefs: (prefs: Prefs) => AsyncStorage.setItem(KEYS.prefs, JSON.stringify(prefs)),
  saveTheme: (theme: ColorScheme) => AsyncStorage.setItem(KEYS.theme, theme),
  saveDemo: (demo: DemoPrefs) => AsyncStorage.setItem(KEYS.demo, JSON.stringify(demo)),
  saveEvents: (events: SecurityEvent[]) => AsyncStorage.setItem(KEYS.events, JSON.stringify(events)),
  saveLockout: (state: LockoutState) => AsyncStorage.setItem(KEYS.lockout, JSON.stringify(state)),
  saveIntroSeen: () => AsyncStorage.setItem(KEYS.intro, INTRO_SEEN_VALUE),
  // Only the salted hash is written; the PIN itself is never persisted.
  // Failures propagate so the UI never reports a PIN that wasn't stored.
  savePasscodeHash: (record: string) => SecureStore.setItemAsync(SECURE_PASSCODE, record),
  // Write-only here; reading it back goes through revealMnemonic's OS prompt.
  saveMnemonic,
  // Wipes all device-stored wallet state (secret + non-secret) for reset.
  clearWallet: async () => {
    await Promise.all([
      deleteMnemonic().catch(() => undefined),
      SecureStore.deleteItemAsync(SECURE_PASSCODE).catch(() => undefined),
      AsyncStorage.multiRemove([KEYS.prefs, KEYS.events, KEYS.lockout]),
    ]);
  },
};
