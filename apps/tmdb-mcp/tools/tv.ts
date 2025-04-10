import client from '@pkgs/tmdb-api'
import { zod } from '@pkgs/ts-utils/typebox'

const getTvSeriesByIdInputSchema = { id: zod('number') }

export const getTvSeriesById: TMDBTool<typeof getTvSeriesByIdInputSchema> = {
  name: 'get_tv_series_by_id',
  description: 'Get a tv series by its ID. Useful for getting information about a single tv series by its ID',
  paramsSchema: getTvSeriesByIdInputSchema,
  examplePayload: {
    id: 123,
  },
  async callback(params: ToolParams<typeof getTvSeriesByIdInputSchema>) {
    const tv = await client.getTvSeriesById(params.id)
    return await {
      content: [
        {
          type: 'text',
          text: `Title: ${tv.name}\nOverview: ${tv.overview}\nRelease Date: ${tv.first_air_date}`,
        },
        {
          type: 'resource',
          resource: {
            uri: `tmdb://movie/${params.id}`,
            mimeType: 'application/json',
            metadata: {
              title: tv.name,
              overview: tv.overview,
              release_date: tv.first_air_date,
            },
            text: JSON.stringify(tv),
          },
        },
      ],
    }
  },
}

const getTvSeriesByIdsInputSchema = { ids: zod('number[]') }

export const getTvSeriesByIds: TMDBTool<typeof getTvSeriesByIdsInputSchema> = {
  name: 'get_tv_series_by_ids',
  description:
    'Get multiple tv series by their IDs. Useful for getting information about a list of tv series by their IDs',
  paramsSchema: getTvSeriesByIdsInputSchema,
  examplePayload: {
    ids: [123, 456],
  },
  async callback(params: ToolParams<typeof getTvSeriesByIdsInputSchema>) {
    const tvSeries = await client.getTvSeriesByIds(params.ids)
    return await {
      content: [
        {
          type: 'text',
          description: 'Number of tv series found',
          text: `Found ${tvSeries.length} tv series`,
        },
        {
          type: 'text',
          description: 'Tv series IDs',
          text: tvSeries.map((tv) => tv.id).join(', ') ?? 'No tv series found',
        },
        {
          type: 'text',
          description: 'Tv series titles',
          text: tvSeries.map((tv) => tv.name).join('\n') ?? 'No tv series found',
        },
        {
          type: 'resource',
          resource: {
            uri: `tmdb://tv/list_by_ids/${params.ids.join(',')}`,
            mimeType: 'application/json',
            text: JSON.stringify(tvSeries),
          },
        },
      ],
    }
  },
}

const searchTvInputSchema = { query: zod('string') }

export const searchTv: TMDBTool<typeof searchTvInputSchema> = {
  name: 'search_tv',
  description:
    'Search for tv series by common search terms. Useful for finding tv series by title, summary, actor, or genre',
  paramsSchema: searchTvInputSchema,
  examplePayload: {
    query: 'The Matrix',
  },
  async callback(params: ToolParams<typeof searchTvInputSchema>) {
    const tvSeries = await client.searchTv(params.query)
    return await {
      content: [
        {
          type: 'text',
          description: 'Number of tv series found',
          text: `Found ${tvSeries.results?.length} tv series`,
        },
        {
          type: 'text',
          description: 'Tv series IDs',
          text: tvSeries.results?.map((tv) => tv.id).join(', ') ?? 'No tv series found',
        },
        {
          type: 'text',
          description: 'Tv series titles',
          text: tvSeries.results?.map((tv) => tv.name).join('\n') ?? 'No tv series found',
        },
        {
          type: 'resource',
          resource: {
            uri: `tmdb://tv/search/${params.query}`,
            mimeType: 'application/json',
            text: JSON.stringify(tvSeries),
          },
        },
      ],
    }
  },
}
