import { assertEquals } from '@std/assert'
import { z } from 'zod'
import { loadEnv } from './main.ts'

Deno.test(async function loadEnvTest() {
  const testSchema = z.object({
    PORT: z.number().default(3000),
    ENV: z.enum(['dev', 'prod']).default('dev'),
  })

  const env = await loadEnv(testSchema)
  assertEquals(env.PORT, 3000)
  assertEquals(env.ENV, 'dev')
  assertEquals(env.isDev, true)
  assertEquals(env.isProd, false)
})
