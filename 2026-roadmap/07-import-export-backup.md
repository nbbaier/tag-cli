# Import/Export & Backup System

**Category:** New Feature
**Quarter:** Q3
**T-shirt Size:** S

## Why This Matters

Data without portability is data imprisoned. Users need to back up their tag database, migrate between machines, share configurations with teammates, and recover from disasters. Currently, Tag-CLI stores everything in a SQLite file with no official way to export, import, or backup.

This initiative makes Tag-CLI data a first-class citizen: exportable, importable, versionable, and shareable. It's the foundation for team collaboration and multi-machine workflows.

## Current State

**No Export Capability**
- Data trapped in SQLite binary format
- No JSON/YAML/CSV export
- Users must use raw SQLite tools to extract data
- No schema documentation for manual extraction

**No Import Capability**
- Can't bulk-load tags or directories
- No migration from other tools
- Setting up new machine requires re-tagging everything

**No Backup/Restore**
- SQLite file at `~/.local/state/tag-cli/tag.db`
- Users must manually copy file
- No versioning or incremental backups
- No cloud backup integration

**No Data Validation**
- Importing raw SQL could corrupt database
- No schema version tracking for migrations
- No integrity checks

## Proposed Future State

**Rich Export Formats**:
```bash
# Export everything as JSON
tag export --format json > my-tags.json

# Export only specific tags
tag export --tags frontend,backend --format yaml

# Export for sharing (relative paths, portable)
tag export --portable --format json > shareable.json
```

**Flexible Import**:
```bash
# Import from export file
tag import my-tags.json

# Merge with existing (default)
tag import --merge colleague-tags.json

# Replace everything
tag import --replace backup.json

# Preview what would change
tag import --preview new-data.yaml
```

**Backup System**:
```bash
# Create timestamped backup
tag backup create
# Backup saved: ~/.local/state/tag-cli/backups/2026-01-15T10-30-00.db

# List backups
tag backup list

# Restore from backup
tag backup restore 2026-01-15T10-30-00

# Auto-backup before destructive operations
tag dir remove --path /important  # Auto-backs up first
```

**Archive Stale Projects**:
```bash
# Archive directories that no longer exist
tag archive --stale
# Found 12 directories that no longer exist on disk
# Archive them? [y/n]

# List archived
tag dir list --archived
```

## Key Deliverables

- [ ] Implement `tag export` with JSON, YAML, CSV formats
- [ ] Add `--format` flag for export format selection
- [ ] Add `--portable` flag to export relative paths
- [ ] Add `--tags` filter to export subset
- [ ] Implement `tag import` with format auto-detection
- [ ] Add `--merge` (default), `--replace`, `--preview` modes
- [ ] Add conflict resolution (skip, overwrite, rename)
- [ ] Implement `tag backup create/list/restore` commands
- [ ] Add auto-backup before destructive operations
- [ ] Add backup retention policy (keep N backups)
- [ ] Implement `tag archive` for stale directory management
- [ ] Add `--archived` flag to list/search commands
- [ ] Add schema version to exports for forward compatibility
- [ ] Validate import data before applying
- [ ] Add `tag validate` to check database integrity

## Prerequisites

- **01-technical-debt-cleanup**: Stable schema before export format
- **02-test-infrastructure-cicd**: Tests for import/export roundtrip

## Risks & Open Questions

- **Path portability**: Absolute paths don't transfer between machines. Need relative path mode or path prefix replacement.
- **Schema evolution**: Export format must handle future schema changes. Version the format.
- **Large exports**: JSON/YAML for 10,000 directories might be unwieldy. Consider streaming or NDJSON.
- **Import conflicts**: How to handle duplicate paths or tag names? Need clear conflict resolution UX.
- **Archive vs delete**: Should archived directories be searchable? Separate table or flag?

## Notes

**Export Format (JSON)**:
```json
{
  "version": "1.0",
  "exported_at": "2026-01-15T10:30:00Z",
  "tags": [
    {"name": "frontend", "description": "Frontend projects"},
    {"name": "react", "description": null}
  ],
  "directories": [
    {
      "path": "/home/user/projects/app",
      "tags": ["frontend", "react"],
      "created_at": "2025-12-01T08:00:00Z"
    }
  ]
}
```

**Portable Export**:
```json
{
  "version": "1.0",
  "base_path": "$HOME/projects",
  "directories": [
    {"path": "app", "tags": ["frontend"]}  // Relative to base_path
  ]
}
```

**Import Resolution Modes**:
```
--merge (default): Add new, skip existing
--replace: Drop all existing, import fresh
--update: Add new, update existing with import values
--preview: Show diff without applying
```

**Backup Storage**:
```
~/.local/state/tag-cli/
├── tag.db              # Active database
└── backups/
    ├── 2026-01-15T10-30-00.db
    ├── 2026-01-14T15-00-00.db
    └── 2026-01-13T09-45-00.db
```

**Auto-Backup Trigger Points**:
- Before `tag import --replace`
- Before `tag dir remove` (configurable)
- Before schema migrations
- Manual `tag backup create`
