CREATE TABLE `directories` (
	`id` integer PRIMARY KEY NOT NULL,
	`path` text NOT NULL,
	`row_created_at` integer,
	`row_updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `directories_path_unique` ON `directories` (`path`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_directories_path` ON `directories` (`path`);--> statement-breakpoint
CREATE TABLE `directory_tags` (
	`dir_id` integer,
	`tag_id` integer,
	`row_created_at` integer,
	`row_updated_at` integer,
	PRIMARY KEY(`dir_id`, `tag_id`),
	FOREIGN KEY (`dir_id`) REFERENCES `directories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_dir_tags_tag` ON `directory_tags` (`tag_id`);--> statement-breakpoint
CREATE INDEX `idx_dir_tags_dir` ON `directory_tags` (`dir_id`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`row_created_at` integer,
	`row_updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_tags_name` ON `tags` (`name`);