import { Hono } from "hono";
import { SUPPORTED_NETWORKS } from "@repo/crypto-core";

const startedAt = Date.now();

export const systemRoutes = new Hono();

systemRoutes.get("/health", (c) =>
  c.json({
    status: "ok",
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
    version: "0.1.0",
  }),
);

systemRoutes.get("/networks", (c) => c.json({ networks: SUPPORTED_NETWORKS }));
