import client, { type Person, type PersonSearch } from '#/client.ts'

export const getPersonById = async (personId: number) => {
  const res = await client.GET('/3/person/{person_id}', {
    params: { path: { person_id: personId } },
  })

  if (!res.data) throw new Error(`Person with id "${personId}" not found`)

  return res.data satisfies Person
}

export const getPersonsByIds = async (ids: number[]) => {
  return await Promise.all(ids.map((id) => getPersonById(id)))
}

export const searchPersons = async (query: string) => {
  const res = await client.GET('/3/search/person', {
    params: { query: { query } },
  })

  if (!res.data) throw new Error('No person found')

  return res.data satisfies PersonSearch
}

export default {
  getPersonById,
  getPersonsByIds,
  searchPersons,
}
