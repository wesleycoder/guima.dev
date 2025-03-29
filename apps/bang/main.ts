/**
 * Deno needs an export field in deno.json in order to handle packages in a monorepo.
 */
console.warn("This is a dummy file and should not be imported.")
throw new Error("This package is not a module")
