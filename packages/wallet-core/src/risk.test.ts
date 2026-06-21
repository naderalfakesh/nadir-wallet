import { describe, expect, it } from "vitest";
import { assessAddressRisk } from "./risk";

const VALID = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const NETWORK = "ethereum-sepolia";

describe("assessAddressRisk", () => {
  it("flags an invalid address as high risk", () => {
    const result = assessAddressRisk({ address: "0xnope", networkId: NETWORK });
    expect(result.isValidAddress).toBe(false);
    expect(result.riskLevel).toBe("high");
  });

  it("returns low risk for a clean known address", () => {
    const result = assessAddressRisk({ address: VALID, networkId: NETWORK, knownContact: true, amount: "1" });
    expect(result.riskLevel).toBe("low");
    expect(result.isValidAddress).toBe(true);
    expect(result.reasons).toContain("No risk signals detected");
  });

  it("escalates reported addresses to high", () => {
    expect(assessAddressRisk({ address: VALID, networkId: NETWORK, isReported: true }).riskLevel).toBe("high");
  });

  it("treats unknown contacts and large amounts as medium", () => {
    expect(assessAddressRisk({ address: VALID, networkId: NETWORK, knownContact: false }).riskLevel).toBe("medium");
    expect(assessAddressRisk({ address: VALID, networkId: NETWORK, amount: "9" }).riskLevel).toBe("medium");
  });

  it("flags burn-style addresses", () => {
    const result = assessAddressRisk({ address: "0x0000000000000000000000000000000000000000", networkId: NETWORK });
    expect(result.riskLevel).toBe("medium");
  });

  it("keeps the highest signal when several apply", () => {
    const result = assessAddressRisk({
      address: VALID,
      networkId: NETWORK,
      isReported: true,
      amount: "9",
      knownContact: false,
    });
    expect(result.riskLevel).toBe("high");
  });
});
