# Agent Instructions for tag-cli

## Project Overview
This is a TypeScript CLI tool built with tRPC-CLI and Bun for organizing development projects by tagging directories. The CLI allows users to create tags, apply them to directories, and search/filter projects by tags.

## Technology Stack
- **Runtime**: Bun (required for `bun:sqlite`)
- **Package Manager**: Bun
- **Framework**: tRPC-CLI for CLI generation
- **Database**: SQLite (via `bun:sqlite`)
- **Validation**: Zod v4
- **Language**: TypeScript with ES modules

## Key Commands

### Development
- `bun run dev` - Run CLI in development mode
- `bun run typecheck` - Type checking with TypeScript
- `bun run build` - Build for distribution (outputs to `dist/`)
- `bun test` - Run tests (when implemented)

### Testing the CLI
- `bun dist/cli.js --help` - Test built CLI
- `bun dist/cli.js tags create --name frontend` - Example command
- `bun dist/cli.js dir add --path . --tags frontend,react` - Example directory tagging

## Project Structure

```
src/
├── cli.ts           # CLI entry point with createCli()
├── index.ts         # tRPC router export for trpc-cli
├── router/
│   ├── index.ts     # Root router and context creation
│   ├── tags.ts      # Tag management tRPC procedures
│   └── dirs.ts      # Directory management tRPC procedures
├── db/
│   ├── index.ts     # SQLite database connection & helpers
│   └── schema.sql   # Schema (embedded in code, not used at runtime)
├── util/
│   ├── path.ts      # Canonical path resolution
│   └── output.ts    # Console formatting with chalk
└── types/
    └── models.ts    # TypeScript interfaces
```

## Architecture Patterns

### tRPC-CLI Integration
- Each tRPC procedure maps to a CLI command automatically
- Input validation via Zod schemas generates CLI argument parsing
- Use `.meta()` for command descriptions and examples
- Use `z.string().meta({ positional: true })` for positional arguments

### Database Pattern
- SQLite database in `$XDG_STATE_HOME/tag/data.db`
- Typed wrapper functions for all database operations
- Foreign key constraints enabled
- Schema embedded as string to avoid bundling issues

### Error Handling
- Throw `TRPCError` with appropriate codes
- Catch and wrap unexpected errors
- User-friendly error messages

## Code Style Preferences

### Import Style
- Use `.js` extensions in imports (required for ES modules)
- Group imports: external libs, then internal modules
- Use `type` imports for TypeScript types only

### Database Operations
- Use typed wrapper functions from `createDbHelpers()`
- Handle SQLite constraint errors gracefully
- Use transactions for multi-table operations

### CLI Design
- Provide examples in `.meta()` for each command
- Use descriptive error messages
- Format output with chalk for better UX
- Return structured data for potential JSON output

## Development Workflow

1. **Adding New Commands**: Create procedures in appropriate router file
2. **Database Changes**: Update embedded schema in `src/db/index.ts`
3. **Testing**: Build with `bun run build` then test with `bun dist/cli.js`
4. **Type Checking**: Always run `bun run typecheck` before committing

## Important Notes

- **Bun Runtime Required**: This project uses `bun:sqlite` which only works with Bun
- **Path Canonicalization**: Always use `canonical()` from `src/util/path.ts` for directory paths
- **XDG Compliance**: Respects `$XDG_STATE_HOME` environment variable
- **ES Modules**: Project uses `"type": "module"` in package.json

## CLI Command Structure

The CLI follows the pattern: `tag <resource> <action> [args] [options]`

```bash
tag tags create --name <name> [--description]
tag tags list [--query]
tag tags rename --name <name> --newName <newName>
tag tags remove --name <name>

tag dir add --path <path> [--tags]
tag dir list [--query]  
tag dir search --tags <tags> [--any]
tag dir retag --path <path> [--add] [--remove]
tag dir remove --path <path>
```

## Troubleshooting

- **Build Issues**: Ensure all imports use `.js` extensions
- **Runtime Errors**: Check that Bun runtime is being used, not Node.js
- **Database Issues**: Check file permissions in `~/.local/state/tag/`
- **Schema Problems**: SQL is embedded in `src/db/index.ts`, not loaded from file
