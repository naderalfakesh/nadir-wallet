import type {
  NetworkId,
  TransactionSimulationRequest,
  TransactionSimulationResponse,
  TransactionType,
} from "@nadir-wallet/types";
import { getNetwork, isEvmAddress, normalizeAddress } from "@nadir-wallet/crypto-core";
import { assessAddressRisk } from "./risk";
import {
  CONTRACT_INTERACTION_GAS_LIMIT,
  DEFAULT_TRANSFER_GAS_LIMIT,
  FALLBACK_GAS_PRICE_GWEI,
  NETWORK_GAS_PRICE_GWEI,
} from "./constants";

const GWEI = 1_000_000_000n;
const WEI_PER_ETHER = 1_000_000_000_000_000_000n;

function gasPriceGwei(networkId: NetworkId): number {
  return NETWORK_GAS_PRICE_GWEI[networkId] ?? FALLBACK_GAS_PRICE_GWEI;
}

function formatWei(wei: bigint): string {
  const whole = wei / WEI_PER_ETHER;
  const fraction = (wei % WEI_PER_ETHER).toString().padStart(18, "0").replace(/0+$/, "");
  return fraction.length > 0 ? `${whole}.${fraction}` : `${whole}`;
}

export function simulateTransaction(
  request: TransactionSimulationRequest,
): TransactionSimulationResponse {
  const network = getNetwork(request.networkId);
  const symbol = network?.nativeCurrency.symbol ?? "ETH";

  const hasData = Boolean(request.data && request.data !== "0x");
  const type: TransactionType = hasData ? "contract_interaction" : "send";

  const gasLimit = hasData ? CONTRACT_INTERACTION_GAS_LIMIT : DEFAULT_TRANSFER_GAS_LIMIT;
  const priceGwei = gasPriceGwei(request.networkId);
  const maxFeePerGasWei = (BigInt(Math.round(priceGwei * 10)) * GWEI) / 10n;
  const feeWei = gasLimit * maxFeePerGasWei;

  const fromValid = isEvmAddress(request.from);
  const toValid = isEvmAddress(request.to);

  const warnings: string[] = [];
  if (!fromValid) {
    warnings.push("Sender address is invalid");
  }
  if (!toValid) {
    warnings.push("Recipient address is invalid");
  }
  if (fromValid && toValid && normalizeAddress(request.from) === normalizeAddress(request.to)) {
    warnings.push("Sender and recipient are the same address");
  }

  const value = request.value ?? "0";
  if (!hasData && Number(value) === 0) {
    warnings.push("This transaction sends a zero amount");
  }
  if (hasData) {
    warnings.push("This is a contract interaction; review the calldata carefully");
  }

  const risk = assessAddressRisk({
    address: request.to,
    networkId: request.networkId,
    amount: request.value,
  });
  warnings.push(...risk.warnings);

  return {
    isValid: fromValid && toValid && Number.isFinite(Number(value)),
    riskLevel: risk.riskLevel,
    estimatedFee: {
      gasLimit: gasLimit.toString(),
      maxFeePerGasGwei: priceGwei.toString(),
      feeNative: formatWei(feeWei),
      symbol,
    },
    warnings,
    preview: {
      networkId: request.networkId,
      from: fromValid ? normalizeAddress(request.from) : request.from,
      to: toValid ? normalizeAddress(request.to) : request.to,
      valueFormatted: value,
      symbol,
      type,
    },
  };
}
