import type { ChainId } from "@/features/wallet/types";
import type { SendStep } from "./send.types";

export const GAS_SYMBOL: Record<ChainId, string> = {
  ethereum: "ETH",
  base: "ETH",
  arbitrum: "ETH",
  optimism: "ETH",
  polygon: "POL",
};

export const FEE_NATIVE = 0.00042;

export const HIGH_VALUE_USD = 1000;

export const SEND_STEPS: readonly SendStep[] = ["to", "amount", "review"];
