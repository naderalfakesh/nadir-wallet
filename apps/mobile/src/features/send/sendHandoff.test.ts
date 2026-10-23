import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { clearScanHandoff, handOffScanToSend, takeScanHandoff } from "./sendHandoff";

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

  it("drops a pending target when cleared", () => {
    handOffScanToSend(target);
    clearScanHandoff();
    expect(takeScanHandoff()).toBeNull();
  });

  it("is cleared when the session locks or the wallet resets", () => {
    const source = readFileSync(new URL("../../providers/AppProvider.tsx", import.meta.url), "utf8");
    expect(source).toMatch(/const lockSession = useCallback\(\(\) => \{\s*clearScanHandoff\(\);/);
    expect(source).toMatch(/clearWallet\(\);\s*clearScanHandoff\(\);/);
  });
});
