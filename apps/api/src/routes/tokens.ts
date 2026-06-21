import { Hono } from "hono";
import { z } from "zod";
import type { TokensResponse } from "@nadir-wallet/types";
import { getTokens } from "@nadir-wallet/crypto-core";
import { requireNetworkId } from "../lib/request";
import { parseOrThrow } from "../lib/validation";

const querySchema = z.object({ networkId: z.string() });

export const tokensRoutes = new Hono();

tokensRoutes.get("/tokens", (c) => {
  const input = parseOrThrow(querySchema, c.req.query());
  const networkId = requireNetworkId(input.networkId);
  return c.json({ networkId, tokens: getTokens(networkId) } satisfies TokensResponse);
});
