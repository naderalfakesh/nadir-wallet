import { isEvmAddress, normalizeAddress, shortenAddress } from "@nadir-wallet/crypto-core";
import { assessAddressRisk } from "@nadir-wallet/wallet-core";

export function displayAddress(address: string, visible = 6): string {
  if (!isEvmAddress(address)) return address;
  return shortenAddress(normalizeAddress(address), visible);
}

export { assessAddressRisk };
