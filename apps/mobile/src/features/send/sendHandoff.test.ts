import { describe, expect, it } from "vitest";
import { handOffScanToSend, takeScanHandoff } from "./sendHandoff";

const target = {
  recipient: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  chainId: 11155111,
  tokenContract: null,
};

describe("sendHandoff", () => {
  it("is empty by default", () => {
    expect(takeScanHandoff()).toBeNull();
  });

  it("hands a scanned target to Send exactly once", () => {
    handOffScanToSend(target);
    expect(takeScanHandoff()).toEqual(target);
    expect(takeScanHandoff()).toBeNull();
  });

  it("keeps only the latest scan", () => {
    handOffScanToSend({ ...target, chainId: 80002 });
    handOffScanToSend(target);
    expect(takeScanHandoff()).toEqual(target);
  });
});
