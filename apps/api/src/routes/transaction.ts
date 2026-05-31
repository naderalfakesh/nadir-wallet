import { Hono } from "hono";
import { z } from "zod";
import { isSupportedNetworkId } from "@nadir-wallet/crypto-core";
import { simulateTransaction } from "@nadir-wallet/wallet-core";
import { badRequest } from "../lib/errors";
import { parseOrThrow } from "../lib/validation";

const simulateSchema = z.object({
  networkId: z.string(),
  from: z.string(),
  to: z.string(),
  value: z.string().optional(),
  data: z.string().optional(),
  tokenAddress: z.string().optional(),
});

export const transactionRoutes = new Hono();

transactionRoutes.post("/transaction/simulate", async (c) => {
  const body = await c.req.json().catch(() => null);
  const draft = parseOrThrow(simulateSchema, body);

  if (!isSupportedNetworkId(draft.networkId)) {
    throw badRequest(`Unsupported networkId: ${draft.networkId}`);
  }

  const result = simulateTransaction({
    networkId: draft.networkId,
    from: draft.from,
    to: draft.to,
    value: draft.value,
    data: draft.data,
    tokenAddress: draft.tokenAddress,
  });

  return c.json(result);
});
