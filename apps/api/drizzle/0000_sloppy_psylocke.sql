CREATE TABLE `price_cache` (
	`symbol` text PRIMARY KEY NOT NULL,
	`price_usd` real NOT NULL,
	`source` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reported_addresses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`address` text NOT NULL,
	`network_id` text,
	`reason` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `security_checks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`address` text NOT NULL,
	`network_id` text NOT NULL,
	`risk_level` text NOT NULL,
	`reasons` text NOT NULL,
	`created_at` integer NOT NULL
);
