import { loadEnv } from "@pkgs/env"
import { z } from "zod"

const envSchema = z.object({
  DATABASE_URL: z.string(),
})

export const env = await loadEnv(envSchema)
