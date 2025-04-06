import { sql } from 'drizzle-orm';
import { AnySQLiteColumn, text } from 'drizzle-orm/sqlite-core';
import { nanoid } from 'nanoid';
import { serversTable } from './servers';
import { topicsTable } from './topics';
import { table } from './utils/table-helpers';

/**
 * DB: ADD TO MIGRATIONS: Update trigger
```sql
--> statement-breakpoint
CREATE TRIGGER update_messages_updated_at
AFTER UPDATE ON `ntfy_messages`
WHEN NEW.updated_at IS OLD.updated_at
BEGIN
UPDATE `ntfy_messages` SET `updated_at` = CURRENT_TIMESTAMP
WHERE `id` = NEW.id;
END;
```
 */
export const messagesTable = table('messages', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid(12)),
  serverId: text('server_id')
    .notNull()
    .references((): AnySQLiteColumn => serversTable.id),
  topicId: text('topic_id')
    .notNull()
    .references((): AnySQLiteColumn => topicsTable.id),
  message: text('message', { mode: 'json' }).$type<NtfyMessage>().notNull(),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text('updated_at').$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});

export type Message = typeof messagesTable.$inferSelect;
export type NewMessage = typeof messagesTable.$inferInsert;
