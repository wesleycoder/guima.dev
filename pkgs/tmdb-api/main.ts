import client, { type Movie, type MovieSearch } from '#/client.ts'
import * as movie from '#/movie.ts'
import * as tv from '#/tv.ts'

export const getMovieById = async (movieId: number) => {
  const res = await client.GET('/3/movie/{movie_id}', {
    params: { path: { movie_id: movieId } },
  })

  if (!res.data) {
    throw new Error(`Movie with id "${movieId}" not found`)
  }

  return res.data satisfies Movie
}

export const getMoviesByIds = async (ids: number[]) => {
  return await Promise.all(ids.map((id) => getMovieById(id)))
}

export const searchMovies = async (query: string) => {
  const res = await client.GET('/3/search/movie', {
    params: { query: { query } },
  })

  if (!res.data) {
    throw new Error('No movies found')
  }

  return res.data satisfies MovieSearch
}

export default {
  client,
  ...movie,
  ...tv,
}
