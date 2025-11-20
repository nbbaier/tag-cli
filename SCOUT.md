# Scout Report: Tag-CLI

**Last Updated:** November 19, 2025 - 12:00 PM

## Project Overview
Tag-CLI is a TypeScript CLI tool for organizing development projects by tagging directories. It uses tRPC-CLI to generate the CLI interface from tRPC procedures and runs on Bun with SQLite storage via Drizzle ORM.

## Architecture Overview

### Core Flow
```
CLI Command → trpc-cli → tRPC Router → Database Layer → SQLite
```

### Key Components
- **CLI Entry**: `src/cli.ts` - Main CLI using trpc-cli framework
- **Router Hub**: `src/router/index.ts` - tRPC router with context, exports `rootRouter` and `createContext`
- **Sub-routers**: 
  - `src/router/tags/index.ts` - Tag management (fully migrated to Drizzle)
  - `src/router/dirs/index.ts` - Directory management (uses Drizzle context ✓)
- **Database**: `src/db/db.ts` - Drizzle ORM with typed helpers
- **Schema**: `src/db/schema.ts` - Drizzle table definitions with relations
- **Types**: `src/types/models.ts` - Core data interfaces

### Database Schema
```sql
tags: id, name(unique), description, row_created_at, row_updated_at
directories: id, path(unique), row_created_at, row_updated_at  
directory_tags: dir_id, tag_id, row_created_at, row_updated_at (junction table)
```

## Current Status: ✅ Ready for Development

The codebase has been successfully migrated to Drizzle ORM. Both tags and dirs routers use the unified tRPC context with Drizzle helpers.

## Development Commands
- `bun run dev` - Run CLI in development mode
- `bun test` - Run all tests
- `bun run typecheck` - TypeScript checking
- `bun run build` - Build for distribution (`dist/tag`)
- `biome check --write` - Fix formatting/linting

## Quick Start for Development

### 1. Test Basic Functionality (5 mins)
```bash
# Create some test tags
tag tags create --name frontend --description "Frontend projects"
tag tags create --name backend --description "Backend projects"

# Add current directory with tags
tag dir add --path . --tags frontend

# Search and list
tag dir search --tags frontend
tag tags list
```

### 2. Common Development Tasks
- **Add new CLI command**: Create procedure in `src/router/dirs/procedures/` or `src/router/tags/`, then add to router
- **Modify database**: Update schema in `src/db/schema.ts`, then update helpers in `src/db/db.ts`
- **Add tests**: Write tests in `tests/` using the existing test patterns

### 3. Code Patterns
- **Error handling**: Use `TRPCError` for CLI errors, wrap DB operations in try/catch
- **Path handling**: Always use `canonical()` from `src/utils/path.ts` for path resolution
- **Database queries**: Use the typed helpers from `createDrizzleDbHelpers()`
- **Input validation**: Use Zod schemas with `.meta()` for CLI help text

## Router Structure
```
src/router/
├── index.ts          # Root router, context, tRPC instance
├── dirs/             # Directory management
│   ├── index.ts      # Dirs router
│   └── procedures/     # Individual commands (add, list, search, retag, remove)
└── tags/             # Tag management
    └── index.ts      # Tags router with CRUD operations
```

## Key Files to Know
- **Entry points**: `src/cli.ts` (CLI), `src/index.ts` (router export)
- **Database layer**: `src/db/db.ts` (Drizzle helpers), `src/db/schema.ts` (tables)
- **Utilities**: `src/utils/path.ts` (canonical paths), `src/utils/format.ts` (output formatting)
- **Tests**: `tests/database.test.ts` (example patterns)

## Migration Complete ✓
- Tags router: Fully using Drizzle ORM
- Dirs router: Using Drizzle context and helpers
- Database helpers: Comprehensive typed wrappers in `src/db/db.ts`
- Type safety: Full TypeScript coverage with generated types