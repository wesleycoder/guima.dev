export type Success<T> = {
  data: T
  error: null
}

export type Failure<E extends Error> = {
  data: null
  error: E
}

export type Result<T, E extends Error = Error> = Success<T> | Failure<E>

export async function tryCatch<T, E extends Error = Error>(p: Promise<T>): Promise<Result<T, E>> {
  try {
    const data = await p
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as E }
  }
}
