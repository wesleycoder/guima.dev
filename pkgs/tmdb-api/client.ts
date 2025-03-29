import { env } from '#/env.ts'
import type { operations, paths } from '#/tmdb-api.ts'
import createClient from 'openapi-fetch'

export const client = createClient<paths, 'application/json'>({
  baseUrl: env.TMDB_API_BASE_URL,
  headers: { Authorization: `Bearer ${env.TMDB_API_KEY}` },
})

export type Movie = operations['movie-details']['responses']['200']['content']['application/json']
export type MovieSearch = operations['search-movie']['responses']['200']['content']['application/json']

export type TvSeries = operations['tv-series-details']['responses']['200']['content']['application/json']
export type TvEpisode = operations['tv-episode-details']['responses']['200']['content']['application/json']
export type TvSeason = operations['tv-season-details']['responses']['200']['content']['application/json']
export type TvSeriesSearch = operations['search-tv']['responses']['200']['content']['application/json']

export default client
