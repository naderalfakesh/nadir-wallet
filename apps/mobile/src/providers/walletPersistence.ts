import type { Prefs } from "@/services/storage";

export interface WalletWrites {
  saveMnemonic: (mnemonic: string) => Promise<void>;
  savePrefs: (prefs: Prefs) => Promise<void>;
}

/**
 * Stores the phrase, then the prefs that mark onboarding complete, and only
 * then returns them for the caller to commit. Either write failing rejects, so
 * the app never treats a wallet as set up when the next launch wouldn't.
 */
export async function persistNewWallet(
  mnemonic: string,
  address: string,
  current: Prefs,
  opts: { imported: boolean; now: number },
  writes: WalletWrites,
): Promise<Prefs> {
  await writes.saveMnemonic(mnemonic);
  const next: Prefs = {
    ...current,
    onboardingCompleted: true,
    // Create flow verifies the phrase; import assumes the user has it.
    backupConfirmed: !opts.imported,
    walletAddress: address,
    walletCreatedAt: opts.now,
  };
  await writes.savePrefs(next);
  return next;
}

/** Hashes and stores a PIN; resolves with the record only after the keychain write succeeds. */
export async function persistPasscode(
  pin: string,
  hash: (pin: string) => Promise<string>,
  save: (record: string) => Promise<void>,
): Promise<string> {
  const record = await hash(pin);
  await save(record);
  return record;
}
