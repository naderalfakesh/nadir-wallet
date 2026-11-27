import {
  english,
  generateMnemonic as viemGenerateMnemonic,
  mnemonicToAccount,
} from "viem/accounts";
import { validateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";

export const DEFAULT_EVM_PATH = "m/44'/60'/0'/0/0";

export function generateMnemonic(): string {
  return viemGenerateMnemonic(english);
}

export interface MnemonicValidation {
  wordCount: number;
  wordCountValid: boolean;
  invalidWord: string | null;
  checksumValid: boolean;
  valid: boolean;
}

function normalize(phrase: string): string[] {
  return phrase.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

export function suggestBip39Words(prefix: string): string[] {
  const normalized = prefix.toLowerCase();
  if (!/^[a-z]{2,8}$/.test(normalized)) return [];
  return wordlist.filter((word) => word.startsWith(normalized)).slice(0, 4);
}

// viem's mnemonicToAccount does not verify the BIP39 checksum, so validate it explicitly here.
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

export function mnemonicToEvmAddress(phrase: string): string {
  return mnemonicToAccount(normalize(phrase).join(" ")).address;
}
