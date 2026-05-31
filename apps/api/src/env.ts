import { z } from "zod";

try {
  process.loadEnvFile();
} catch {
  // No local .env file; fall back to real environment variables and defaults.
}

const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(8787),
  DATABASE_URL: z.string().min(1).default("file:./local.db"),
  RPC_URL_ETHEREUM_SEPOLIA: z.string().default(""),
  RPC_URL_POLYGON_AMOY: z.string().default(""),
});

export const env = EnvSchema.parse(process.env);
