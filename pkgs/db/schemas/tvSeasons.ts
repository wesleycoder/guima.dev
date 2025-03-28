import { relations, sql } from 'drizzle-orm'
import { type AnySQLiteColumn, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox'
import { tvEpisodes } from './tvEpisodes.ts'
import { tvSeries } from './tvSeries.ts'

export const tvSeasons = sqliteTable('tv_seasons', {
  id: integer('id').primaryKey(),
  tvSeriesId: integer('tv_series_id').notNull().references((): AnySQLiteColumn => tvSeries.id),
  seasonNumber: integer('season_number').notNull(),
  name: text('name'),
  overview: text('overview'),
  airDate: text('air_date'),
  posterPath: text('poster_path'),
  episodeCount: integer('episode_count'),
  voteAverage: real('vote_average'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(strftime('%s', 'now'))`,
  ),
})

export const tvSeasonsSchema = createSelectSchema(tvSeasons)
export const newTvSeasonsSchema = createInsertSchema(tvSeasons)
export const changedTvSeasonsSchema = createUpdateSchema(tvSeasons)
export type TvSeason = typeof tvSeasonsSchema.static
export type NewTvSeason = typeof newTvSeasonsSchema.static
export type ChangedTvSeason = typeof changedTvSeasonsSchema.static

export const tvSeasonsRelations = relations(tvSeasons, ({ one, many }) => ({
  series: one(tvSeries, {
    fields: [tvSeasons.tvSeriesId],
    references: [tvSeries.id],
  }),
  episodes: many(tvEpisodes),
}))
