import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { ulid } from 'ulid'

export const movies = sqliteTable('movies', {
  id: text('id').primaryKey().$defaultFn(() => ulid()),
  title: text('title'),
  year: integer('year'),
})
