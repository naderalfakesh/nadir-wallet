import { Hono } from "hono";
import { z } from "zod";
import { getTokens, isSupportedNetworkId } from "@repo/crypto-core";
import { badRequest } from "../lib/errors";
import { parseOrThrow } from "../lib/validation";

const querySchema = z.object({ networkId: z.string() });

export const tokensRoutes = new Hono();

tokensRoutes.get("/tokens", (c) => {
  const { networkId } = parseOrThrow(querySchema, c.req.query());
  if (!isSupportedNetworkId(networkId)) {
    throw badRequest(`Unsupported networkId: ${networkId}`);
  }
  return c.json({ networkId, tokens: getTokens(networkId) });
});
