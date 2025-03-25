import { loadEnv } from "@pkgs/env"
import { z } from "zod"

const envSchema = z.object({
  TMDB_API_BASE_URL: z.string(),
  TMDB_API_KEY: z.string(),
})

export const env = await loadEnv(envSchema)
