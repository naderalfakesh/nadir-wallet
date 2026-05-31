import { eq } from "drizzle-orm";
import type {
  AddressRiskCheckRequest,
  AddressRiskCheckResponse,
  NetworkId,
} from "@repo/types";
import { normalizeAddress } from "@repo/crypto-core";
import { assessAddressRisk } from "@repo/wallet-core";
import { db } from "../db/client";
import { reportedAddresses, securityChecks } from "../db/schema";

async function isAddressReported(address: string): Promise<boolean> {
  const row = await db
    .select({ id: reportedAddresses.id })
    .from(reportedAddresses)
    .where(eq(reportedAddresses.address, address.toLowerCase()))
    .get();
  return Boolean(row);
}

export async function checkAddress(
  request: AddressRiskCheckRequest,
): Promise<AddressRiskCheckResponse> {
  const reported = await isAddressReported(request.address);
  const result = assessAddressRisk({
    address: request.address,
    networkId: request.networkId,
    amount: request.amount,
    knownContact: request.knownContact,
    isReported: reported,
  });

  await db.insert(securityChecks).values({
    address: request.address.toLowerCase(),
    networkId: request.networkId,
    riskLevel: result.riskLevel,
    reasons: result.reasons,
    createdAt: Date.now(),
  });

  return result;
}

export interface ReportAddressInput {
  address: string;
  reason: string;
  networkId?: NetworkId;
}

export async function reportAddress(input: ReportAddressInput): Promise<{ id: number }> {
  const address = normalizeAddress(input.address).toLowerCase();
  const inserted = await db
    .insert(reportedAddresses)
    .values({
      address,
      networkId: input.networkId ?? null,
      reason: input.reason,
      createdAt: Date.now(),
    })
    .returning({ id: reportedAddresses.id });

  const row = inserted[0];
  if (!row) {
    throw new Error("Failed to store reported address");
  }
  return { id: row.id };
}
