# Scout Report: Tag-CLI

## Project Overview
Tag-CLI is a command-line tool for organizing development projects using tags. It uses `trpc-cli` to generate the CLI interface from tRPC procedures.

## Current Status: 🚧 In-Progress Refactor
The codebase is currently in a broken state, likely midway through a migration from raw SQLite queries to Drizzle ORM.

### Critical Issues
1.  **CLI Entry Point Broken**: `src/cli.ts` fails to import `createContext` and `rootRouter` from `src/router/index.ts`. The router file currently exports `drizzleRouter` instead.
2.  **Type Check Failures**: `bun run typecheck` fails with multiple errors.
    - Missing module `@/types` (needs to resolve to `src/types/models.ts`).
    - Missing types for `replace-homedir`.
    - Mismatched types in `directory-list.ts` component.
3.  **Inconsistent Router Initialization**:
    - `src/router/tags/index.ts` uses Drizzle context.
    - `src/router/dirs/index.ts` uses a generic Context.
    - These need to be unified to use the same TRPC instance and context.

## Database Layer
- **Dual State**:
    - Legacy: `src/db/index.ts` (Raw SQLite, used by current tests).
    - New: `src/db/db.ts` (Drizzle ORM, used by new router code).
- **Goal**: Complete the migration to Drizzle ORM and deprecate the raw SQLite helpers.

## Architecture
- **Runtime**: Bun
- **Database**: SQLite (via `bun:sqlite`)
- **ORM**: Drizzle ORM
- **CLI Framework**: `trpc-cli`

## Action Plan
1.  **Fix Types**: Create `src/types/index.ts` to export models, or update imports to `@/types/models`.
2.  **Unify Router**: Update `src/router/index.ts` to export `createContext` and a unified `rootRouter` that includes both tags and dirs.
3.  **Fix CLI**: Update `src/cli.ts` to use the correct exports.
4.  **Migrate "Dirs" Router**: Ensure `src/router/dirs` procedures use the Drizzle helpers/context.
5.  **Update Tests**: Migrate `tests/database.test.ts` to use Drizzle helpers or write new tests for the Drizzle layer.

## Key Commands
- `bun run dev`: Run the CLI (currently broken).
- `bun test`: Runs tests (currently passing for legacy DB layer).
- `bun run typecheck`: Checks for TypeScript errors (currently failing).
