import { env } from '#/env.ts'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schemas/index.ts'

export const db = drizzle(env.DATABASE_URL, { schema, casing: 'camelCase' })
