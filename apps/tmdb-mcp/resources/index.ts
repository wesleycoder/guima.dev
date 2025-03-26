import movie from './movie.ts'

export const resources = new Map<string, TMDBResource>([
  [movie.name, movie],
])
