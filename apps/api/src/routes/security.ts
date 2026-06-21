import { Hono } from "hono";
import { z } from "zod";
import type { ReportAddressResponse } from "@nadir-wallet/types";
import { optionalNetworkId, requireEvmAddress, requireNetworkId } from "../lib/request";
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
  const networkId = requireNetworkId(input.networkId);

  const result = await checkAddress({
    address: input.address,
    networkId,
    amount: input.amount,
    knownContact: input.knownContact,
  });

  return c.json(result);
});

securityRoutes.post("/security/report-address", async (c) => {
  const body = await c.req.json().catch(() => null);
  const input = parseOrThrow(reportSchema, body);
  const address = requireEvmAddress(input.address);
  const networkId = optionalNetworkId(input.networkId);

  const { id } = await reportAddress({
    address,
    reason: input.reason,
    networkId,
  });

  return c.json({ ok: true, id } satisfies ReportAddressResponse, 201);
});
