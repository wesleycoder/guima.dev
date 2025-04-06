import { relations } from 'drizzle-orm';
import { AnySQLiteColumn, text } from 'drizzle-orm/sqlite-core';
import { nanoid } from 'nanoid';
import { serversTable } from './servers';
import { table } from './utils/table-helpers';

export const topicsTable = table('topics', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid(12)),
  description: text('description'),
  topic: text('topic').notNull(),
  serverId: text('server_id')
    .notNull()
    .references((): AnySQLiteColumn => serversTable.id),
});

export type Topic = typeof topicsTable.$inferSelect;
export type NewTopic = typeof topicsTable.$inferInsert;

export const topicsRelations = relations(topicsTable, ({ one }) => ({
  server: one(serversTable, {
    fields: [topicsTable.serverId],
    references: [serversTable.id],
  }),
}));
