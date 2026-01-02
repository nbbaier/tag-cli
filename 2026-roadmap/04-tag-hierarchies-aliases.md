# Tag Hierarchies & Aliases

**Category:** New Feature
**Quarter:** Q2
**T-shirt Size:** L

## Why This Matters

Real-world project organization is hierarchical. A project isn't just "frontend"—it's "frontend/react/typescript" or "backend/python/django". Currently, Tag-CLI treats all tags as flat, equal entities. Users must manually apply multiple related tags and remember which tags go together.

Tag hierarchies unlock intelligent organization: applying "react" could automatically imply "frontend" and "javascript". Searching for "frontend" would find all React, Vue, Angular, and Svelte projects. Aliases would let teams standardize on "js" or "javascript" without migration pain. This transforms Tag-CLI from a simple labeling system into a powerful taxonomy engine.

## Current State

**Flat Tag Structure**
- All tags are equal peers in the `tags` table
- No concept of parent-child relationships
- Schema: `tags(id, name, description, timestamps)`
- No relationships between tags table and itself

**Manual Multi-Tagging**
- Users must apply `frontend`, `react`, `typescript` separately
- No automatic inheritance or implication
- Removing a parent concept requires manually removing all children

**No Aliases**
- Tag `js` and `javascript` are completely separate
- Teams can't standardize without migrating all usages
- No way to mark tags as synonyms

**Search Limitations**
- Searching for `frontend` only finds exact `frontend` tags
- Can't discover related concepts
- No tag recommendation based on existing tags

## Proposed Future State

**Hierarchical Tags**:
```
frontend/
├── react/
│   └── nextjs
├── vue/
│   └── nuxt
├── angular
└── svelte

backend/
├── nodejs/
│   └── express
├── python/
│   └── django
└── go
```

Applying `react` automatically implies `frontend`. Searching for `frontend` finds everything beneath it.

**Aliases**:
```
js → javascript
ts → typescript
py → python
node → nodejs
```

`tag dir add --tags js` resolves to `javascript`. Search either, find the same results.

**Smart Inheritance**:
- `--inherit` flag applies parent tags automatically
- `--exact` flag disables inheritance for precise matching
- `--expand` flag shows full hierarchy in output

## Key Deliverables

- [ ] Extend `tags` schema with `parent_id` column for hierarchy
- [ ] Create `tag_aliases` table: `(alias_name, canonical_tag_id)`
- [ ] Update `tag tags create` to support `--parent` flag
- [ ] Add `tag tags tree` command to visualize hierarchy
- [ ] Add `tag tags alias` command to create aliases
- [ ] Implement inheritance in search: `--tags frontend` finds children
- [ ] Add `--exact` flag to disable inheritance in search
- [ ] Add `--expand` flag to show full hierarchy in list output
- [ ] Auto-resolve aliases on all tag inputs
- [ ] Add validation: prevent circular hierarchies
- [ ] Add `tag tags reparent` to move tags in hierarchy
- [ ] Add `tag tags merge` to combine duplicate tags
- [ ] Update shell completions to include aliases
- [ ] Migrate existing data: existing tags become root-level

## Prerequisites

- **01-technical-debt-cleanup**: Clean Drizzle schema before extending
- **02-test-infrastructure-cicd**: Tests for complex hierarchy logic

## Risks & Open Questions

- **Schema migration**: Adding `parent_id` requires migration. Need to handle existing databases gracefully.
- **Circular reference prevention**: Must detect and reject `A → B → C → A` cycles.
- **Performance**: Deep hierarchies + large datasets could slow inheritance queries. May need materialized path or nested set model.
- **UX complexity**: Hierarchies add cognitive load. Need clear CLI syntax and good defaults.
- **Alias conflicts**: What if alias name conflicts with existing tag? Reject, warn, or auto-resolve?

## Notes

**Schema Changes**:
```sql
-- Add to tags table
ALTER TABLE tags ADD COLUMN parent_id INTEGER REFERENCES tags(id);

-- New aliases table
CREATE TABLE tag_aliases (
  id INTEGER PRIMARY KEY,
  alias_name TEXT UNIQUE NOT NULL,
  canonical_tag_id INTEGER NOT NULL REFERENCES tags(id),
  created_at INTEGER
);
```

**Hierarchy Query Pattern** (for finding all descendants):
```sql
WITH RECURSIVE descendants AS (
  SELECT id, name, parent_id FROM tags WHERE name = 'frontend'
  UNION ALL
  SELECT t.id, t.name, t.parent_id
  FROM tags t JOIN descendants d ON t.parent_id = d.id
)
SELECT * FROM descendants;
```

**CLI Examples**:
```bash
# Create hierarchy
tag tags create react --parent frontend
tag tags create nextjs --parent react

# Create alias
tag tags alias js javascript

# Search with inheritance
tag dir search --tags frontend        # Finds react, vue, angular, etc.
tag dir search --tags frontend --exact  # Only finds 'frontend' tag

# View hierarchy
tag tags tree
# frontend
# ├── react
# │   └── nextjs
# ├── vue
# └── angular
```

This feature positions Tag-CLI as a serious taxonomy tool, not just a simple tagger.
