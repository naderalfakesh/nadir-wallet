import { describe, expect, it } from "vitest";
import { buildReceiveQrPayload } from "./receive.utils";

const ADDRESS = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

describe("buildReceiveQrPayload", () => {
  it("encodes EIP-681 chain-qualified URIs for supported native assets", () => {
    expect(buildReceiveQrPayload(ADDRESS, "ethereum")).toEqual({
      value: `ethereum:${ADDRESS}@11155111`,
      chainQualified: true,
    });
    expect(buildReceiveQrPayload(ADDRESS, "polygon", "POL")).toEqual({
      value: `ethereum:${ADDRESS}@80002`,
      chainQualified: true,
    });
  });

  it("falls back to the bare address for non-native tokens or unsupported chains", () => {
    expect(buildReceiveQrPayload(ADDRESS, "ethereum", "USDC")).toEqual({
      value: ADDRESS,
      chainQualified: false,
    });
    expect(buildReceiveQrPayload(ADDRESS, "base", "ETH")).toEqual({
      value: ADDRESS,
      chainQualified: false,
    });
  });
});
