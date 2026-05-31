import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const priceCache = sqliteTable("price_cache", {
  symbol: text("symbol").primaryKey(),
  priceUsd: real("price_usd").notNull(),
  source: text("source").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const reportedAddresses = sqliteTable("reported_addresses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  address: text("address").notNull(),
  networkId: text("network_id"),
  reason: text("reason").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const securityChecks = sqliteTable("security_checks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  address: text("address").notNull(),
  networkId: text("network_id").notNull(),
  riskLevel: text("risk_level").notNull(),
  reasons: text("reasons", { mode: "json" }).$type<string[]>().notNull(),
  createdAt: integer("created_at").notNull(),
});
