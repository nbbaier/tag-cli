# Coding standards

## Adding a command
- A `dir` subcommand is a default-exported procedure in
  `src/router/dirs/procedures/<name>.ts`, registered in `src/router/dirs/index.ts`.
  A tag command is a procedure on `drizzleTagsRouter` in `src/router/tags/index.ts`.
- Every procedure carries `.meta({ description, examples })`; that is its help text.

## Database
Read and write through `ctx.helpers`. Queries the helpers lack use the Drizzle
query builder on `ctx.db`, with `sql` only for fragments, as in the `search`
procedure. New database tests target the Drizzle helpers.

## Errors
- User-facing failures throw `TRPCError` with a `code`.
- In a `catch`, rethrow a `TRPCError` as-is and wrap anything else in an
  `INTERNAL_SERVER_ERROR`, as `retag` and tag `rename` and `remove` do.
- `canonical()` throws a plain `Error` for a missing path or non-directory.
  Call it inside the procedure's `try` so it reaches that handler.

## Style
- Files are `kebab-case.ts`. Functions and variables are `camelCase`; types are `PascalCase`.
- Named imports; `import type` for type-only imports.
- Import across directories with the `@/` alias for `src/`; siblings use `./`.
- Biome formats; `bun run check:fix` before committing.
