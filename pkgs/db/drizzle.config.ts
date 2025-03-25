import { loadEnv } from "@pkgs/env"
import { defineConfig } from "drizzle-kit"

const env = await loadEnv()

export default defineConfig({
  dialect: "turso",
  schema: "./schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
})
