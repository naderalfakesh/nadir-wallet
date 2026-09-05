import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { hashPasscode, isPasscodeRecord } from "@nadir-wallet/crypto-core";
import type { ColorScheme } from "@/theme";
import { EMPTY_LOCKOUT, sanitizeLockout, type LockoutState } from "@/features/auth/lockout";
import type { BackendStatus, PriceStatus, SecurityEvent } from "@/types/status";
import type { SendSim, SendOutcome } from "@/providers/DemoStateProvider";

// Centralised so screens never touch storage keys directly.
const KEYS = {
  prefs: "nadir.prefs",
  theme: "nadir.theme",
  demo: "nadir.demo",
  events: "nadir.events",
  lockout: "nadir.lockout",
} as const;

// SecureStore (device keychain) holds the only real secret, the BIP39
// mnemonic, plus the salted hash of the app-lock PIN. Never AsyncStorage.
const SECURE_PASSCODE = "nadir.passcode";
const SECURE_MNEMONIC = "nadir.mnemonic";

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
  const [prefs, demo, events, passcodeHash, theme, lockout] = await Promise.all([
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
  ]);
  return { prefs, demo, events: events ?? [], passcodeHash, theme, lockout };
}

export const storage = {
  savePrefs: (prefs: Prefs) => AsyncStorage.setItem(KEYS.prefs, JSON.stringify(prefs)),
  saveTheme: (theme: ColorScheme) => AsyncStorage.setItem(KEYS.theme, theme),
  saveDemo: (demo: DemoPrefs) => AsyncStorage.setItem(KEYS.demo, JSON.stringify(demo)),
  saveEvents: (events: SecurityEvent[]) => AsyncStorage.setItem(KEYS.events, JSON.stringify(events)),
  saveLockout: (state: LockoutState) => AsyncStorage.setItem(KEYS.lockout, JSON.stringify(state)),
  // Only the salted hash is written; the PIN itself is never persisted.
  savePasscodeHash: async (record: string) => {
    try {
      await SecureStore.setItemAsync(SECURE_PASSCODE, record);
    } catch {
      // SecureStore is unavailable on some targets (e.g. web); ignore.
    }
  },
  // The mnemonic is the only real secret and lives only in the keychain.
  saveMnemonic: (mnemonic: string) => SecureStore.setItemAsync(SECURE_MNEMONIC, mnemonic),
  getMnemonic: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(SECURE_MNEMONIC);
    } catch {
      return null;
    }
  },
  // Wipes all device-stored wallet state (secret + non-secret) for reset.
  clearWallet: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(SECURE_MNEMONIC).catch(() => undefined),
      SecureStore.deleteItemAsync(SECURE_PASSCODE).catch(() => undefined),
      AsyncStorage.multiRemove([KEYS.prefs, KEYS.events, KEYS.lockout]),
    ]);
  },
};
