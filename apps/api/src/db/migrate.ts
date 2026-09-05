import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "./client";

const MIGRATIONS_FOLDER = "./drizzle";

export async function runMigrations(): Promise<void> {
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
}
