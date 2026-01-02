# Technical Debt Cleanup & Foundation Hardening

**Category:** Technical Debt
**Quarter:** Q1
**T-shirt Size:** M

## Why This Matters

Tag-CLI has accumulated technical debt during its rapid development, including a legacy database layer that coexists with the new Drizzle ORM, duplicate utility modules, misconfigured build tooling, and unused dependencies. This debt creates maintenance burden, confusion for new contributors, and potential bugs from inconsistent code paths.

Addressing this debt first is critical because every future initiative builds on this foundation. Clean architecture enables faster development, reduces bugs, and makes the codebase welcoming for contributors. Without this cleanup, we'd be building new features on an unstable foundation.

## Current State

**Legacy Database Layer (`src/db/index.ts`)**
- 151 lines of raw SQLite code with prepared statements
- Uses different schema (TEXT timestamps vs INTEGER timestamps in Drizzle)
- Only used by tests, but tests don't cover actual procedures
- Creates confusion about which database layer to use

**Duplicate Path Utilities**
- `src/util/path.ts` (46 lines) - older, simpler version using `~/.local/state/tag/`
- `src/utils/path.ts` (71 lines) - newer version using `~/.local/state/tag-cli/`
- Different imports across codebase (db/index.ts uses util/, procedures use utils/)
- Different default database filenames (`data.db` vs `tag.db`)

**Drizzle Configuration Issue**
- `drizzle.config.ts:9` specifies `dialect: "turso"` (cloud database)
- Actual runtime uses `bun:sqlite` (local SQLite)
- May cause issues with `drizzle-kit` migrations and tooling

**Unused Dependencies**
- `@faker-js/faker`, `uuid`, `nanoid`, `@types/object-hash` - never imported
- `sqlite3`, `@libsql/client` - not used (app uses `bun:sqlite`)
- `ink`, `react`, `@inkjs/ui` - installed but no React/Ink components exist
- Increases bundle size and security surface area

**Inconsistent Error Handling**
- Most procedures use `TRPCError` correctly
- `src/router/dirs/procedures/remove.ts:33` throws plain `Error`
- Creates inconsistent CLI error formatting

## Proposed Future State

A pristine, single-path codebase where:
- One database layer (Drizzle ORM) handles all persistence
- One path utility module with clear, documented behavior
- Correct tooling configuration that matches runtime behavior
- Minimal, actively-used dependencies
- Consistent error handling patterns throughout
- Clear separation between legacy code (marked for removal) and production code

The codebase should be immediately understandable to a new developer, with no "which one do I use?" confusion.

## Key Deliverables

- [ ] Remove `src/db/index.ts` legacy database layer entirely
- [ ] Migrate `tests/database.test.ts` to use Drizzle helpers
- [ ] Delete `src/util/path.ts` and consolidate into `src/utils/path.ts`
- [ ] Update all imports to use the canonical `@/utils/path` module
- [ ] Standardize database path to `~/.local/state/tag-cli/tag.db`
- [ ] Fix `drizzle.config.ts` to use `dialect: "sqlite"` instead of `"turso"`
- [ ] Remove unused dependencies from `package.json`
- [ ] Standardize error handling to use `TRPCError` in all procedures
- [ ] Update `README.md` to reflect actual project structure
- [ ] Add migration guide for existing users (database path change)
- [ ] Run `biome check --write` and ensure clean linting

## Prerequisites

None - this is foundational work that unblocks all other initiatives.

## Risks & Open Questions

- **Database path migration**: Changing from `~/.local/state/tag/data.db` to `~/.local/state/tag-cli/tag.db` will orphan existing user data. Need a migration strategy or backward-compatible path resolution.
- **Test coverage during migration**: Removing the legacy layer before having Drizzle-based tests means temporary reduction in test coverage.
- **Drizzle dialect change**: Verify that changing from "turso" to "sqlite" doesn't break existing migrations.

## Notes

Relevant files to modify:
- `src/db/index.ts` - DELETE
- `src/util/path.ts` - DELETE
- `src/db/db.ts:4` - Update import from `../util/path` to `@/utils/path`
- `drizzle.config.ts:9` - Change `dialect: "turso"` to `dialect: "sqlite"`
- `tests/database.test.ts` - Rewrite to use Drizzle helpers
- `package.json:29-46` - Remove unused dependencies

After completion, run full test suite and manual smoke tests to verify no regressions.
