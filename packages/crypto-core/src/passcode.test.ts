import { describe, expect, it } from "vitest";
import {
  hashPasscode,
  hashPasscodeAsync,
  isPasscodeRecord,
  parsePasscodeRecord,
  verifyPasscode,
  verifyPasscodeAsync,
} from "./passcode";

const SALT = new Uint8Array(16).fill(7);

describe("hashPasscode", () => {
  it("produces a self-describing record", () => {
    const record = parsePasscodeRecord(hashPasscode("123456", { salt: SALT, iterations: 64 }));
    expect(record).not.toBeNull();
    expect(record?.scheme).toBe("pbkdf2-sha256");
    expect(record?.iterations).toBe(64);
    expect(record?.salt).toEqual(SALT);
    expect(record?.hash).toHaveLength(32);
  });

  it("is deterministic for the same salt and different across salts", () => {
    const a = hashPasscode("123456", { salt: SALT, iterations: 64 });
    const b = hashPasscode("123456", { salt: SALT, iterations: 64 });
    const c = hashPasscode("123456", { iterations: 64 });
    expect(a).toBe(b);
    expect(c).not.toBe(a);
  });

  it("matches the async variant", async () => {
    const sync = hashPasscode("424242", { salt: SALT, iterations: 64 });
    const async = await hashPasscodeAsync("424242", { salt: SALT, iterations: 64 });
    expect(async).toBe(sync);
  });
});

describe("verifyPasscode", () => {
  const stored = hashPasscode("123456", { iterations: 64 });

  it("accepts the original pin", async () => {
    expect(verifyPasscode("123456", stored)).toBe(true);
    expect(await verifyPasscodeAsync("123456", stored)).toBe(true);
  });

  it("rejects a different pin", async () => {
    expect(verifyPasscode("123457", stored)).toBe(false);
    expect(await verifyPasscodeAsync("654321", stored)).toBe(false);
  });

  it("never verifies against a malformed or legacy plaintext value", () => {
    expect(verifyPasscode("123456", "123456")).toBe(false);
    expect(verifyPasscode("123456", "")).toBe(false);
    expect(verifyPasscode("123456", "pbkdf2-sha256$0$00$00")).toBe(false);
    expect(verifyPasscode("123456", "pbkdf2-sha256$64$zz$00")).toBe(false);
  });
});

describe("isPasscodeRecord", () => {
  it("distinguishes records from plaintext", () => {
    expect(isPasscodeRecord(hashPasscode("000000", { iterations: 64 }))).toBe(true);
    expect(isPasscodeRecord("000000")).toBe(false);
    expect(isPasscodeRecord("pbkdf2-sha256$64$abcd")).toBe(false);
  });
});
