import { load, type LoadOptions } from "@std/dotenv"
import { z } from "zod"

const libDir = import.meta.dirname
const projectDir = `${import.meta.dirname}/../..`
const localDir = Deno.cwd()

const defaultSchema = z.object({ ENV: z.enum(["dev", "prod"]).default("dev") })

export async function loadEnv<T extends z.SomeZodObject>(
  schema: T = defaultSchema as unknown as T,
  options: LoadOptions = { export: true },
) {
  // Env for this package
  const libEnv = await load({
    ...options,
    envPath: `${libDir}/.env`,
  })

  // Env for the project
  const projectEnv = await load({
    ...options,
    envPath: `${projectDir}/.env`,
  })

  // Env for the local project
  const localEnv = await load({
    envPath: `${localDir}/.env`,
    ...options, // options should override the default envPath
  })

  const env = {
    ...libEnv,
    ...projectEnv,
    ...localEnv,
    ...Deno.env.toObject(),
  }

  const parsedEnv = schema.parse(env)

  return {
    ...parsedEnv,
    get isDev() {
      return this.ENV === "dev"
    },
    get isProd() {
      return this.ENV === "prod"
    },
  } as Pretty<
    z.infer<T> & {
      get isDev(): boolean
      get isProd(): boolean
    }
  >
}
