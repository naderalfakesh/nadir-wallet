import { english, generateMnemonic as viemGenerateMnemonic, mnemonicToAccount } from "viem/accounts";
import { validateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";

// Standard EVM account derivation path (account 0, address 0).
export const DEFAULT_EVM_PATH = "m/44'/60'/0'/0/0";

/** Generates a fresh, valid BIP39 mnemonic (12 words / 128-bit). */
export function generateMnemonic(): string {
  return viemGenerateMnemonic(english);
}

export interface MnemonicValidation {
  wordCount: number;
  wordCountValid: boolean;
  /** First word not in the BIP39 wordlist, or null. */
  invalidWord: string | null;
  checksumValid: boolean;
  valid: boolean;
}

function normalize(phrase: string): string[] {
  return phrase.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

/**
 * Validates a phrase against BIP39: word count, wordlist membership, and
 * checksum. `mnemonicToAccount` alone does not check the checksum, so this is
 * required to reject mistyped phrases.
 */
export function validateMnemonicPhrase(phrase: string): MnemonicValidation {
  const words = normalize(phrase);
  const wordCount = words.length;
  const wordCountValid = wordCount === 12 || wordCount === 24;
  const invalidWord = words.find((w) => !wordlist.includes(w)) ?? null;
  const checksumValid =
    wordCountValid && invalidWord === null && validateMnemonic(words.join(" "), wordlist);
  return {
    wordCount,
    wordCountValid,
    invalidWord,
    checksumValid,
    valid: wordCountValid && invalidWord === null && checksumValid,
  };
}

/** Derives the checksummed EVM address for a mnemonic at the default path. */
export function mnemonicToEvmAddress(phrase: string): string {
  return mnemonicToAccount(normalize(phrase).join(" ")).address;
}
