import { createSchemaUtils } from '@pkgs/ts-utils/typebox'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const genres = sqliteTable('genres', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
})

export const genreUtils = createSchemaUtils(genres)
export type Genre = typeof genreUtils.Select
export type NewGenre = typeof genreUtils.Insert
export type ChangedGenre = typeof genreUtils.Update
