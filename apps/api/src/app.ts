import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { ApiErrorResponse } from "@repo/types";
import { handleError } from "./lib/errors";
import { systemRoutes } from "./routes/system";
import { tokensRoutes } from "./routes/tokens";
import { pricesRoutes } from "./routes/prices";
import { walletRoutes } from "./routes/wallet";
import { transactionRoutes } from "./routes/transaction";
import { securityRoutes } from "./routes/security";

export const app = new Hono();

app.use("*", logger());
app.use("*", cors());

app.route("/", systemRoutes);
app.route("/", tokensRoutes);
app.route("/", pricesRoutes);
app.route("/", walletRoutes);
app.route("/", transactionRoutes);
app.route("/", securityRoutes);

app.notFound((c) => {
  const body: ApiErrorResponse = {
    error: { code: "not_found", message: "Route not found" },
  };
  return c.json(body, 404);
});

app.onError(handleError);
