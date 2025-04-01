import client from '@pkgs/tmdb-api'
import { zod } from '@pkgs/ts-utils/typebox'

const getMovieByIdInputSchema = { id: zod('number') }

export const getMovieById: TMDBTool<typeof getMovieByIdInputSchema> = {
  name: 'get_movie_by_id',
  description: 'Get a movie by its ID. Useful for getting information about a single movie by its ID',
  paramsSchema: getMovieByIdInputSchema,
  examplePayload: {
    id: 123,
  },
  async callback(params: ToolParams<typeof getMovieByIdInputSchema>) {
    const movie = await client.getMovieById(params.id)
    return await {
      content: [
        {
          type: 'text',
          text: `Title: ${movie.title}\nOverview: ${movie.overview}\nRelease Date: ${movie.release_date}`,
        },
        {
          type: 'resource',
          resource: {
            uri: `tmdb://movie/${params.id}`,
            mimeType: 'application/json',
            metadata: {
              title: movie.title,
              overview: movie.overview,
              release_date: movie.release_date,
            },
            text: JSON.stringify(movie),
          },
        },
      ],
    }
  },
}

const getMoviesByIdsInputSchema = { ids: zod('number[]') }

export const getMoviesByIds: TMDBTool<typeof getMoviesByIdsInputSchema> = {
  name: 'get_movies_by_ids',
  description: 'Get multiple movies by their IDs. Useful for getting information about a list of movies by their IDs',
  paramsSchema: getMoviesByIdsInputSchema,
  examplePayload: {
    ids: [123, 456],
  },
  async callback(params: ToolParams<typeof getMoviesByIdsInputSchema>) {
    const movies = await client.getMoviesByIds(params.ids)
    return await {
      content: [
        {
          type: 'text',
          description: 'Number of movies found',
          text: `Found ${movies.length} movies`,
        },
        {
          type: 'text',
          description: 'Movie IDs',
          text: movies.map((movie) => movie.id).join(', ') ?? 'No movies found',
        },
        {
          type: 'text',
          description: 'Movie titles',
          text: movies.map((movie) => movie.title).join('\n') ?? 'No movies found',
        },
        {
          type: 'resource',
          resource: {
            uri: `tmdb://movie/list_by_ids/${params.ids.join(',')}`,
            mimeType: 'application/json',
            text: JSON.stringify(movies),
          },
        },
      ],
    }
  },
}

const searchMoviesInputSchema = { query: zod('string') }

export const searchMovies: TMDBTool<typeof searchMoviesInputSchema> = {
  name: 'search_movies',
  description: 'Search for movies by common search terms. Useful for finding movies by title, summary, actor, or genre',
  paramsSchema: searchMoviesInputSchema,
  examplePayload: {
    query: 'The Matrix',
  },
  async callback(params: ToolParams<typeof searchMoviesInputSchema>) {
    const movies = await client.searchMovies(params.query)
    return await {
      content: [
        {
          type: 'text',
          description: 'Number of movies found',
          text: `Found ${movies.results?.length} movies`,
        },
        {
          type: 'text',
          description: 'Movie IDs',
          text: movies.results?.map((movie) => movie.id).join(', ') ?? 'No movies found',
        },
        {
          type: 'text',
          description: 'Movie titles',
          text: movies.results?.map((movie) => movie.title).join('\n') ?? 'No movies found',
        },
        {
          type: 'resource',
          resource: {
            uri: `tmdb://movie/search/${params.query}`,
            mimeType: 'application/json',
            text: JSON.stringify(movies),
          },
        },
      ],
    }
  },
}
