# Scout Report: Tag-CLI

**Last Updated:** November 19, 2025

## Project Overview
Tag-CLI is a TypeScript CLI tool for organizing development projects by tagging directories. It uses tRPC-CLI to generate the CLI interface from tRPC procedures and runs on Bun with SQLite storage.

## Current Architecture

### Core Components
- **CLI Entry**: `src/cli.ts` - Main CLI using trpc-cli framework
- **Router**: `src/router/index.ts` - tRPC router with tags and dirs sub-routers
- **Database**: Dual layer - legacy raw SQLite (`src/db/index.ts`) and new Drizzle ORM (`src/db/db.ts`)
- **Schema**: `src/db/schema.ts` - Drizzle ORM table definitions
- **Types**: `src/types/models.ts` - Core data interfaces

### Key Features
- Tag management (create, list, rename, remove)
- Directory tracking with multiple tags
- Search directories by tags (AND/OR operations)
- SQLite storage in `$XDG_STATE_HOME/tag/`

## Current Status: 🔧 Migration in Progress

The codebase is transitioning from raw SQLite to Drizzle ORM. The tags router is fully migrated, but the dirs router still uses the legacy database layer.

### Critical Issues to Fix
1. **Missing exports** in `src/router/index.ts` - needs `createContext` and `rootRouter`
2. **Type imports** failing - missing `@/types` module resolution
3. **Router unification** - dirs router uses different context than tags router
4. **Component errors** in `directory-list.ts` - type mismatches

## Database Schema
```
tags: id, name(unique), description, timestamps
directories: id, path(unique), timestamps  
directory_tags: dir_id, tag_id (junction table)
```

## Development Commands
- `bun run dev` - Run CLI in development
- `bun test` - Run tests
- `bun run typecheck` - TypeScript checking (currently failing)
- `bun run build` - Build for distribution
- `biome check --write` - Fix formatting/linting

## Next Steps When Resuming

### 1. Fix Core Infrastructure (15 mins)
- [ ] Add missing exports to `src/router/index.ts` (createContext, rootRouter)
- [ ] Create `src/types/index.ts` to re-export from models.ts
- [ ] Add type declaration for `replace-homedir` module

### 2. Unify Router Architecture (30 mins)
- [ ] Update `src/router/dirs/index.ts` to use Drizzle context
- [ ] Migrate dirs procedures from raw SQLite to Drizzle helpers
- [ ] Ensure both routers use same tRPC instance

### 3. Fix Type Errors (15 mins)
- [ ] Fix `directory-list.ts` component type issues
- [ ] Run `bun run typecheck` to verify all types pass

### 4. Test & Verify (15 mins)
- [ ] Run `bun test` to ensure functionality works
- [ ] Test basic CLI commands: `tag tags list`, `tag dir add --path . --tags test`
- [ ] Build and install: `bun run build && bun run install`

## Quick Start Commands
```bash
# After fixing issues, test basic functionality:
tag tags create --name frontend --description "Frontend projects"
tag dir add --path . --tags frontend
tag dir search --tags frontend
```

## Migration Notes
- **Tags**: Fully migrated to Drizzle ✓
- **Dirs**: Still using legacy SQLite layer (needs migration)
- **Tests**: Currently use legacy layer - may need updating
- **Database**: Both layers work with same SQLite file, safe to migrate incrementally