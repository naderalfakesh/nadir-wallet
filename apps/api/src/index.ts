import { serve } from "@hono/node-server";
import { app } from "./app";
import { env } from "./env";
import { runMigrations } from "./db/migrate";
import { seedDemoData } from "./db/seed";

async function main(): Promise<void> {
  await runMigrations();
  await seedDemoData();
  serve({ fetch: app.fetch, port: env.PORT }, (info) => {
    console.log(`API ready at http://localhost:${info.port}`);
  });
}

main().catch((error) => {
  console.error("Failed to start API", error);
  process.exit(1);
});
