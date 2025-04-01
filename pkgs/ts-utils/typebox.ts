import type { TSchema } from '@sinclair/typebox'
import { type TypeCheck, TypeCompiler } from '@sinclair/typebox/compiler'
import {
  DefaultErrorFunction,
  type ErrorFunctionParameter,
  SetErrorFunction,
  type ValueErrorType,
} from '@sinclair/typebox/errors'
import { Value } from '@sinclair/typebox/value'
import { type Static, TypeBox, ZodFromTypeBox } from '@sinclair/typemap'
import type { Table as DrizzleTable } from 'drizzle-orm'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox'

/**
 * Create a Zod schema from a TypeMap Syntax.
 * @see https://github.com/sinclairzx81/typemap#typebox
 * @param t - The TypeMap Syntax.
 * @returns a Zod schema.
 */
export const zod = <T extends object | string>(t: T) => ZodFromTypeBox(TypeBox(t))

type WithMessageMap = { schema: { errors: Record<ValueErrorType, string> } }
const hasErrorMessages = (e: ErrorFunctionParameter): e is ErrorFunctionParameter & WithMessageMap =>
  e.schema.errors &&
  typeof e.schema.errors === 'object' &&
  e.errorType in e.schema.errors

// Better error messages for TypeBox.
SetErrorFunction((e) => {
  if (hasErrorMessages(e)) {
    return e.schema.errors[e.errorType]
  }
  return DefaultErrorFunction(e)
})

/**
 * Compile a TypeBox schema, for better performance.
 * @returns a TypeCheck validator object.
 */
export const compileSchema = <T extends TSchema>(t: T) => TypeCompiler.Compile(t)

/**
 * Check if a value matches a TypeBox schema.
 * @returns `[Static<T>, null]` if the value is valid.
 * @returns `[null, string[]]` if the value is invalid.
 */
export const checkSchema = <T extends TSchema>(t: T, c: TypeCheck<T>, value: unknown) => {
  if (!c.Check(value)) return [null, getErrorMessages(t, value)] as const

  return [Value.Parse(t, value), null] as const
}

/**
 * Validate a value against a TypeBox schema.
 * @returns the value if it is valid.
 * @throws an error if the value is invalid.
 */
export const validateSchema = <T extends TSchema>(t: T, c: TypeCheck<T>, value: unknown) => {
  if (!c.Check(value)) {
    throw new Error(
      getErrorMessages(t, value)
        .map(({ message }) => message).join('\n'),
    )
  }

  return Value.Parse(t, value)
}

/**
 * Get the error messages for a value against a TypeBox schema.
 * @returns the error messages.
 */
export const getErrorMessages = (t: TSchema, value: unknown) => {
  const validator = compileSchema(t)
  return [...validator.Errors(value)]
    .map(({ type, path, message }) => ({ type, path, message }))
}

export const createSchemaUtils = <T extends DrizzleTable>(t: T) => {
  const select = createSelectSchema(t)
  const insert = createInsertSchema(t)
  const update = createUpdateSchema(t)

  // TODO: check with TypeBox team about this
  // @ts-expect-error excessively deep
  const compiledSelect = TypeCompiler.Compile(select as Static<typeof select>)
  // @ts-expect-error excessively deep
  const compiledInsert = TypeCompiler.Compile(insert as Static<typeof insert>)
  // @ts-expect-error excessively deep
  const compiledUpdate = TypeCompiler.Compile(update as Static<typeof update>)

  type SelectSchema = Static<typeof select>
  type InsertSchema = Static<typeof insert>
  type UpdateSchema = Static<typeof update>

  const utils = {
    select: {
      schema: select,
      check: (value: unknown) => checkSchema(select, compiledSelect, value),
      validate: (value: unknown) => validateSchema(select, compiledSelect, value),
    },
    insert: {
      schema: insert,
      check: (value: unknown) => checkSchema(insert, compiledInsert, value),
      validate: (value: unknown) => validateSchema(insert, compiledInsert, value),
    },
    update: {
      schema: update,
      check: (value: unknown) => checkSchema(update, compiledUpdate, value),
      validate: (value: unknown) => validateSchema(update, compiledUpdate, value),
    },
  }

  return utils as typeof utils & {
    // @ts-expect-error excessively deep
    Select: SelectSchema
    // @ts-expect-error excessively deep
    Insert: InsertSchema
    // @ts-expect-error excessively deep
    Update: UpdateSchema
  }
}
