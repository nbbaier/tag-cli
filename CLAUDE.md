# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tag-CLI is a TypeScript CLI tool for organizing development projects by tagging directories. It uses tRPC-CLI to generate the CLI interface from tRPC procedures, with SQLite for data persistence.

**Key Technologies:**
- Runtime: Bun (v1.x)
- CLI Framework: tRPC-CLI (auto-generates CLI from tRPC router)
- Database: SQLite via `bun:sqlite` and Drizzle ORM
- Testing: `bun:test`
- Linting/Formatting: Biome

## Development Commands

### Building & Running
```bash
bun run build           # Build CLI executable to dist/tag
bun run dev            # Run CLI in development mode
bun dist/tag --help    # Test built CLI
```

### Testing & Quality
```bash
bun test                        # Run all tests
bun test tests/database.test.ts # Run specific test file
bun test -t "test name"         # Run specific test by name
bun run typecheck               # Type check without emit
```

### Linting & Formatting
```bash
biome check --write    # Format and fix all issues (run before commits)
biome lint             # Lint only
biome format --write   # Format only
```

## Architecture

### tRPC-CLI Pattern
The CLI is automatically generated from tRPC routers. Each procedure becomes a command:
- **Router structure** (`src/router/index.ts`): Defines root router combining sub-routers
- **Procedures**: Define inputs (become CLI flags/args), outputs, and metadata (description, examples)
- **Context**: Provides database and helpers to all procedures
- **CLI generation**: `createCli()` in `src/cli.ts` generates the full CLI from the router

### Database Layer Migration (In Progress)
The codebase is migrating from raw SQLite to Drizzle ORM:

**Legacy (being phased out):**
- `src/db/index.ts`: Raw `bun:sqlite` with prepared statements
- Used by: Current tests
- Pattern: `createDbHelpers(db)` returns typed wrapper functions

**New (preferred):**
- `src/db/db.ts`: Drizzle ORM setup and helpers
- `src/db/schema.ts`: Drizzle schema definitions
- Used by: Router procedures in `src/router/tags/` and `src/router/dirs/`
- Pattern: `createDrizzleDbHelpers(db)` returns async typed functions
- Context type in `src/router/index.ts` expects Drizzle context

**Database location:** `$XDG_STATE_HOME/tag/data.db` (typically `~/.local/state/tag/data.db`)

### Schema
Three core tables with many-to-many relationship:
- `tags`: Tag definitions (name, description)
- `directories`: Tracked directory paths (canonical absolute paths)
- `directory_tags`: Junction table for tag-directory associations

### Path Handling
**Critical:** Always use `src/util/path.ts` functions for path operations:
- `canonical(path)`: Resolves to canonical absolute path, validates directory exists
- `validateDirectory(path)`: Validates path exists and is directory
- `getStatePath(name)`: Returns path in XDG state directory

All directory paths MUST be stored as canonical absolute paths.

## Code Conventions

### TypeScript Configuration
- Path aliases: `@/*` maps to `./src/*`
- Strict mode enabled with additional checks (`noUncheckedIndexedAccess`, `noImplicitOverride`)
- Module resolution: bundler mode
- JSX: react-jsx (for Ink components)

### Naming Conventions
- Files: `kebab-case.ts`
- Functions/variables: `camelCase`
- Types/classes: `PascalCase`
- Use `type` imports for type-only imports

### Imports
- Use ES modules
- Prefer named imports
- Use `@/` path alias for imports from `src/`

### Error Handling
- Throw `TRPCError` for CLI user-facing errors
- Use `try/catch` for database constraint violations
- Path validation errors from `canonical()` are thrown as regular `Error`

### Formatting
- Biome defaults: 2 spaces, double quotes
- Always run `biome check --write` before commits

## Project Structure

```
src/
├── cli.ts              # CLI entry point (createCli setup)
├── index.ts            # Export router for trpc-cli
├── router/
│   ├── index.ts        # Root router, context definition
│   ├── tags/           # Tag management router
│   │   └── index.ts    # Tag CRUD procedures
│   └── dirs/           # Directory management router
│       ├── index.ts    # Router composition
│       └── procedures/ # Individual command procedures
├── db/
│   ├── index.ts        # Legacy raw SQLite helpers (being phased out)
│   ├── db.ts           # Drizzle ORM setup and helpers (new)
│   └── schema.ts       # Drizzle schema definitions
├── util/
│   └── path.ts         # Path resolution utilities (MUST USE)
├── utils/              # General utilities
│   ├── format.ts       # Console output formatting
│   ├── path.ts         # Alternative path utils
│   └── time.ts         # Time utilities
└── types/
    └── models.ts       # TypeScript type definitions

scripts/
├── build.ts            # Build script (outputs to dist/tag)
└── install.ts          # Installation script

tests/
├── database.test.ts    # Database helper tests (uses legacy layer)
└── path.test.ts        # Path utility tests
```

## Key Implementation Notes

1. **Adding new commands**: Create tRPC procedure in appropriate router file. The CLI command is auto-generated from the procedure name, input schema, and metadata.

2. **Database operations**: Use Drizzle helpers from context (`ctx.helpers`) in procedures. Avoid raw SQL queries.

3. **Path handling**: Never use raw `path.resolve()` or assume relative paths. Always use `canonical()` from `src/util/path.ts` to ensure consistent absolute paths.

4. **Testing database code**: Tests currently use legacy raw SQLite layer. New tests should ideally use Drizzle helpers with test database.

5. **Router context**: All procedures receive context with `db` (Drizzle instance) and `helpers` (typed database helpers). Access via `ctx.db` and `ctx.helpers`.
