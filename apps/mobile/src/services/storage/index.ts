import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { hashPasscode, isPasscodeRecord } from "@nadir-wallet/crypto-core";
import { EMPTY_LOCKOUT, sanitizeLockout, type LockoutState } from "@/services/auth/lockout";
import { parseThemePreference, type ThemePreference } from "@/theme";
import type { SecurityEvent } from "@/types/status";
import { INTRO_SEEN_VALUE, parseIntroSeen } from "./introSeen";
import { deleteMnemonic, saveMnemonic } from "./mnemonic";
import { normalizePrefs } from "./prefs";
import { DEFAULT_DEMO, DEFAULT_PREFS } from "./storage.constants";
import type { DemoPrefs, PersistedState, Prefs } from "./storage.types";

export type {
  Prefs,
  DemoPrefs,
  PersistedState,
  PrivacyPrefs,
  NotificationPrefs,
} from "./storage.types";
export { DEFAULT_PREFS, DEFAULT_DEMO } from "./storage.constants";

const KEYS = {
  prefs: "nadir.prefs",
  theme: "nadir.theme",
  demo: "nadir.demo",
  events: "nadir.events",
  lockout: "nadir.lockout",
  // Device-level key: intentionally kept across clearWallet so reset does not replay intro.
  intro: "nadir.intro",
} as const;

const SECURE_PASSCODE = "nadir.passcode";

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
    readJson<Prefs>(KEYS.prefs, DEFAULT_PREFS).then(normalizePrefs),
    readJson<DemoPrefs>(KEYS.demo, DEFAULT_DEMO),
    AsyncStorage.getItem(KEYS.events).then((raw) => {
      try {
        return raw ? (JSON.parse(raw) as SecurityEvent[]) : null;
      } catch {
        return null;
      }
    }),
    getPasscodeHash(),
    AsyncStorage.getItem(KEYS.theme).then(parseThemePreference),
    getLockout(),
    AsyncStorage.getItem(KEYS.intro).then(parseIntroSeen, () => false),
  ]);
  return { prefs, demo, events: events ?? [], passcodeHash, theme, lockout, introSeen };
}

export const storage = {
  savePrefs: (prefs: Prefs) => AsyncStorage.setItem(KEYS.prefs, JSON.stringify(prefs)),
  saveTheme: (theme: ThemePreference) => AsyncStorage.setItem(KEYS.theme, theme),
  saveDemo: (demo: DemoPrefs) => AsyncStorage.setItem(KEYS.demo, JSON.stringify(demo)),
  saveEvents: (events: SecurityEvent[]) =>
    AsyncStorage.setItem(KEYS.events, JSON.stringify(events)),
  saveLockout: (state: LockoutState) => AsyncStorage.setItem(KEYS.lockout, JSON.stringify(state)),
  saveIntroSeen: () => AsyncStorage.setItem(KEYS.intro, INTRO_SEEN_VALUE),
  savePasscodeHash: (record: string) => SecureStore.setItemAsync(SECURE_PASSCODE, record),
  saveMnemonic,
  clearWallet: async () => {
    await Promise.all([
      deleteMnemonic().catch(() => undefined),
      SecureStore.deleteItemAsync(SECURE_PASSCODE).catch(() => undefined),
      AsyncStorage.multiRemove([KEYS.prefs, KEYS.events, KEYS.lockout]),
    ]);
  },
};
