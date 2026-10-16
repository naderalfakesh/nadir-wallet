import { describe, expect, it, vi } from "vitest";
import activity from "@/i18n/locales/en/activity.json";
import common from "@/i18n/locales/en/common.json";
import home from "@/i18n/locales/en/home.json";
import liveness from "@/i18n/locales/en/liveness.json";
import lock from "@/i18n/locales/en/lock.json";
import onboarding from "@/i18n/locales/en/onboarding.json";
import receive from "@/i18n/locales/en/receive.json";
import scan from "@/i18n/locales/en/scan.json";
import security from "@/i18n/locales/en/security.json";
import send from "@/i18n/locales/en/send.json";
import settings from "@/i18n/locales/en/settings.json";
import sheets from "@/i18n/locales/en/sheets.json";
import status from "@/i18n/locales/en/status.json";
import token from "@/i18n/locales/en/token.json";
import tx from "@/i18n/locales/en/tx.json";

vi.mock("react-native", () => ({ Share: { share: vi.fn() } }));
vi.mock("expo-clipboard", () => ({ setStringAsync: vi.fn() }));

const LOCALES = {
  activity,
  common,
  home,
  liveness,
  lock,
  onboarding,
  receive,
  scan,
  security,
  send,
  settings,
  sheets,
  status,
  token,
  tx,
};

function strings(node: unknown, path = ""): [string, string][] {
  if (typeof node === "string") return [[path, node]];
  if (node && typeof node === "object") {
    return Object.entries(node).flatMap(([k, v]) => strings(v, path ? `${path}.${k}` : k));
  }
  return [];
}

const allStrings = strings(LOCALES);

describe("simulated send copy", () => {
  it("labels every send outcome as simulated", () => {
    expect(send.confirm.cta).toMatch(/simulated/i);
    expect(send.overlay.prompt).toMatch(/simulated/i);
    expect(send.overlay.submitted).toMatch(/simulated/i);
    expect(send.overlay.sentTitle).toMatch(/simulated/i);
    expect(send.overlay.failedTitle).toMatch(/simulated/i);
  });

  it("says nothing is signed or broadcast before and after confirmation", () => {
    for (const text of [
      send.overlay.confirmSub,
      send.overlay.submittedBody,
      send.overlay.sentBody,
      send.overlay.failedBody,
    ]) {
      expect(text).toMatch(/nothing (is|was) signed or broadcast/i);
    }
  });

  it("offers no transaction hash or explorer link for a simulated send", () => {
    expect(send.overlay).not.toHaveProperty("hash");
    expect(send.overlay).not.toHaveProperty("viewOn");
    expect(send.overlay).not.toHaveProperty("details");
    expect(send.overlay.submittedBody).toMatch(/no transaction hash/i);
    expect(send.overlay.sentBody).toMatch(/no transaction hash/i);
  });

  it("marks sample history as demo data without an explorer link", () => {
    expect(tx).not.toHaveProperty("viewOn");
    expect(tx.demoNote).toMatch(/sample data/i);
  });

  it("has no explorer helper left to open placeholder hashes", async () => {
    const device = await import("@/services/device");
    expect(device).not.toHaveProperty("openExplorer");
  });

  it.each([
    /sign(s|ed|ing)? (locally|on-device|on your device)/i,
    /signing happens/i,
    /approve transactions/i,
    /transaction submitted/i,
    /broadcast to \{\{network\}\}\./i,
    /reverted on-chain/i,
    /view on \{\{explorer\}\}/i,
  ])("no English string claims real signing, broadcast or explorer data (%s)", (pattern) => {
    expect(allStrings.filter(([, text]) => pattern.test(text))).toEqual([]);
  });
});
