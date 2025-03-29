import { relations, sql } from 'drizzle-orm'
import { integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { genres } from './genres.ts'

export const tvSeries = sqliteTable('tv_series', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  originalName: text('original_name'),
  overview: text('overview'),
  firstAirDate: text('first_air_date'),
  posterPath: text('poster_path'),
  backdropPath: text('backdrop_path'),
  popularity: real('popularity'),
  voteAverage: real('vote_average'),
  voteCount: integer('vote_count'),
  originCountry: text('origin_country'), // Assuming TEXT, adjust if it's a list/JSON
  originalLanguage: text('original_language'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(strftime('%s', 'now'))`,
  ),
})

export const tvGenres = sqliteTable(
  'tv_genres',
  {
    tvSeriesId: integer('tv_series_id')
      .notNull()
      .references(() => tvSeries.id),
    genreId: integer('genre_id')
      .notNull()
      .references(() => genres.id),
  },
  (table) => [primaryKey({ columns: [table.tvSeriesId, table.genreId] })],
)

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
