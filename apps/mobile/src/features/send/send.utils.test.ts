import { describe, expect, it } from "vitest";
import type { DemoToken } from "@/features/wallet/data";
import {
  getInitialToken,
  getLiveSimulationStatus,
  getLocalSimulationStatus,
  getRecipientValidation,
  getRiskCopy,
} from "./send.utils";

const t = (key: string) => key;

function token(id: string): DemoToken {
  return { id, symbol: id.toUpperCase(), name: id, chain: "ethereum", amount: 1, price: 1, change: 0, color: "#fff", value: 1 };
}

describe("getRecipientValidation", () => {
  it("accepts a hex address and trims it", () => {
    const result = getRecipientValidation("  0x70997970C51812dc3A010C7d01b50e0d17dc79C8  ");
    expect(result.trimmedTo).toBe("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
    expect(result.looksAddr).toBe(true);
    expect(result.toValid).toBe(true);
    expect(result.toError).toBe(false);
  });

  it("accepts ENS-style names", () => {
    expect(getRecipientValidation("demo.eth").looksEns).toBe(true);
    expect(getRecipientValidation("demo.sol").toValid).toBe(true);
  });

  it("only reports an error once the input is long enough to judge", () => {
    expect(getRecipientValidation("0x1").toError).toBe(false);
    expect(getRecipientValidation("not-an-address").toError).toBe(true);
  });
});

describe("getRiskCopy", () => {
  it("maps each reason and level to its copy keys", () => {
    const copy = getRiskCopy({ level: "high", blocked: true, reason: "reported" }, t);
    expect(copy.title).toBe("send.risk.reportedTitle");
    expect(copy.levelLabel).toBe("send.risk.levelHigh");

    expect(getRiskCopy({ level: "low", blocked: false, reason: "known" }, t).levelLabel).toBe("send.risk.levelLow");
    expect(getRiskCopy({ level: "medium", blocked: false, reason: "firstTime" }, t).title).toBe("send.risk.firstTimeTitle");
  });
});

describe("simulation status mapping", () => {
  it("marks local simulation unavailable when checks are down", () => {
    expect(getLocalSimulationStatus({ checksAvailable: false, sendSim: "pass" })).toBe("unavailable");
    expect(getLocalSimulationStatus({ checksAvailable: true, sendSim: "fail" })).toBe("failed");
    expect(getLocalSimulationStatus({ checksAvailable: true, sendSim: "pass" })).toBe("passed");
  });

  it("treats idle live simulation as unavailable", () => {
    expect(getLiveSimulationStatus("passed")).toBe("passed");
    expect(getLiveSimulationStatus("failed")).toBe("failed");
    expect(getLiveSimulationStatus("idle")).toBe("unavailable");
    expect(getLiveSimulationStatus("unavailable")).toBe("unavailable");
  });
});

describe("getInitialToken", () => {
  const tokens = [token("eth"), token("usdc")];

  it("selects the routed token when present", () => {
    expect(getInitialToken(tokens, "usdc", token("fallback")).id).toBe("usdc");
  });

  it("falls back to the first token, then the provided fallback", () => {
    expect(getInitialToken(tokens, "missing", token("fallback")).id).toBe("eth");
    expect(getInitialToken([], undefined, token("fallback")).id).toBe("fallback");
  });
});
