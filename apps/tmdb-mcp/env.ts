import { loadEnv } from "@pkgs/env"
import { normalizeEnvironment } from "@pkgs/ts-utils"
import { z } from "zod"

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  ENV: z.preprocess(normalizeEnvironment, z.enum(["dev", "prod"]).default("prod")),
})

export const env = await loadEnv(envSchema)
