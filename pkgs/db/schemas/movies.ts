import { createSchemaUtils } from '@pkgs/ts-utils/typebox'
import { relations, sql } from 'drizzle-orm'
import { type AnySQLiteColumn, integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
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

export const movieUtils = createSchemaUtils(movies)
export type Movie = typeof movieUtils.Select
export type NewMovie = typeof movieUtils.Insert
export type ChangedMovie = typeof movieUtils.Update

export const movieGenres = sqliteTable(
  'movie_genres',
  {
    movieId: integer('movie_id').notNull().references((): AnySQLiteColumn => movies.id),
    genreId: integer('genre_id').notNull().references((): AnySQLiteColumn => genres.id),
  },
  (table) => [primaryKey({ columns: [table.movieId, table.genreId] })],
)

export const movieGenreUtils = createSchemaUtils(movieGenres)
export type MovieGenre = typeof movieGenreUtils.Select
export type NewMovieGenre = typeof movieGenreUtils.Insert
export type ChangedMovieGenre = typeof movieGenreUtils.Update

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
