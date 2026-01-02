# Analytics & Insights Dashboard

**Category:** New Feature
**Quarter:** Q3-Q4
**T-shirt Size:** L

## Why This Matters

Tag-CLI collects valuable metadata about your development projects, but currently provides no way to derive insights from it. How many frontend projects do you have? Which tags are overused or underused? Are there stale projects you've forgotten about?

Analytics transform Tag-CLI from a organizational utility into a portfolio management tool. See patterns in your work, discover neglected projects, understand your technology distribution, and make data-driven decisions about where to focus your time.

## Current State

**No Visibility Into Data**
- Can list tags and directories, but no aggregation
- No counts, no trends, no patterns
- No way to find "most used tag" or "oldest project"

**No Staleness Detection**
- No tracking of when directories were last accessed
- Can't identify abandoned projects
- No cleanup recommendations

**No Visualization**
- Pure text output only
- No charts, no graphs, no dashboards
- No summary statistics

**No Health Metrics**
- No tag coverage (directories without tags)
- No orphan detection (tags with no directories)
- No database statistics

## Proposed Future State

**Rich Statistics**:
```bash
tag stats
# ┌────────────────────────────────────────┐
# │  Tag-CLI Statistics                    │
# ├────────────────────────────────────────┤
# │  Total directories: 156                │
# │  Total tags: 23                        │
# │  Avg tags per directory: 2.4           │
# │  Untagged directories: 12              │
# │  Unused tags: 3                        │
# │  Last activity: 2 hours ago            │
# └────────────────────────────────────────┘

tag stats --tags
# Top tags by usage:
#   frontend    (67 dirs)  ████████████████████
#   backend     (45 dirs)  █████████████
#   typescript  (42 dirs)  ████████████
#   react       (38 dirs)  ███████████
#   python      (23 dirs)  ███████
```

**Staleness Detection**:
```bash
tag stale
# Directories not accessed in 6+ months:
#   ~/old-project-1  [backend, python]  Last: 8 months ago
#   ~/legacy-app     [frontend]         Last: 1 year ago
#   ~/abandoned      [experimental]     Last: 2 years ago
#
# Archive these? [y/n/select]

tag stale --threshold 90d  # Custom threshold
```

**Health Dashboard**:
```bash
tag health
# ┌─ Coverage ─────────────────────────────┐
# │ ████████████████████░░░░ 78% tagged    │
# │ 34 directories without tags            │
# └────────────────────────────────────────┘
#
# ┌─ Issues ───────────────────────────────┐
# │ ⚠ 3 unused tags (no directories)       │
# │ ⚠ 5 directories with only 1 tag        │
# │ ⚠ 12 directories no longer exist       │
# └────────────────────────────────────────┘
#
# Run `tag fix` to resolve issues
```

**Technology Distribution**:
```bash
tag stats --tech
# Technology breakdown:
#   JavaScript/Node  45%  ████████████████████████
#   Python           23%  ████████████
#   Rust             15%  ████████
#   Go               10%  █████
#   Other             7%  ████
```

## Key Deliverables

- [ ] Create `tag stats` command with summary statistics
- [ ] Add `--tags` flag for per-tag usage breakdown
- [ ] Add `--dirs` flag for per-directory analysis
- [ ] Implement `tag stale` for staleness detection
- [ ] Add `--threshold` for customizable staleness period
- [ ] Track last-accessed time for directories (new column)
- [ ] Create `tag health` for database health dashboard
- [ ] Detect orphan tags, untagged directories, missing paths
- [ ] Implement `tag fix` to interactively resolve issues
- [ ] Add `--json` output for all stats commands
- [ ] Create ASCII/Unicode bar charts for terminal visualization
- [ ] Add `tag stats --trend` for changes over time
- [ ] Implement tech stack analysis from tag patterns
- [ ] Add export of stats to markdown for documentation
- [ ] Create TUI dashboard mode with live updates

## Prerequisites

- **01-technical-debt-cleanup**: Stable schema for new columns
- **04-tag-hierarchies-aliases**: Hierarchies enable deeper analysis
- **05-bulk-operations-automation**: Automation data for trend analysis

## Risks & Open Questions

- **Last-accessed tracking**: How to track? Update on every `search`/`list`? Only on explicit action? Privacy implications?
- **Definition of "stale"**: Filesystem last-modified? Git last-commit? Tag-CLI last-interaction? All three?
- **Visualization limits**: Terminal-based charts are limited. Interactive TUI (Ink) vs. static text? Web dashboard?
- **Trend storage**: Need historical data for trends. Store snapshots? How long to retain?

## Notes

**Schema Addition**:
```sql
ALTER TABLE directories ADD COLUMN last_accessed_at INTEGER;
```

**Staleness Calculation**:
```typescript
function isStale(dir: Directory, thresholdDays: number): boolean {
  const lastAccess = dir.lastAccessedAt ?? dir.rowCreatedAt;
  const daysSince = (Date.now() - lastAccess.getTime()) / (1000 * 60 * 60 * 24);
  return daysSince > thresholdDays;
}
```

**ASCII Chart Rendering**:
```typescript
function renderBar(value: number, max: number, width: number = 20): string {
  const filled = Math.round((value / max) * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
}
```

**Health Checks**:
```typescript
const healthChecks = [
  { name: "Orphan tags", check: () => findTagsWithNoDirectories() },
  { name: "Untagged dirs", check: () => findDirectoriesWithNoTags() },
  { name: "Missing paths", check: () => findNonExistentPaths() },
  { name: "Duplicate paths", check: () => findDuplicatePaths() },
  { name: "Empty descriptions", check: () => findTagsWithoutDescriptions() },
];
```

**TUI Dashboard Vision** (using Ink):
```
┌──────────────────────────────────────────────────────────┐
│  Tag-CLI Dashboard                          [q] Quit     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  📊 Overview          │  🏷️  Top Tags                    │
│  ─────────────        │  ──────────                      │
│  Directories: 156     │  frontend     67 ████████████    │
│  Tags: 23             │  backend      45 ████████        │
│  Coverage: 78%        │  typescript   42 ███████         │
│                       │  react        38 ███████         │
│  ⚠ 3 issues          │  python       23 ████            │
│                                                          │
│  🕐 Recent Activity                                      │
│  ─────────────────                                       │
│  ~/projects/new-app   Added 2 hours ago                  │
│  ~/work/dashboard     Retagged yesterday                 │
│  ~/oss/contrib        Searched 3 days ago                │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

This initiative transforms Tag-CLI into a portfolio intelligence tool.
