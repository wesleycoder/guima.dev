import { getMovieById, getMoviesByIds, searchMovies } from './movie.ts'
import { getTvSeriesById, getTvSeriesByIds, searchTv } from './tv.ts'

export const tools = [
  getMovieById,
  getMoviesByIds,
  searchMovies,
  getTvSeriesById,
  getTvSeriesByIds,
  searchTv,
] as TMDBTool[]

export const methods = tools.map((tool, index) => ({
  name: tool.name,
  description: tool.description,
  examplePayload: {
    id: index + 1,
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: tool.name,
      arguments: tool.examplePayload,
    },
  },
}))
