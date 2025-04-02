import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const messagesTable = sqliteTable('messages', {
  id: integer('id').primaryKey(),
  server: text('server').notNull(),
  topic: text('topic').notNull(),
  message: text('message').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const schema = {
  messages: messagesTable,
};
