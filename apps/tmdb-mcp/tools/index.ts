import { getMovieById, getMoviesByIds, searchMovies } from './movie.ts'

export const tools = new Map<string, TMDBTool>([
  [getMovieById.name, getMovieById],
  [getMoviesByIds.name, getMoviesByIds],
  [searchMovies.name, searchMovies],
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
