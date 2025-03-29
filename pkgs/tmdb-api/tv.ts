import client, { type TvSeries, type TvSeriesSearch } from '#/client.ts'

export const getTvSeriesById = async (tvId: number) => {
  const res = await client.GET('/3/tv/{series_id}', {
    params: { path: { series_id: tvId } },
  })

  if (!res.data) throw new Error(`Tv with id "${tvId}" not found`)

  return res.data satisfies TvSeries
}

export const getTvSeriesByIds = async (ids: number[]) => {
  return await Promise.all(ids.map((id) => getTvSeriesById(id)))
}

export const searchTv = async (query: string) => {
  const res = await client.GET('/3/search/tv', {
    params: { query: { query } },
  })

  if (!res.data) throw new Error('No tv found')

  return res.data satisfies TvSeriesSearch
}

export default {
  getTvSeriesById,
  getTvSeriesByIds,
  searchTv,
}
