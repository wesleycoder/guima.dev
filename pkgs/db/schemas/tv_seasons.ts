import { relations, sql } from 'drizzle-orm'
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { tvEpisodes } from './tv_episodes.ts'
import { tvSeries } from './tv_series.ts'

export const tvSeasons = sqliteTable('tv_seasons', {
  id: integer('id').primaryKey(),
  tvSeriesId: integer('tv_series_id')
    .notNull()
    .references(() => tvSeries.id),
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

export const tvSeasonsRelations = relations(tvSeasons, ({ one, many }) => ({
  series: one(tvSeries, {
    fields: [tvSeasons.tvSeriesId],
    references: [tvSeries.id],
  }),
  episodes: many(tvEpisodes),
}))
