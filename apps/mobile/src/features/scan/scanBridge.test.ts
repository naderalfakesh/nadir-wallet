import { describe, expect, it, vi } from "vitest";
import { beginScan, deliverScan, extractEvmAddress } from "./scanBridge";

const ADDRESS = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

describe("extractEvmAddress", () => {
  it("pulls a bare address", () => {
    expect(extractEvmAddress(ADDRESS)).toBe(ADDRESS);
  });

  it("pulls an address out of an EIP-681 URI", () => {
    expect(extractEvmAddress(`ethereum:${ADDRESS}@11155111`)).toBe(ADDRESS);
  });

  it("returns null when there is no address", () => {
    expect(extractEvmAddress("just some text")).toBeNull();
    expect(extractEvmAddress("0x1234")).toBeNull();
  });
});

describe("beginScan / deliverScan", () => {
  it("delivers the result to the registered opener exactly once", () => {
    const onResult = vi.fn();
    beginScan(onResult);
    deliverScan(ADDRESS);
    deliverScan(ADDRESS);
    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith(ADDRESS);
  });

  it("delivers null on cancel", () => {
    const onResult = vi.fn();
    beginScan(onResult);
    deliverScan(null);
    expect(onResult).toHaveBeenCalledWith(null);
  });
});
