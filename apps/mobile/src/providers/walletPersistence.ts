import type { Prefs } from "@/services/storage";

export interface WalletWrites {
  saveMnemonic: (mnemonic: string) => Promise<void>;
  savePrefs: (prefs: Prefs) => Promise<void>;
}

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
    backupConfirmed: !opts.imported,
    walletAddress: address,
    walletCreatedAt: opts.now,
  };
  await writes.savePrefs(next);
  return next;
}

export async function persistPasscode(
  pin: string,
  hash: (pin: string) => Promise<string>,
  save: (record: string) => Promise<void>,
): Promise<string> {
  const record = await hash(pin);
  await save(record);
  return record;
}
