# CLAUDE.md - Development Guide

## Commands
- **Run**: `deno run -E` or `dr` (with aliases)
- **Dev**: `deno task dev` (app-specific, e.g., `deno run -REN --watch main.ts`)
- **Test**: `deno test` (all tests)
- **Test single file**: `deno test path/to/test_file.ts`
- **Format**: `deno fmt`

## Code Style
- **Line width**: 120 characters
- **No semicolons**
- **Imports**: Use JSR (`jsr:@package/name@1`) or npm (`npm:@package/name@1`) in `deno.json` and `@package/name` on imports
- **Path aliases**: `#/` for current directory
- **Types**: Use `@pkgs/types` in `deno.json`, use Zod for validation
- **Naming**: camelCase for functions/variables, PascalCase for classes/interfaces
- **Error handling**: Use try/catch with console.error for logging

## Project Structure
- Monorepo with workspaces: `apps/*`, `pkgs/*`
- Test files named with `_test.ts` suffix
- Tests follow pattern: `Deno.test(function testName() {...})`
- Each package has its own deno.json with specific dependencies

## Helpful Aliases
- `d`: deno
- `dt`: deno task
- `dr`: deno run -E
- `ds`: deno task start