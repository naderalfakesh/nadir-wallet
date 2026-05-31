import type { NetworkId, TokenBalance } from "@secure-wallet/types";
import { formatTokenAmount, getTokens, parseTokenAmount } from "@secure-wallet/crypto-core";
import { hashString } from "../lib/mock";

// Mock balances derived deterministically from the address so the same wallet
// always returns the same holdings. Swap this for viem `getBalance` / ERC-20
// `balanceOf` calls once an RPC URL is configured.
export function getBalances(address: string, networkId: NetworkId): TokenBalance[] {
  return getTokens(networkId).map((token) => {
    const seed = hashString(`${address.toLowerCase()}:${networkId}:${token.symbol}`);
    const amount = token.isNative
      ? ((seed % 1000) / 100 + 0.25).toFixed(4)
      : ((seed % 90000) / 100 + 5).toFixed(2);
    const raw = parseTokenAmount(amount, token.decimals).toString();
    return {
      token,
      raw,
      formatted: formatTokenAmount(raw, token.decimals),
    };
  });
}
