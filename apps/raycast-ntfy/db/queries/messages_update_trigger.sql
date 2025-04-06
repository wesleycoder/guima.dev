-- database: ../../../ntfy.db
BEGIN TRANSACTION;
--> statement-breakpoint
PRAGMA foreign_keys=OFF;
--> statement-breakpoint

DROP TRIGGER IF EXISTS update_messages_updated_at;
--> statement-breakpoint
CREATE TRIGGER update_messages_updated_at
AFTER UPDATE ON `ntfy_messages`
WHEN NEW.updated_at IS OLD.updated_at
BEGIN
UPDATE `ntfy_messages` SET `updated_at` = CURRENT_TIMESTAMP
WHERE `id` = NEW.id;
END;

--> statement-breakpoint
PRAGMA foreign_keys=ON;
--> statement-breakpoint
ROLLBACK TRANSACTION;
--> statement-breakpoint
