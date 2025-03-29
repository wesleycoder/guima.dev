import { relations, sql } from 'drizzle-orm'
import { type AnySQLiteColumn, integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox'
import { genres } from './genres.ts'

export const movies = sqliteTable('movies', {
  id: integer('id').primaryKey(),
  title: text('title').notNull(),
  originalTitle: text('original_title'),
  overview: text('overview'),
  releaseDate: text('release_date'),
  posterPath: text('poster_path'),
  backdropPath: text('backdrop_path'),
  popularity: real('popularity'),
  voteAverage: real('vote_average'),
  voteCount: integer('vote_count'),
  adult: integer('adult', { mode: 'boolean' }),
  video: integer('video', { mode: 'boolean' }),
  originalLanguage: text('original_language'),
  tagline: text('tagline'),
  homepage: text('homepage'),
  status: text('status'),
  imdb_id: text('imdb_id'),
  budget: integer('budget'),
  revenue: integer('revenue'),
  runtime: integer('runtime'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(
    sql`(strftime('%s', 'now'))`,
  ),
})

export const movieSchema = createSelectSchema(movies)
export const newMovieSchema = createInsertSchema(movies)
export const changedMovieSchema = createUpdateSchema(movies)
export type Movie = typeof movieSchema.static
export type NewMovie = typeof newMovieSchema.static
export type ChangedMovie = typeof changedMovieSchema.static

export const movieGenres = sqliteTable(
  'movie_genres',
  {
    movieId: integer('movie_id').notNull().references((): AnySQLiteColumn => movies.id),
    genreId: integer('genre_id').notNull().references((): AnySQLiteColumn => genres.id),
  },
  (table) => [primaryKey({ columns: [table.movieId, table.genreId] })],
)

export const movieGenresSchema = createSelectSchema(movieGenres)
export const newMovieGenresSchema = createInsertSchema(movieGenres)
export const changedMovieGenresSchema = createUpdateSchema(movieGenres)
export type MovieGenre = typeof movieGenresSchema.static
export type NewMovieGenre = typeof newMovieGenresSchema.static
export type ChangedMovieGenre = typeof changedMovieGenresSchema.static

export const movieGenresRelations = relations(movieGenres, ({ one }) => ({
  movie: one(movies, {
    fields: [movieGenres.movieId],
    references: [movies.id],
  }),
  genre: one(genres, {
    fields: [movieGenres.genreId],
    references: [genres.id],
  }),
}))
