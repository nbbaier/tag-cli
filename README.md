# Tag CLI

A TypeScript CLI tool for organizing development projects by tagging directories. Built with [tRPC-CLI](https://github.com/mmkal/trpc-cli) and Bun.

## Features

- 🏷️ Create and manage tags for organizing projects
- 📁 Tag directories with multiple labels
- 🔍 Search and filter projects by tags
- 💾 SQLite database storage in `$XDG_STATE_HOME/tag/`
- ⚡ Fast operations with Bun runtime
- 🎯 Type-safe CLI with automatic help generation

## Installation

Requires [Bun](https://bun.sh/) runtime.

```bash
# Install dependencies
bun install

# Build the CLI
bun run build

# Test it works
bun dist/cli.js --help
```

## Usage

### Tag Management

```bash
# Create tags
tag tags create --name frontend --description "Frontend projects"
tag tags create --name backend --description "Backend projects"
tag tags create --name react
tag tags create --name nodejs

# List all tags
tag tags list

# Rename a tag
tag tags rename --name react --newName reactjs

# Remove a tag
tag tags remove --name unused-tag
```

### Directory Management

```bash
# Add current directory with tags
tag dir add --path . --tags frontend,react

# Add a specific directory
tag dir add --path /path/to/project --tags backend,nodejs

# List all tracked directories
tag dir list

# Search directories by tags
tag dir search --tags frontend
tag dir search --tags backend,nodejs        # Must have ALL tags (AND)
tag dir search --tags backend,nodejs --any  # Must have ANY tag (OR)

# Add/remove tags from existing directory
tag dir retag --path . --add new-tag --remove old-tag

# Remove directory from tracking
tag dir remove --path /path/to/project
```

## Project Structure

```
src/
├── cli.ts           # CLI entry point
├── index.ts         # tRPC router export
├── router/
│   ├── index.ts     # Root router and context
│   ├── tags.ts      # Tag management commands
│   └── dirs.ts      # Directory management commands
├── db/
│   ├── index.ts     # Database connection and helpers
│   └── schema.sql   # SQLite schema (embedded in build)
├── util/
│   ├── path.ts      # Path resolution utilities
│   └── output.ts    # Pretty console output
└── types/
    └── models.ts    # TypeScript interfaces
```

## Database Schema

The CLI uses SQLite with three main tables:

- **tags**: Tag definitions with optional descriptions
- **directories**: Tracked directory paths (canonical absolute paths)
- **directory_tags**: Many-to-many junction table

Data is stored in `$XDG_STATE_HOME/tag/data.db` (typically `~/.local/state/tag/data.db`).

## Development

```bash
# Run in development mode
bun run dev

# Type checking
bun run typecheck

# Build for distribution
bun run build

# Run tests
bun test
```

## Examples

```bash
# Set up a new project
mkdir my-awesome-app
cd my-awesome-app
tag dir add --path . --tags frontend,react,typescript

# Find all React projects
tag dir search --tags react

# Find projects that are either frontend OR backend
tag dir search --tags frontend,backend --any

# Retag a project
tag dir retag --path . --add production --remove development
```

## Commands Reference

### Tags Commands
- `tag tags create --name <name> [--description]` - Create a new tag
- `tag tags list [--query]` - List all tags (optionally filtered)
- `tag tags rename --name <name> --newName <newName>` - Rename an existing tag
- `tag tags remove --name <name>` - Remove a tag

### Directory Commands
- `tag dir add --path <path> [--tags]` - Add directory with optional tags
- `tag dir list [--query]` - List all tracked directories
- `tag dir search --tags <tags> [--any]` - Search directories by tags
- `tag dir retag --path <path> [--add] [--remove]` - Modify directory tags
- `tag dir remove --path <path>` - Remove directory from tracking

## License

MIT
