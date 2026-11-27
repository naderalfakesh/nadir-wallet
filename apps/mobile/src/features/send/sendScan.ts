import { getNetwork } from "@nadir-wallet/crypto-core";
import type { ScanRejectReason, ScanTarget } from "@/features/scan/scanPayload";
import { chainToNetworkId } from "@/features/wallet/chains";
import type { PortfolioToken } from "@/features/wallet/types";
import type { ScanTokenPick } from "./send.types";

// ERC-20 requests are refused because demo tokens carry no contract address to match against.
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
