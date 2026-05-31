import type { NetworkId } from "./network";

export type AddressRiskLevel = "low" | "medium" | "high";

export interface AddressRiskCheckRequest {
  address: string;
  networkId: NetworkId;
  amount?: string;
  knownContact?: boolean;
}

export interface AddressRiskCheckResponse {
  riskLevel: AddressRiskLevel;
  reasons: string[];
  warnings: string[];
  isValidAddress: boolean;
}
