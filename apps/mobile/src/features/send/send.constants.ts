import type { ChainId } from "@/features/wallet/data";
import type { SendStep } from "./send.types";

export const GAS_SYMBOL: Record<ChainId, string> = {
  ethereum: "SepoliaETH",
  base: "BaseETH",
  arbitrum: "ArbETH",
  optimism: "OPETH",
  polygon: "POL",
};

export const FEE_NATIVE = 0.00042;

export const HIGH_VALUE_USD = 1000;

export const DEMO_PASTE_ADDRESS = "0x6b2fA0e1c4D9b8721a3F5e0c91A4";

export const SEND_STEPS: readonly SendStep[] = ["to", "amount", "review"];
