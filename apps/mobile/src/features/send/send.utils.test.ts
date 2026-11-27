import { describe, expect, it } from "vitest";
import { RECIPIENTS, TOKENS, tokenById } from "@/features/wallet/demoData";
import type { PortfolioToken } from "@/features/wallet/types";
import {
  applyAmountKey,
  checkScanForToken,
  getBalanceAfter,
  getInitialToken,
  getLiveSimulationStatus,
  getLocalSimulationStatus,
  getRecipientValidation,
  getReviewCtaState,
  getRiskCopy,
  getSendTotal,
  pickTokenForScan,
  resolveRecipientAddress,
  resolveSendFee,
} from "./send.utils";

const t = (key: string) => key;

function token(id: string): PortfolioToken {
  return {
    id,
    symbol: id.toUpperCase(),
    name: id,
    chain: "ethereum",
    amount: 1,
    price: 1,
    change: 0,
    color: "#fff",
    value: 1,
  };
}

describe("getRecipientValidation", () => {
  it("accepts a hex address and trims it", () => {
    const result = getRecipientValidation("  0x70997970C51812dc3A010C7d01b50e0d17dc79C8  ");
    expect(result.trimmedTo).toBe("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
    expect(result.looksAddr).toBe(true);
    expect(result.toValid).toBe(true);
    expect(result.toError).toBe(false);
  });

  it("rejects incomplete and overlong hex addresses", () => {
    expect(getRecipientValidation("0x123456").toValid).toBe(false);
    expect(getRecipientValidation(`0x${"a".repeat(41)}`).toValid).toBe(false);
    for (const recipient of RECIPIENTS) {
      expect(getRecipientValidation(recipient.addr).looksAddr).toBe(true);
    }
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

    expect(getRiskCopy({ level: "low", blocked: false, reason: "known" }, t).levelLabel).toBe(
      "send.risk.levelLow",
    );
    expect(getRiskCopy({ level: "medium", blocked: false, reason: "firstTime" }, t).title).toBe(
      "send.risk.firstTimeTitle",
    );
  });
});

describe("simulation status mapping", () => {
  it("marks local simulation unavailable when checks are down", () => {
    expect(getLocalSimulationStatus({ checksAvailable: false, sendSim: "pass" })).toBe(
      "unavailable",
    );
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
    expect(checkScanForToken(native(SEPOLIA), { ...tokenById("eth"), symbol: "USDC" })).toBe(
      "asset-mismatch",
    );
  });

  it("rejects mainnet chain ids even if they slipped past the parser", () => {
    expect(checkScanForToken(native(1), tokenById("eth"))).toBe("asset-mismatch");
    expect(checkScanForToken(native(137), tokenById("pol"))).toBe("asset-mismatch");
  });

  it("refuses ERC-20 transfer requests regardless of network", () => {
    expect(checkScanForToken({ chainId: SEPOLIA, tokenContract: TOKEN }, tokenById("eth"))).toBe(
      "token-request",
    );
    expect(checkScanForToken({ chainId: AMOY, tokenContract: TOKEN }, tokenById("pol"))).toBe(
      "token-request",
    );
  });
});

describe("pickTokenForScan", () => {
  const SEPOLIA = 11155111;
  const AMOY = 80002;
  const TOKEN = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
  const eth = tokenById("eth");

  it("picks the native token of the scanned network", () => {
    expect(pickTokenForScan({ chainId: SEPOLIA, tokenContract: null }, TOKENS, eth)).toEqual({
      ok: true,
      token: eth,
    });
    expect(pickTokenForScan({ chainId: AMOY, tokenContract: null }, TOKENS, eth)).toEqual({
      ok: true,
      token: tokenById("pol"),
    });
  });

  it("keeps the default token for a chain-less address", () => {
    expect(pickTokenForScan({ chainId: null, tokenContract: null }, TOKENS, eth)).toEqual({
      ok: true,
      token: TOKENS[0],
    });
    expect(pickTokenForScan({ chainId: null, tokenContract: null }, [], eth)).toEqual({
      ok: true,
      token: eth,
    });
  });

  it("refuses token payment requests", () => {
    expect(pickTokenForScan({ chainId: SEPOLIA, tokenContract: TOKEN }, TOKENS, eth)).toEqual({
      ok: false,
      reason: "token-request",
    });
  });

  it("refuses a network the wallet holds no native token for", () => {
    expect(pickTokenForScan({ chainId: AMOY, tokenContract: null }, [eth], eth)).toEqual({
      ok: false,
      reason: "unsupported-chain",
    });
  });
});

describe("send totals", () => {
  const fee = { amount: 0.00042, symbol: "ETH" };

  it("adds the fee into the total when it is paid in the sent token", () => {
    expect(getSendTotal(0.25, "ETH", fee)).toBe("0.25042 ETH");
    expect(getBalanceAfter(0.842, 0.25, "ETH", fee)).toBeCloseTo(0.59158, 8);
  });

  it("lists the fee separately when it is paid in another token", () => {
    expect(getSendTotal(120, "USDC", fee)).toBe("120 USDC + 0.00042 ETH");
    expect(getBalanceAfter(612.4, 120, "USDC", fee)).toBeCloseTo(492.4, 8);
  });

  it("shows the amount alone when no fee estimate is available", () => {
    expect(getSendTotal(0.25, "ETH", null)).toBe("0.25 ETH");
    expect(getBalanceAfter(0.1, 0.25, "ETH", null)).toBe(0);
  });
});

describe("applyAmountKey", () => {
  it("replaces leading zero, appends digits, prevents double decimals, and deletes back to zero", () => {
    expect(applyAmountKey("0", "5")).toBe("5");
    expect(applyAmountKey("0", ".")).toBe("0.");
    expect(applyAmountKey("0.5", ".")).toBe("0.5");
    expect(applyAmountKey("12", "del")).toBe("1");
    expect(applyAmountKey("1", "del")).toBe("0");
  });
});

describe("resolveRecipientAddress", () => {
  it("resolves known ENS names and preserves hex addresses", () => {
    const ens = getRecipientValidation("demo.eth");
    expect(resolveRecipientAddress(ens, RECIPIENTS)).toBe(RECIPIENTS[0].addr);
    expect(resolveRecipientAddress(getRecipientValidation("unknown.eth"), RECIPIENTS)).toBeNull();
    expect(resolveRecipientAddress(getRecipientValidation(RECIPIENTS[1].addr), RECIPIENTS)).toBe(
      RECIPIENTS[1].addr,
    );
  });
});

describe("resolveSendFee", () => {
  it("prefers live estimates, returns null when live without estimate, and falls back in demo mode", () => {
    expect(resolveSendFee({ feeNative: "0.0001", symbol: "ETH" }, "ethereum", true)).toEqual({
      sendFee: { amount: 0.0001, symbol: "ETH" },
      feeLabel: "0.0001 ETH",
    });
    expect(resolveSendFee(undefined, "ethereum", true)).toEqual({ sendFee: null, feeLabel: null });
    expect(resolveSendFee(undefined, "polygon", false).sendFee?.symbol).toBe("POL");
  });
});

describe("getReviewCtaState", () => {
  it("prioritizes blocked, scan mismatch, and simulation failure labels and disables accordingly", () => {
    expect(
      getReviewCtaState({
        blocked: true,
        riskLoading: false,
        scanMismatch: true,
        simulationLoading: false,
        simStatus: "failed",
      }),
    ).toEqual({ labelKey: "send.confirm.blocked", disabled: true });

    expect(
      getReviewCtaState({
        blocked: false,
        riskLoading: false,
        scanMismatch: true,
        simulationLoading: false,
        simStatus: "passed",
      }),
    ).toEqual({ labelKey: "send.confirm.scanMismatch", disabled: true });

    expect(
      getReviewCtaState({
        blocked: false,
        riskLoading: false,
        scanMismatch: false,
        simulationLoading: false,
        simStatus: "passed",
      }),
    ).toEqual({ labelKey: "send.confirm.cta", disabled: false });
  });
});
