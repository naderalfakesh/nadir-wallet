import { Hono } from "hono";
import { z } from "zod";
import { simulateTransaction } from "@nadir-wallet/wallet-core";
import { requireNetworkId } from "../lib/request";
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
  const networkId = requireNetworkId(draft.networkId);

  const result = simulateTransaction({
    networkId,
    from: draft.from,
    to: draft.to,
    value: draft.value,
    data: draft.data,
    tokenAddress: draft.tokenAddress,
  });

  return c.json(result);
});
