import { eq } from "drizzle-orm";
import { db } from "./client";
import { reportedAddresses } from "./schema";

// A clearly-mock address used so the high-risk/reported state is reproducible in
// the showcase without first calling POST /security/report-address. This is demo
// testnet data, not a claim about any real address.
export const DEMO_REPORTED_ADDRESS = "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef";
const DEMO_REASON = "Demo: seeded to showcase the high-risk state (mock testnet data)";

export async function seedDemoData(): Promise<void> {
  const existing = await db
    .select({ id: reportedAddresses.id })
    .from(reportedAddresses)
    .where(eq(reportedAddresses.address, DEMO_REPORTED_ADDRESS))
    .get();

  if (existing) {
    return;
  }

  await db.insert(reportedAddresses).values({
    address: DEMO_REPORTED_ADDRESS,
    networkId: null,
    reason: DEMO_REASON,
    createdAt: Date.now(),
  });
}
