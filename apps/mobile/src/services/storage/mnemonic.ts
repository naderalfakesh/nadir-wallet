import * as SecureStore from "expo-secure-store";
import { requireOsAuth, type OsAuthFailure } from "@/services/auth/osAuth";

// Preserves legacy keychain key/options so existing phrases need no migration.
const SECURE_MNEMONIC = "nadir.mnemonic";

export type RevealResult =
  | { ok: true; mnemonic: string }
  | { ok: false; reason: OsAuthFailure | "missing" };

export function saveMnemonic(mnemonic: string): Promise<void> {
  return SecureStore.setItemAsync(SECURE_MNEMONIC, mnemonic);
}

export function deleteMnemonic(): Promise<void> {
  return SecureStore.deleteItemAsync(SECURE_MNEMONIC);
}

export async function revealMnemonic(promptMessage: string): Promise<RevealResult> {
  const auth = await requireOsAuth(promptMessage);
  if (!auth.ok) return auth;
  try {
    const mnemonic = await SecureStore.getItemAsync(SECURE_MNEMONIC);
    return mnemonic ? { ok: true, mnemonic } : { ok: false, reason: "missing" };
  } catch {
    return { ok: false, reason: "failed" };
  }
}
