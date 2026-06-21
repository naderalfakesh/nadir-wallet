import { describe, expect, it } from "vitest";
import { generateMnemonic, mnemonicToEvmAddress, validateMnemonicPhrase } from "./wallet";

// Canonical BIP39 test phrase with a valid checksum.
const VALID = "test test test test test test test test test test test junk";
const ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

describe("validateMnemonicPhrase", () => {
  it("accepts a valid 12-word phrase", () => {
    const result = validateMnemonicPhrase(VALID);
    expect(result.valid).toBe(true);
    expect(result.wordCount).toBe(12);
    expect(result.invalidWord).toBeNull();
    expect(result.checksumValid).toBe(true);
  });

  it("normalizes casing and surrounding whitespace", () => {
    expect(validateMnemonicPhrase(`  ${VALID.toUpperCase()}  `).valid).toBe(true);
  });

  it("rejects a wrong word count", () => {
    const result = validateMnemonicPhrase("test test test");
    expect(result.wordCountValid).toBe(false);
    expect(result.valid).toBe(false);
  });

  it("flags a word outside the BIP39 wordlist", () => {
    const result = validateMnemonicPhrase(VALID.replace("junk", "zzzz"));
    expect(result.invalidWord).toBe("zzzz");
    expect(result.valid).toBe(false);
  });

  it("rejects valid words with a bad checksum", () => {
    const result = validateMnemonicPhrase("test test test test test test test test test test test test");
    expect(result.wordCountValid).toBe(true);
    expect(result.invalidWord).toBeNull();
    expect(result.checksumValid).toBe(false);
    expect(result.valid).toBe(false);
  });
});

describe("mnemonicToEvmAddress", () => {
  it("derives the checksummed address at the default path", () => {
    expect(mnemonicToEvmAddress(VALID)).toBe(ADDRESS);
  });
});

describe("generateMnemonic", () => {
  it("produces a phrase that validates", () => {
    expect(validateMnemonicPhrase(generateMnemonic()).valid).toBe(true);
  });
});
