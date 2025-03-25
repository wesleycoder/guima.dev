import type { RequestHandlerExtra, Variables } from "@modelcontextprotocol/sdk"
import client from "@pkgs/tmdb-api"

export default {
  name: "movie",
  uri: "tmdb://movie/{id}",
  description: "A movie",
  mimeType: "application/json",
  list: async (params: RequestHandlerExtra) => {
    return await ({
      resources: [{
        name: "movie",
        uri: `tmdb://movie/${params.id}`,
        description: `A movie with id ${params.id}`,
        mimeType: "application/json",
      }],
      _meta: {},
      nextCursor: undefined,
    })
  },
  complete: {
    id: async (value: string) => {
      return await new Set([value, "1", "2", "3"]).values().toArray()
    },
  },
  async callback(uri: URL, params: Variables) {
    const movie = await client.getMovieById(params.id)
    return await {
      contents: [{
        uri,
        mimeType: "application/json",
        text: JSON.stringify(movie),
      }],
    }
  },
} satisfies TMDBResource
