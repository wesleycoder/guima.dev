CREATE TABLE `ntfy_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`server_id` text NOT NULL,
	`topic_id` text NOT NULL,
	`message` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text,
	FOREIGN KEY (`server_id`) REFERENCES `ntfy_servers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`topic_id`) REFERENCES `ntfy_topics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ntfy_servers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`url` TEXT DEFAULT '"https://ntfy.sh/"' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ntfy_servers_url_unique` ON `ntfy_servers` (`url`);--> statement-breakpoint
CREATE TABLE `ntfy_topics` (
	`id` text PRIMARY KEY NOT NULL,
	`description` text,
	`topic` text NOT NULL,
	`server_id` text NOT NULL,
	FOREIGN KEY (`server_id`) REFERENCES `ntfy_servers`(`id`) ON UPDATE no action ON DELETE no action
);
