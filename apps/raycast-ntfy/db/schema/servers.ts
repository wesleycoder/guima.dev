import { relations } from 'drizzle-orm';
import { text } from 'drizzle-orm/sqlite-core';
import { nanoid } from 'nanoid';
import { topicsTable } from './topics';
import { table, url } from './utils/table-helpers';

export const serversTable = table('servers', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid(12)),
  name: text('name').notNull(),
  description: text('description'),
  url: url('url').unique().default(new URL('https://ntfy.sh')).notNull(),
});

export type Server = typeof serversTable.$inferSelect;
export type NewServer = typeof serversTable.$inferInsert;

export const serversRelations = relations(serversTable, ({ many }) => ({
  topics: many(topicsTable),
}));
