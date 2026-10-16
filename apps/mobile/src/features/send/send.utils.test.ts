import { describe, expect, it } from "vitest";
import { TOKENS, tokenById, type DemoToken } from "@/features/wallet/data";
import {
  checkScanForToken,
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

describe("checkScanForToken", () => {
  const SEPOLIA = 11155111;
  const AMOY = 80002;
  const TOKEN = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
  const native = (chainId: number | null) => ({ chainId, tokenContract: null });

  it("accepts a chain-less address for any selected token", () => {
    for (const t of TOKENS) expect(checkScanForToken(native(null), t)).toBeNull();
  });

  it("accepts a chain-qualified code only for that network's native token", () => {
    expect(checkScanForToken(native(SEPOLIA), tokenById("eth"))).toBeNull();
    expect(checkScanForToken(native(AMOY), tokenById("pol"))).toBeNull();
  });

  it("rejects a code for another supported network", () => {
    expect(checkScanForToken(native(AMOY), tokenById("eth"))).toBe("asset-mismatch");
    expect(checkScanForToken(native(SEPOLIA), tokenById("pol"))).toBe("asset-mismatch");
  });

  it("rejects a Sepolia code when the token is on a network without API support", () => {
    for (const id of ["usdc", "arb", "op"]) {
      expect(checkScanForToken(native(SEPOLIA), tokenById(id))).toBe("asset-mismatch");
    }
  });

  it("rejects a non-native token on the scanned network", () => {
    expect(checkScanForToken(native(SEPOLIA), { ...tokenById("eth"), symbol: "USDC" })).toBe("asset-mismatch");
  });

  it("rejects mainnet chain ids even if they slipped past the parser", () => {
    expect(checkScanForToken(native(1), tokenById("eth"))).toBe("asset-mismatch");
    expect(checkScanForToken(native(137), tokenById("pol"))).toBe("asset-mismatch");
  });

  it("refuses ERC-20 transfer requests regardless of network", () => {
    expect(checkScanForToken({ chainId: SEPOLIA, tokenContract: TOKEN }, tokenById("eth"))).toBe("token-request");
    expect(checkScanForToken({ chainId: AMOY, tokenContract: TOKEN }, tokenById("pol"))).toBe("token-request");
  });
});
