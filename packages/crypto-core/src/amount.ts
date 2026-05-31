import { formatUnits, parseUnits } from "viem";

export function formatTokenAmount(raw: bigint | string, decimals: number): string {
  const value = typeof raw === "bigint" ? raw : BigInt(raw);
  return formatUnits(value, decimals);
}

export function parseTokenAmount(value: string, decimals: number): bigint {
  return parseUnits(value, decimals);
}
