import { describe, expect, it } from "vitest";
import { simulateTransaction } from "./simulation";

const FROM = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const TO = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const NETWORK = "ethereum-sepolia";

describe("simulateTransaction", () => {
  it("estimates a native send", () => {
    const result = simulateTransaction({ networkId: NETWORK, from: FROM, to: TO, value: "1" });
    expect(result.isValid).toBe(true);
    expect(result.preview.type).toBe("send");
    expect(result.estimatedFee.gasLimit).toBe("21000");
    expect(result.estimatedFee.maxFeePerGasGwei).toBe("2.5");
    expect(result.estimatedFee.feeNative).toBe("0.0000525");
    expect(result.estimatedFee.symbol).toBe("ETH");
    expect(result.preview.from).toBe(FROM);
    expect(result.preview.to).toBe(TO);
  });

  it("classifies calldata as a contract interaction", () => {
    const result = simulateTransaction({ networkId: NETWORK, from: FROM, to: TO, value: "0", data: "0xabcd" });
    expect(result.preview.type).toBe("contract_interaction");
    expect(result.estimatedFee.gasLimit).toBe("120000");
    expect(result.warnings).toContain("This is a contract interaction; review the calldata carefully");
  });

  it("warns about an invalid recipient", () => {
    const result = simulateTransaction({ networkId: NETWORK, from: FROM, to: "0xbad", value: "1" });
    expect(result.isValid).toBe(false);
    expect(result.warnings).toContain("Recipient address is invalid");
  });

  it("warns when sender and recipient match", () => {
    const result = simulateTransaction({ networkId: NETWORK, from: FROM, to: FROM, value: "1" });
    expect(result.warnings).toContain("Sender and recipient are the same address");
  });

  it("warns on a zero-value transfer", () => {
    const result = simulateTransaction({ networkId: NETWORK, from: FROM, to: TO, value: "0" });
    expect(result.warnings).toContain("This transaction sends a zero amount");
  });
});
