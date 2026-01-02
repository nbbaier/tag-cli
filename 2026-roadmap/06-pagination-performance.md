# Pagination & Performance Optimization

**Category:** Performance
**Quarter:** Q2-Q3
**T-shirt Size:** M

## Why This Matters

Tag-CLI works great with 50 directories. What about 5,000? Or 50,000? The current architecture loads all results into memory before filtering or displaying. As users adopt Tag-CLI across their entire development history, this becomes a bottleneck.

Performance work now prevents painful rewrites later. Cursor-based pagination, indexed full-text search, and query optimization establish patterns that scale. This initiative is about building for the Tag-CLI that exists in two years, not just today.

## Current State

**No Pagination**
- `getAllDirectories()` returns all rows (`src/db/db.ts:80-85`)
- `getAllTags()` returns all rows (`src/db/db.ts:43-45`)
- Search loads all matching directories into memory before grouping
- Large result sets cause memory pressure and slow display

**Limited Indexing**
- Good: Unique indexes on `tags.name`, `directories.path`
- Good: Junction table indexes on foreign keys
- Missing: Full-text search capability
- Missing: Composite indexes for common query patterns

**No Caching**
- Every query hits SQLite directly
- No query result caching
- No prepared statement caching (Drizzle handles this)

**No Performance Metrics**
- No query timing
- No slow query detection
- No benchmarking suite

## Proposed Future State

**Cursor-Based Pagination**:
```bash
tag dir list --limit 20                    # First 20
tag dir list --limit 20 --after abc123     # Next 20
tag dir search --tags backend --limit 50   # Paginated search
```

**Full-Text Search**:
```bash
# Fast fuzzy search across paths and tag names
tag search "react dashboard"    # Finds directories with these terms
tag dir list --query "proj*"    # Wildcard path matching
```

**Performance Targets**:
- List 10,000 directories: < 100ms
- Search across 10,000 directories: < 200ms
- Cold start (first query): < 500ms
- Memory usage: < 50MB regardless of dataset size

**Query Optimization Dashboard**:
```bash
tag debug --query-stats
# Last 10 queries:
#   dir list: 45ms (2,341 rows)
#   dir search --tags react: 23ms (156 rows)
#   tags list: 2ms (47 rows)
```

## Key Deliverables

- [ ] Implement cursor-based pagination for `dir list` and `dir search`
- [ ] Add `--limit` and `--after` flags to list/search commands
- [ ] Add `--offset` flag for simple offset pagination (backwards compat)
- [ ] Create SQLite FTS5 virtual table for full-text search
- [ ] Index directory paths and tag names in FTS5
- [ ] Add `tag search` command for global fuzzy search
- [ ] Add composite indexes for common query patterns
- [ ] Implement query result caching with TTL
- [ ] Add `--no-cache` flag to bypass cache when needed
- [ ] Create performance benchmark suite
- [ ] Add `tag debug --query-stats` for performance visibility
- [ ] Optimize search grouping to use SQL aggregation, not JS
- [ ] Add query timeout protection
- [ ] Document performance characteristics and scaling limits

## Prerequisites

- **01-technical-debt-cleanup**: Clean DB layer before optimization
- **02-test-infrastructure-cicd**: Performance regression tests

## Risks & Open Questions

- **FTS5 complexity**: Full-text search adds significant complexity. Worth it for the use case? Could start with LIKE queries and upgrade later.
- **Cursor stability**: Cursor-based pagination requires stable ordering. What if data changes between pages?
- **Cache invalidation**: Caching adds complexity. Simple TTL, or smarter invalidation on writes?
- **Breaking changes**: Adding pagination changes API contracts. Need backwards-compatible defaults.

## Notes

**Cursor-Based Pagination Pattern**:
```typescript
// Encode cursor as base64 of last item's (timestamp, id)
function encodeCursor(item: Directory): string {
  return btoa(`${item.rowCreatedAt?.getTime()}:${item.id}`);
}

// Query with cursor
const results = await db
  .select()
  .from(directoriesTable)
  .where(
    cursor
      ? sql`(row_created_at, id) > (${decodedTime}, ${decodedId})`
      : undefined
  )
  .orderBy(directoriesTable.rowCreatedAt, directoriesTable.id)
  .limit(limit + 1); // +1 to detect hasMore
```

**FTS5 Setup**:
```sql
-- Create FTS table
CREATE VIRTUAL TABLE directories_fts USING fts5(
  path,
  content=directories,
  content_rowid=id
);

-- Triggers to keep in sync
CREATE TRIGGER directories_ai AFTER INSERT ON directories BEGIN
  INSERT INTO directories_fts(rowid, path) VALUES (new.id, new.path);
END;

-- Search
SELECT * FROM directories WHERE id IN (
  SELECT rowid FROM directories_fts WHERE directories_fts MATCH 'react*'
);
```

**Benchmark Suite**:
```typescript
// tests/benchmarks/performance.bench.ts
import { bench, run } from "mitata";

bench("list 1000 directories", async () => {
  await helpers.getAllDirectories();
});

bench("search with 5 tags", async () => {
  await search({ tags: ["a", "b", "c", "d", "e"], any: false });
});
```

**Current Hot Path in Search** (`src/router/dirs/procedures/search.ts:53-86`):
The OR search groups results in JavaScript with `reduce()`. This could be done in SQL with `GROUP BY` and `GROUP_CONCAT` for significant speedup.
