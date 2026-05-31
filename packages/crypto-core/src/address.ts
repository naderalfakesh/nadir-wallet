import { getAddress, isAddress } from "viem";

export function isEvmAddress(value: string): boolean {
  return isAddress(value, { strict: false });
}

export function normalizeAddress(address: string): string {
  try {
    return getAddress(address);
  } catch {
    return address.trim();
  }
}

export function shortenAddress(address: string, visible = 4): string {
  if (address.length <= visible * 2 + 2) {
    return address;
  }
  return `${address.slice(0, visible + 2)}…${address.slice(-visible)}`;
}
