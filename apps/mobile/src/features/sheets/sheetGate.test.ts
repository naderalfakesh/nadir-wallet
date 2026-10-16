/// <reference types="node" />
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { groupGuards } from "@/features/lock/routeAccess";
import { gateSheet } from "./sheetGate";

const receive = { name: "receive" };

describe("gateSheet", () => {
  it("shows the open sheet while the wallet group is open", () => {
    expect(gateSheet(true, receive)).toEqual({ shown: receive, mustClose: false });
  });

  it("hides and drops an open sheet when the wallet locks, auto-locks or resets", () => {
    for (const access of [
      { onboarded: true, unlocked: false },
      { onboarded: false, unlocked: false },
    ]) {
      expect(gateSheet(groupGuards(access).wallet, receive)).toEqual({ shown: null, mustClose: true });
    }
  });

  it("has nothing to do when no sheet is open", () => {
    expect(gateSheet(false, null)).toEqual({ shown: null, mustClose: false });
    expect(gateSheet(true, null)).toEqual({ shown: null, mustClose: false });
  });
});

describe("SheetHost wiring", () => {
  const src = join(__dirname, "..", "..");

  it("the root layout mounts the host once, bound to the wallet group's guard", () => {
    const layout = readFileSync(join(src, "app", "_layout.tsx"), "utf8");
    expect(layout.match(/<SheetHost\b[^>]*\/>/g)).toEqual(["<SheetHost walletOpen={guard.wallet} />"]);
  });

  it("the host renders nothing and closes the sheet while the wallet group is closed", () => {
    const host = readFileSync(join(__dirname, "SheetHost.tsx"), "utf8");
    expect(host).toMatch(/if \(!walletOpen\) return null;/);
    expect(host).toMatch(/if \(mustClose\) close\(\);/);
  });
});
