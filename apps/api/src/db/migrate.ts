import { migrate } from "drizzle-orm/libsql/migrator";
import { client, db } from "./client";

const MIGRATIONS_FOLDER = "./drizzle";

export async function runMigrations(): Promise<void> {
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
}

if (import.meta.url === `file://${process.argv[1]}`) {
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
}
