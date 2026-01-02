# Bulk Operations & Automation

**Category:** New Feature
**Quarter:** Q2
**T-shirt Size:** M

## Why This Matters

Developers don't have one project—they have dozens. Tagging each directory individually is tedious. When onboarding to Tag-CLI or reorganizing a development machine, users need to tag 50+ projects. The current one-at-a-time approach doesn't scale.

Bulk operations and automation transform Tag-CLI from a tool you use occasionally into one that runs continuously. Auto-tagging rules mean new projects get organized without manual intervention. Pattern-based tagging means "tag all Go projects" is one command, not fifty. This is the difference between a toy and a tool.

## Current State

**Single-Item Operations Only**
- `tag dir add` operates on one path at a time
- `tag dir retag` operates on one path at a time
- No way to tag multiple directories in one command
- No glob/pattern matching for paths

**No Automation**
- Every tag application is manual
- No rules-based tagging
- No file-type detection
- No watch mode for new directories

**No Configuration Files**
- No `.tag-cli.yaml` for project defaults
- No global config for automation rules
- Each invocation is stateless

**No Discovery**
- Can't scan a parent directory for projects
- Can't detect projects by markers (package.json, Cargo.toml, etc.)
- User must know exact paths

## Proposed Future State

**Bulk Operations**:
```bash
# Tag all subdirectories of ~/projects
tag dir add ~/projects/* --tags personal

# Tag by glob pattern
tag dir add "~/work/**/frontend" --tags frontend

# Bulk retag with confirmation
tag dir retag --matching "react" --add typescript --preview
```

**Automation Rules**:
```yaml
# ~/.config/tag-cli/rules.yaml
rules:
  - match:
      files: ["package.json"]
      contains: ["react"]
    tags: [frontend, react, javascript]

  - match:
      files: ["Cargo.toml"]
    tags: [backend, rust]

  - match:
      path: "*/microservices/*"
    tags: [microservice]
```

**Watch Mode**:
```bash
# Watch ~/projects for new directories and auto-tag
tag watch ~/projects --rules ~/.config/tag-cli/rules.yaml
```

**Project Detection**:
```bash
# Scan and discover projects
tag scan ~/code --detect
# Found 47 projects:
#   23 JavaScript (package.json)
#   12 Python (setup.py, pyproject.toml)
#   8 Go (go.mod)
#   4 Rust (Cargo.toml)
# Apply recommended tags? [y/n]
```

## Key Deliverables

- [ ] Add glob pattern support to `tag dir add` path argument
- [ ] Add `--recursive` flag to discover directories under a path
- [ ] Add `tag dir add --paths file.txt` to read paths from file
- [ ] Add `--preview` / `--dry-run` flag to show what would change
- [ ] Create `tag scan` command for project discovery
- [ ] Implement project detection by file markers (package.json, Cargo.toml, etc.)
- [ ] Add `--detect` flag to auto-suggest tags based on detected project type
- [ ] Create rule configuration file format (YAML)
- [ ] Add `tag rules` subcommand to manage automation rules
- [ ] Implement `tag watch` for continuous monitoring
- [ ] Add `.tag-cli.yaml` per-directory config support
- [ ] Add `tag dir retag --matching` for bulk retag operations
- [ ] Add confirmation prompts for destructive bulk operations
- [ ] Support `--yes` flag to skip confirmations in scripts

## Prerequisites

- **01-technical-debt-cleanup**: Clean foundation
- **02-test-infrastructure-cicd**: Tests for complex bulk operations

## Risks & Open Questions

- **Performance**: Bulk operations on hundreds of directories need batching. Current DB operations are one-at-a-time.
- **Glob security**: Shell glob expansion vs. programmatic globbing? Security considerations for path patterns.
- **Rule conflicts**: What if multiple rules match? Priority order, combine tags, or error?
- **Watch mode complexity**: File watching is notoriously tricky. Use `chokidar` or similar? Handle rename vs. create?
- **Detection accuracy**: "Contains react in package.json" is naive. Better heuristics needed for accurate detection.

## Notes

**Project Detection Markers**:
```
package.json → javascript/nodejs
Cargo.toml → rust
go.mod → go
pyproject.toml, setup.py → python
Gemfile → ruby
pom.xml, build.gradle → java
CMakeLists.txt → cpp
Makefile → make
docker-compose.yml → docker
.git → git (meta-tag)
```

**Batch Insert Optimization**:
```typescript
// Instead of N inserts
for (const path of paths) {
  await helpers.insertDirectory(path);
}

// Use batch insert
await db.insert(directoriesTable)
  .values(paths.map(p => ({ path: p })))
  .onConflictDoNothing();
```

**Watch Mode Architecture**:
- Use `chokidar` or Bun's native file watcher
- Debounce events (wait for directory to settle)
- Queue and batch process new directories
- Persistent daemon or foreground process?

**CLI Examples**:
```bash
# Add all projects in ~/code
tag scan ~/code --recursive --max-depth 3 --apply

# Preview what would be tagged
tag scan ~/code --detect --preview

# Bulk retag all react projects to add typescript
tag dir retag --matching-tags react --add typescript

# Watch for new projects
tag watch ~/code --rules default --daemon
```
