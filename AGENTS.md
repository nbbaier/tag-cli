# Agent Guidelines for Tag-CLI

## Commands
- **Build**: `bun run scripts/build.ts` (outputs to `dist/tag`)
- **Test**: `bun test` (runs all tests)
- **Single Test**: `bun test tests/database.test.ts` or `bun test -t "test name"`
- **Lint/Format**: `biome check --write` (fixes) or `biome lint`/`biome format`
- **Typecheck**: `bun --bun tsc --noEmit`

## Code Style & Conventions
- **Runtime**: Bun (v1.x). Uses `bun:sqlite`, `bun:test`.
- **Imports**: Use ES modules. Path aliases `@/` are supported. Prefer named imports.
- **Formatting**: Biome defaults (2 spaces, double quotes). Run `biome check` before commit.
- **Naming**: `camelCase` for functions/variables, `PascalCase` for types/classes, `kebab-case` for files.
- **Types**: Strict TypeScript. Use `type` imports for types. Zod for validation.
- **Database**:
  - App: Drizzle ORM via `src/db/db.ts` (`createDrizzleDbHelpers`).
  - Tests: Currently use raw `bun:sqlite` via `src/db/index.ts` (`createDbHelpers`).
- **Error Handling**: Throw `TRPCError` for CLI errors. Use `try/catch` for DB constraints.
- **Path Handling**: Use `src/util/path.ts` (`canonical()`) for all path resolution.
