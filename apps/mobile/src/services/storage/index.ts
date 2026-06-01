import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import type { ColorScheme } from "@/theme";
import type { BackendStatus, PriceStatus, SecurityEvent } from "@/types/status";
import type { SendSim, SendOutcome } from "@/providers/DemoStateProvider";

// Centralised so screens never touch storage keys directly.
const KEYS = {
  prefs: "nadir.prefs",
  theme: "nadir.theme",
  demo: "nadir.demo",
  events: "nadir.events",
} as const;

// SecureStore (device keychain) holds the only real secret — the BIP39
// mnemonic — plus the app-lock PIN placeholder. Never AsyncStorage.
const SECURE_PASSCODE = "nadir.demoPasscode";
const SECURE_MNEMONIC = "nadir.mnemonic";
const DEFAULT_PASSCODE = "123456";

export interface Prefs {
  onboardingCompleted: boolean;
  backupConfirmed: boolean;
  biometricEnabled: boolean;
  autoLockMinutes: number;
  hideBalances: boolean;
  lastAccountId: string;
  /** Public derived EVM address — non-secret. */
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
  passcode: string;
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

async function getPasscode(): Promise<string> {
  try {
    const stored = await SecureStore.getItemAsync(SECURE_PASSCODE);
    return stored ?? DEFAULT_PASSCODE;
  } catch {
    return DEFAULT_PASSCODE;
  }
}

export async function loadPersistedState(): Promise<PersistedState> {
  const [prefs, demo, events, passcode, theme] = await Promise.all([
    readJson<Prefs>(KEYS.prefs, DEFAULT_PREFS),
    readJson<DemoPrefs>(KEYS.demo, DEFAULT_DEMO),
    AsyncStorage.getItem(KEYS.events).then((raw) => {
      try {
        return raw ? (JSON.parse(raw) as SecurityEvent[]) : null;
      } catch {
        return null;
      }
    }),
    getPasscode(),
    AsyncStorage.getItem(KEYS.theme).then((v) => (v === "light" ? "light" : "dark") as ColorScheme),
  ]);
  return { prefs, demo, events: events ?? [], passcode, theme };
}

export const storage = {
  savePrefs: (prefs: Prefs) => AsyncStorage.setItem(KEYS.prefs, JSON.stringify(prefs)),
  saveTheme: (theme: ColorScheme) => AsyncStorage.setItem(KEYS.theme, theme),
  saveDemo: (demo: DemoPrefs) => AsyncStorage.setItem(KEYS.demo, JSON.stringify(demo)),
  saveEvents: (events: SecurityEvent[]) => AsyncStorage.setItem(KEYS.events, JSON.stringify(events)),
  savePasscode: async (pin: string) => {
    try {
      await SecureStore.setItemAsync(SECURE_PASSCODE, pin);
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
      AsyncStorage.multiRemove([KEYS.prefs, KEYS.events]),
    ]);
  },
};
