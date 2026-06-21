import type { NetworkId } from "@nadir-wallet/types";
import { isEvmAddress, isSupportedNetworkId, normalizeAddress } from "@nadir-wallet/crypto-core";
import { badRequest } from "./errors";

export function requireNetworkId(value: string): NetworkId {
  if (!isSupportedNetworkId(value)) {
    throw badRequest(`Unsupported networkId: ${value}`);
  }
  return value;
}

export function requireEvmAddress(value: string, message = "Invalid address"): string {
  if (!isEvmAddress(value)) {
    throw badRequest(message);
  }
  return normalizeAddress(value);
}

export function optionalNetworkId(value: string | undefined): NetworkId | undefined {
  if (value == null) return undefined;
  return requireNetworkId(value);
}
