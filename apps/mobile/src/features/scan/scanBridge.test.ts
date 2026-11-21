import { afterEach, describe, expect, it, vi } from "vitest";
import { beginScan, currentScanSession, deliverScan, evaluateScan } from "./scanBridge";

const ADDRESS = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
// Sepolia USDC, from the crypto-core token list.
const TOKEN = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
const SEPOLIA = 11155111;
const AMOY = 80002;

describe("beginScan / deliverScan", () => {
  const target = { recipient: ADDRESS, chainId: SEPOLIA, tokenContract: null };

  it("delivers the result to the registered opener exactly once", () => {
    const onResult = vi.fn();
    beginScan(onResult);
    deliverScan(target);
    deliverScan(target);
    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith(target);
  });

  it("delivers null on cancel", () => {
    const onResult = vi.fn();
    beginScan(onResult);
    deliverScan(null);
    expect(onResult).toHaveBeenCalledWith(null);
  });

  it("delivers to the session the scanner was opened for", () => {
    const onResult = vi.fn();
    beginScan(onResult);
    deliverScan(target, currentScanSession());
    expect(onResult).toHaveBeenCalledWith(target);
  });

  it("ignores a late cancel or result from a previous scanner session", () => {
    beginScan(vi.fn());
    const stale = currentScanSession();
    const onResult = vi.fn();
    beginScan(onResult);
    deliverScan(null, stale);
    deliverScan(target, stale);
    expect(onResult).not.toHaveBeenCalled();
    deliverScan(target, currentScanSession());
    expect(onResult).toHaveBeenCalledExactlyOnceWith(target);
  });

  it("makes a cancel after delivery a no-op", () => {
    const onResult = vi.fn();
    beginScan(onResult);
    const scanSession = currentScanSession();
    deliverScan(target, scanSession);
    deliverScan(null, scanSession);
    expect(onResult).toHaveBeenCalledExactlyOnceWith(target);
  });
});

describe("evaluateScan", () => {
  afterEach(() => deliverScan(null));

  it("carries chain and token fields through to the opener's check", () => {
    const check = vi.fn().mockReturnValue(null);
    beginScan(vi.fn(), check);
    const payload = `ethereum:${TOKEN}@${SEPOLIA}/transfer?address=${ADDRESS}&uint256=1`;
    expect(evaluateScan(payload)).toEqual({
      ok: true,
      recipient: ADDRESS,
      chainId: SEPOLIA,
      tokenContract: TOKEN,
    });
    expect(check).toHaveBeenCalledWith({
      recipient: ADDRESS,
      chainId: SEPOLIA,
      tokenContract: TOKEN,
    });
  });

  it("returns the opener's veto as a rejection", () => {
    beginScan(vi.fn(), () => "asset-mismatch");
    expect(evaluateScan(`ethereum:${ADDRESS}@${AMOY}`)).toEqual({
      ok: false,
      reason: "asset-mismatch",
    });
  });

  it("never consults the check for a payload the parser rejects", () => {
    const check = vi.fn().mockReturnValue(null);
    beginScan(vi.fn(), check);
    expect(evaluateScan(`ethereum:${ADDRESS}@1`)).toEqual({
      ok: false,
      reason: "unsupported-chain",
    });
    expect(check).not.toHaveBeenCalled();
  });

  it("drops the check once the scan is delivered", () => {
    const check = vi.fn().mockReturnValue("asset-mismatch");
    beginScan(vi.fn(), check);
    deliverScan(null);
    expect(evaluateScan(ADDRESS)).toMatchObject({ ok: true });
    expect(check).not.toHaveBeenCalled();
  });
});
