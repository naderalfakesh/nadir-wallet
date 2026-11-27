import { getNetwork } from "@nadir-wallet/crypto-core";
import type { ScanRejectReason, ScanTarget } from "@/features/scan/scanPayload";
import { chainToNetworkId } from "@/features/wallet/chains";
import type { PortfolioToken } from "@/features/wallet/types";
import type { ScanTokenPick } from "./send.types";

/**
 * Whether a scanned target can be sent with the selected token. A chain-less
 * address keeps the current network (EIP-681). A chain-qualified code must
 * name the selected token's network, and that token must be its native asset.
 * ERC-20 requests are refused: demo tokens carry no contract to match against.
 */
export function checkScanForToken(
  target: Pick<ScanTarget, "chainId" | "tokenContract">,
  token: PortfolioToken,
): ScanRejectReason | null {
  if (target.tokenContract !== null) return "token-request";
  if (target.chainId === null) return null;
  const networkId = chainToNetworkId(token.chain);
  const network = networkId ? getNetwork(networkId) : undefined;
  if (network?.chainId !== target.chainId || network.nativeCurrency.symbol !== token.symbol) {
    return "asset-mismatch";
  }
  return null;
}

/**
 * For a scan started outside Send, where no token is selected yet: the wallet
 * token a scanned target pays with. A chain-less address keeps the default
 * token; a chain-qualified code picks that network's native token.
 */
export function pickTokenForScan(
  target: Pick<ScanTarget, "chainId" | "tokenContract">,
  tokens: PortfolioToken[],
  fallback: PortfolioToken,
): ScanTokenPick {
  if (target.tokenContract !== null) return { ok: false, reason: "token-request" };
  if (target.chainId === null) {
    return { ok: true, token: tokens[0] ?? fallback };
  }
  const match = tokens.find((token) => checkScanForToken(target, token) === null);
  return match ? { ok: true, token: match } : { ok: false, reason: "unsupported-chain" };
}
