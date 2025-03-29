import { relations, sql } from 'drizzle-orm'
import { type AnySQLiteColumn, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { tvSeasons } from './tv_seasons.ts'
import { tvSeries } from './tv_series.ts'

export const tvEpisodes = sqliteTable('tv_episodes', {
  id: integer('id').primaryKey(),
  tvSeriesId: integer('tv_series_id').notNull().references((): AnySQLiteColumn => tvSeries.id),
  seasonId: integer('season_id').notNull().references((): AnySQLiteColumn => tvSeasons.id),
  seasonNumber: integer('season_number').notNull(),
  episodeNumber: integer('episode_number').notNull(),
  name: text('name'),
  overview: text('overview'),
  airDate: text('air_date'),
  episodeType: text('episode_type'),
  productionCode: text('production_code'),
  runtime: integer('runtime'),
  stillPath: text('still_path'),
  voteAverage: real('vote_average'),
  voteCount: integer('vote_count'),
  crew: text('crew', { mode: 'json' }),
  guestStars: text('guest_stars', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(strftime('%s', 'now'))`,
  ),
})

export const tvEpisodesRelations = relations(tvEpisodes, ({ one }) => ({
  series: one(tvSeries, {
    fields: [tvEpisodes.tvSeriesId],
    references: [tvSeries.id],
  }),
  season: one(tvSeasons, {
    fields: [tvEpisodes.seasonId],
    references: [tvSeasons.id],
  }),
}))
