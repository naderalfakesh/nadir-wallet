import type { AddressRiskCheckResponse, AddressRiskLevel, NetworkId } from "@repo/types";
import { isEvmAddress } from "@repo/crypto-core";
import { LARGE_AMOUNT_THRESHOLD } from "./constants";

export interface RiskAssessmentInput {
  address: string;
  networkId: NetworkId;
  amount?: string;
  knownContact?: boolean;
  isReported?: boolean;
}

const RISK_ORDER: Record<AddressRiskLevel, number> = { low: 0, medium: 1, high: 2 };

function rank(level: AddressRiskLevel): number {
  return RISK_ORDER[level] ?? 0;
}

function escalate(current: AddressRiskLevel, next: AddressRiskLevel): AddressRiskLevel {
  return rank(next) > rank(current) ? next : current;
}

// Real contract detection needs an RPC `eth_getCode` call; until that exists we
// flag zero-padded burn/sink style addresses that are rarely valid recipients.
function looksLikeContractAddress(address: string): boolean {
  return /^0x0{8,}/i.test(address) || /0{8,}$/i.test(address);
}

function isUnusuallyLargeAmount(amount: string): boolean {
  const parsed = Number(amount);
  return Number.isFinite(parsed) && parsed > LARGE_AMOUNT_THRESHOLD;
}

export function assessAddressRisk(input: RiskAssessmentInput): AddressRiskCheckResponse {
  if (!isEvmAddress(input.address)) {
    return {
      riskLevel: "high",
      reasons: ["The address is not a valid EVM address"],
      warnings: ["Do not send funds to this address"],
      isValidAddress: false,
    };
  }

  const reasons: string[] = [];
  const warnings: string[] = [];
  let riskLevel: AddressRiskLevel = "low";

  if (input.isReported) {
    riskLevel = escalate(riskLevel, "high");
    reasons.push("This address has been reported as risky");
    warnings.push("Avoid sending funds unless you fully trust this address");
  }

  if (input.amount && isUnusuallyLargeAmount(input.amount)) {
    riskLevel = escalate(riskLevel, "medium");
    reasons.push("The amount is unusually large for a testnet transfer");
    warnings.push("Confirm the amount before continuing");
  }

  if (input.knownContact === false) {
    riskLevel = escalate(riskLevel, "medium");
    reasons.push("This address is not in your known contacts");
    warnings.push("Double-check the address before sending");
  }

  if (looksLikeContractAddress(input.address)) {
    riskLevel = escalate(riskLevel, "medium");
    reasons.push("This address looks like a contract or burn address");
  }

  if (reasons.length === 0) {
    reasons.push("No risk signals detected");
  }

  return { riskLevel, reasons, warnings, isValidAddress: true };
}
