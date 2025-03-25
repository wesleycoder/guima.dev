import type { RequestHandlerExtra, Variables } from "@modelcontextprotocol/sdk"

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
  async callback(url: URL, params: Variables) {
    return await {
      contents: [{
        uri: `tmdb://movie/${params.id}`,
        mimeType: "application/json",
        text: JSON.stringify(
          {
            id: 1,
            url,
            title: `Sample Movie ${params.id}`,
            overview: `This is a sample movie for testing ${params.id}`,
            release_date: "2023-01-01",
          },
          null,
          2,
        ),
      }],
    }
  },
} satisfies TMDBResource
