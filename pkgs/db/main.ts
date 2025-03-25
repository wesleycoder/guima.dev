import { env } from "#/env.ts"
import * as schema from "#/schemas/index.ts"
import { drizzle } from "drizzle-orm/libsql"

export const db = drizzle(env.DATABASE_URL, { schema, casing: "camelCase" })
