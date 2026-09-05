import { isEvmAddress, normalizeAddress, shortenAddress } from "@nadir-wallet/crypto-core";
import { assessAddressRisk } from "@nadir-wallet/wallet-core";

// Checksums and shortens an address for display, reusing the shared crypto-core
// helpers so on-device formatting matches the rest of the stack.
export function displayAddress(address: string, visible = 6): string {
  if (!isEvmAddress(address)) return address;
  return shortenAddress(normalizeAddress(address), visible);
}

// Re-exported for the send flow's local risk fallback (used when the backend is
// unreachable). It takes a public address only - no private material.
export { assessAddressRisk };
