import { env } from '#/env.ts'
import type { operations, paths } from '#/tmdb-api.ts'
import createClient from 'openapi-fetch'

export const client = createClient<paths, 'application/json'>({
  baseUrl: env.TMDB_API_BASE_URL,
  headers: { Authorization: `Bearer ${env.TMDB_API_KEY}` },
})

export type Movie = operations['movie-details']['responses']['200']['content']['application/json']
export type MovieSearch = operations['search-movie']['responses']['200']['content']['application/json']

export default client
