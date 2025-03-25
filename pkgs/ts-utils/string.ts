export const truthyStrings = new Set([
  "1",
  "y",
  "yes",
  "on",
  "true",
  "enable",
  "enabled",
])

export const stringIsTruthy = (value: unknown) => {
  if (typeof value === "boolean") return value
  if (typeof value === "number") return !!value
  if (typeof value === "string") {
    const normalized = value.toString().toLowerCase().trim()

    return truthyStrings.has(normalized)
  }

  return false
}

const envMap = {
  development: "dev",
  production: "prod",
  testing: "test",
  staging: "stag",
  local: "local",
} as const

type LongEnv = keyof typeof envMap
const isLongEnv = (value: string): value is LongEnv => Object.keys(envMap).includes(value as LongEnv)

export function normalizeEnvironment<T extends LongEnv>(value: T): typeof envMap[T]
export function normalizeEnvironment<T extends string>(value: T): T
export function normalizeEnvironment(value: string) {
  if (isLongEnv(value)) return envMap[value]
  return value
}
