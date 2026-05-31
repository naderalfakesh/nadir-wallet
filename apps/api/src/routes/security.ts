import { Hono } from "hono";
import { z } from "zod";
import { isEvmAddress, isSupportedNetworkId } from "@repo/crypto-core";
import { badRequest } from "../lib/errors";
import { parseOrThrow } from "../lib/validation";
import { checkAddress, reportAddress } from "../services/security";

const checkSchema = z.object({
  address: z.string(),
  networkId: z.string(),
  amount: z.string().optional(),
  knownContact: z.boolean().optional(),
});

const reportSchema = z.object({
  address: z.string(),
  reason: z.string().min(1),
  networkId: z.string().optional(),
});

export const securityRoutes = new Hono();

securityRoutes.post("/security/check-address", async (c) => {
  const body = await c.req.json().catch(() => null);
  const input = parseOrThrow(checkSchema, body);

  if (!isSupportedNetworkId(input.networkId)) {
    throw badRequest(`Unsupported networkId: ${input.networkId}`);
  }

  const result = await checkAddress({
    address: input.address,
    networkId: input.networkId,
    amount: input.amount,
    knownContact: input.knownContact,
  });

  return c.json(result);
});

securityRoutes.post("/security/report-address", async (c) => {
  const body = await c.req.json().catch(() => null);
  const input = parseOrThrow(reportSchema, body);

  if (!isEvmAddress(input.address)) {
    throw badRequest("Invalid address");
  }
  if (input.networkId && !isSupportedNetworkId(input.networkId)) {
    throw badRequest(`Unsupported networkId: ${input.networkId}`);
  }

  const { id } = await reportAddress({
    address: input.address,
    reason: input.reason,
    networkId: isSupportedNetworkId(input.networkId) ? input.networkId : undefined,
  });

  return c.json({ ok: true, id }, 201);
});
