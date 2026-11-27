import { getNetwork } from "@nadir-wallet/crypto-core";
import { chainToNetworkId } from "@/features/wallet/chains";
import type { ChainId } from "@/features/wallet/types";

export interface ReceiveQrPayload {
  value: string;
  chainQualified: boolean;
}

/**
 * Builds the receive QR payload. Uses an EIP-681 chain-qualified URI for native
 * assets on API-supported testnets, and falls back to the bare EVM address otherwise.
 */
export function buildReceiveQrPayload(
  address: string,
  chain: ChainId,
  symbol?: string,
): ReceiveQrPayload {
  const networkId = chainToNetworkId(chain);
  const network = networkId ? getNetwork(networkId) : undefined;
  const chainQualified = Boolean(network && (!symbol || symbol === network.nativeCurrency.symbol));
  const value = chainQualified && network ? `ethereum:${address}@${network.chainId}` : address;
  return { value, chainQualified };
}
