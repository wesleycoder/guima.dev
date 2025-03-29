import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const genres = sqliteTable('genres', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
})
