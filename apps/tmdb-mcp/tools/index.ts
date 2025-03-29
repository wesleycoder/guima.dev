import { getMovieById, getMoviesByIds, searchMovies } from './movie.ts'
import { getTvSeriesById, getTvSeriesByIds, searchTv } from './tv.ts'
export const tools = new Map<string, TMDBTool>([
  [getMovieById.name, getMovieById],
  [getMoviesByIds.name, getMoviesByIds],
  [searchMovies.name, searchMovies],
  [getTvSeriesById.name, getTvSeriesById],
  [getTvSeriesByIds.name, getTvSeriesByIds],
  [searchTv.name, searchTv],
])

export const methods = Array.from(tools.entries()).map(([name, tool], index) => ({
  name,
  description: tool.description,
  examplePayload: {
    id: index + 1,
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name,
      arguments: tool.examplePayload,
    },
  },
}))
