import { Hono } from "hono";
import { z } from "zod";
import type { PricesResponse } from "@secure-wallet/types";
import { badRequest } from "../lib/errors";
import { parseOrThrow } from "../lib/validation";
import { getPrices } from "../services/prices";

const querySchema = z.object({ symbols: z.string().min(1) });

export const pricesRoutes = new Hono();

pricesRoutes.get("/prices", async (c) => {
  const { symbols } = parseOrThrow(querySchema, c.req.query());
  const requested = symbols
    .split(",")
    .map((symbol) => symbol.trim())
    .filter(Boolean);

  if (requested.length === 0) {
    throw badRequest("Provide at least one symbol");
  }

  const prices = await getPrices(requested);
  return c.json({ prices } satisfies PricesResponse);
});
