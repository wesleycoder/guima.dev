import { env } from '#/env.ts'
import type { operations, paths } from '#/tmdb-api.ts'
import createClient from 'openapi-fetch'

export const client = createClient<paths, 'application/json'>({
  baseUrl: env.TMDB_API_BASE_URL,
  headers: { Authorization: `Bearer ${env.TMDB_API_KEY}` },
})

type Operation<T extends keyof operations> = operations[T]['responses'][200]['content']['application/json']

export type Movie = Operation<'movie-details'>
export type MovieSearch = Operation<'search-movie'>

export type TvSeries = Operation<'tv-series-details'>
export type TvEpisode = Operation<'tv-episode-details'>
export type TvSeason = Operation<'tv-season-details'>
export type TvSeriesSearch = Operation<'search-tv'>

export type Person = Operation<'person-details'>
export type PersonSearch = Operation<'search-person'>

export default client
