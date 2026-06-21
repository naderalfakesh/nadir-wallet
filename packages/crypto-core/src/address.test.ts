import { describe, expect, it } from "vitest";
import { isEvmAddress, normalizeAddress, shortenAddress } from "./address";

const LOWER = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
const CHECKSUM = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

describe("isEvmAddress", () => {
  it("accepts well-formed addresses", () => {
    expect(isEvmAddress(CHECKSUM)).toBe(true);
    expect(isEvmAddress(LOWER)).toBe(true);
  });

  it("rejects malformed input", () => {
    expect(isEvmAddress("0x123")).toBe(false);
    expect(isEvmAddress("not-an-address")).toBe(false);
    expect(isEvmAddress("")).toBe(false);
  });
});

describe("normalizeAddress", () => {
  it("returns the EIP-55 checksummed form", () => {
    expect(normalizeAddress(LOWER)).toBe(CHECKSUM);
  });

  it("falls back to the trimmed input when invalid", () => {
    expect(normalizeAddress("  oops  ")).toBe("oops");
  });
});

describe("shortenAddress", () => {
  it("abbreviates the middle", () => {
    expect(shortenAddress(CHECKSUM)).toBe("0xf39F…2266");
  });

  it("leaves short strings untouched", () => {
    expect(shortenAddress("0x1234")).toBe("0x1234");
  });
});
