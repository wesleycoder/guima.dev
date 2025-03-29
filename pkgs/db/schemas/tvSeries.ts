import { relations, sql } from 'drizzle-orm'
import { type AnySQLiteColumn, integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox'
import { genres } from './genres.ts'
import { tvEpisodes } from './tvEpisodes.ts'

export const tvSeries = sqliteTable('tv_series', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  originalName: text('original_name'),
  overview: text('overview'),
  firstAirDate: text('first_air_date'),
  lastAirDate: text('last_air_date'),
  posterPath: text('poster_path'),
  backdropPath: text('backdrop_path'),
  homepage: text('homepage'),
  inProduction: integer('in_production', { mode: 'boolean' }),
  numberOfEpisodes: integer('number_of_episodes'),
  numberOfSeasons: integer('number_of_seasons'),
  popularity: real('popularity'),
  status: text('status'),
  tagline: text('tagline'),
  type: text('type'),
  voteAverage: real('vote_average'),
  voteCount: integer('vote_count'),
  adult: integer('adult', { mode: 'boolean' }),
  originCountry: text('origin_country'),
  originalLanguage: text('original_language'),
  languages: text('languages'),
  episodeRunTime: text('episode_run_time'),
  createdBy: text('created_by', { mode: 'json' }),
  networks: text('networks', { mode: 'json' }),
  productionCompanies: text('production_companies', { mode: 'json' }),
  productionCountries: text('production_countries', { mode: 'json' }),
  spokenLanguages: text('spoken_languages', { mode: 'json' }),
  lastEpisodeToAirId: integer('last_episode_to_air_id').references((): AnySQLiteColumn => tvEpisodes.id),
  nextEpisodeToAirId: integer('next_episode_to_air_id').references((): AnySQLiteColumn => tvEpisodes.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(strftime('%s', 'now'))`,
  ),
})

export const tvSeriesSchema = createSelectSchema(tvSeries)
export const newTvSeriesSchema = createInsertSchema(tvSeries)
export const changedTvSeriesSchema = createUpdateSchema(tvSeries)
export type TvSeries = typeof tvSeriesSchema.static
export type NewTvSeries = typeof newTvSeriesSchema.static
export type ChangedTvSeries = typeof changedTvSeriesSchema.static

export const tvGenres = sqliteTable(
  'tv_genres',
  {
    tvSeriesId: integer('tv_series_id').notNull().references((): AnySQLiteColumn => tvSeries.id),
    genreId: integer('genre_id').notNull().references((): AnySQLiteColumn => genres.id),
  },
  (table) => [primaryKey({ columns: [table.tvSeriesId, table.genreId] })],
)

export const tvGenresSchema = createSelectSchema(tvGenres)
export const newTvGenresSchema = createInsertSchema(tvGenres)
export const changedTvGenresSchema = createUpdateSchema(tvGenres)
export type TvGenre = typeof tvGenresSchema.static
export type NewTvGenre = typeof newTvGenresSchema.static
export type ChangedTvGenre = typeof changedTvGenresSchema.static

export const tvGenresRelations = relations(tvGenres, ({ one }) => ({
  tvSeries: one(tvSeries, {
    fields: [tvGenres.tvSeriesId],
    references: [tvSeries.id],
  }),
  genre: one(genres, {
    fields: [tvGenres.genreId],
    references: [genres.id],
  }),
}))

export const tvSeriesRelations = relations(tvSeries, ({ one, many }) => ({
  lastEpisodeToAir: one(tvEpisodes, {
    fields: [tvSeries.lastEpisodeToAirId],
    references: [tvEpisodes.id],
    relationName: 'last_episode_to_air',
  }),
  nextEpisodeToAir: one(tvEpisodes, {
    fields: [tvSeries.nextEpisodeToAirId],
    references: [tvEpisodes.id],
    relationName: 'next_episode_to_air',
  }),
  genres: many(tvGenres),
}))
