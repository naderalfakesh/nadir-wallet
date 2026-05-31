import type { NetworkId, Token } from "@nadir-wallet/types";
import { getNetwork } from "./networks";

export const NATIVE_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000";

const ERC20_TOKENS: Token[] = [
  {
    networkId: "ethereum-sepolia",
    address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    symbol: "USDC",
    name: "USD Coin (Testnet)",
    decimals: 6,
    isNative: false,
  },
  {
    networkId: "ethereum-sepolia",
    address: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
    symbol: "LINK",
    name: "ChainLink Token",
    decimals: 18,
    isNative: false,
  },
  {
    networkId: "polygon-amoy",
    address: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
    symbol: "USDC",
    name: "USD Coin (Testnet)",
    decimals: 6,
    isNative: false,
  },
];

function nativeToken(networkId: NetworkId): Token {
  const network = getNetwork(networkId);
  if (!network) {
    throw new Error(`Unknown network: ${networkId}`);
  }
  return {
    networkId,
    address: NATIVE_TOKEN_ADDRESS,
    symbol: network.nativeCurrency.symbol,
    name: network.nativeCurrency.name,
    decimals: network.nativeCurrency.decimals,
    isNative: true,
  };
}

export function getTokens(networkId: NetworkId): Token[] {
  const tokens = ERC20_TOKENS.filter((token) => token.networkId === networkId);
  return [nativeToken(networkId), ...tokens];
}
