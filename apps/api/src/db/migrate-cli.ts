// `pnpm db:migrate` entry point. Kept separate from migrate.ts so the server
// bundle never runs the CLI branch and closes the shared client.
import { client } from "./client";
import { runMigrations } from "./migrate";

runMigrations()
  .then(() => {
    console.log("Migrations applied");
    client.close();
  })
  .catch((error) => {
    console.error("Migration failed", error);
    client.close();
    process.exit(1);
  });
