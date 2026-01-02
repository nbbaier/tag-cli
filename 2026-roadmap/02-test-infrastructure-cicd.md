# Test Infrastructure & CI/CD Pipeline

**Category:** Testing
**Quarter:** Q1
**T-shirt Size:** L

## Why This Matters

Tag-CLI currently has approximately 15% test coverage, with 68 tests covering only path utilities and a legacy database layer that's being phased out. There are zero tests for the actual CLI procedures (add, list, search, retag, remove), zero integration tests, and no CI/CD pipeline to enforce quality gates.

Without comprehensive testing, every code change is a gamble. Features may break silently, refactoring becomes risky, and contributor PRs can't be validated automatically. A robust test infrastructure is the safety net that enables confident, rapid development throughout Q2-Q4.

## Current State

**Test Coverage (~15%)**
- `tests/database.test.ts` - 46 tests for legacy raw SQLite layer (not used by production code)
- `tests/path.test.ts` - 22 tests for path utilities (good coverage here)
- No tests for any tRPC procedures
- No integration tests validating CLI end-to-end
- No error scenario tests

**No CI/CD**
- No `.github/workflows/` directory
- No automated testing on PRs
- No build verification
- No linting enforcement
- No code coverage tracking

**Testing Gaps**
- Tag CRUD operations untested
- Directory operations untested
- Search logic (AND/OR) untested
- Error handling paths untested
- tRPC-CLI command generation untested
- Path canonicalization edge cases partially tested

## Proposed Future State

A comprehensive test suite with:
- **Unit tests** for all database helpers (Drizzle-based)
- **Integration tests** for all tRPC procedures with isolated test databases
- **E2E tests** that invoke the actual CLI and verify output
- **Error scenario tests** for all failure paths
- **>80% code coverage** as a baseline target

Plus a fully automated CI/CD pipeline that:
- Runs all tests on every PR and push to main
- Enforces linting via Biome
- Builds the CLI and verifies it works
- Reports code coverage and blocks PRs that decrease coverage
- Automatically publishes releases when tags are pushed

## Key Deliverables

- [ ] Migrate `tests/database.test.ts` to test Drizzle helpers instead of legacy layer
- [ ] Add integration tests for all tag procedures (create, list, rename, remove)
- [ ] Add integration tests for all directory procedures (add, list, search, retag, remove)
- [ ] Add tests for search logic (AND with multiple tags, OR with `--any` flag)
- [ ] Add error scenario tests (duplicate tags, non-existent paths, constraint violations)
- [ ] Add E2E tests that invoke CLI via subprocess and verify output
- [ ] Create `.github/workflows/ci.yml` with test, lint, typecheck, build jobs
- [ ] Add code coverage reporting with `bun:test --coverage`
- [ ] Create `.github/workflows/release.yml` for automated releases
- [ ] Add pre-commit hooks via Biome for local quality enforcement
- [ ] Document testing patterns in `CONTRIBUTING.md`

## Prerequisites

- **01-technical-debt-cleanup**: Legacy database layer must be removed so we're testing the actual production code path.

## Risks & Open Questions

- **tRPC procedure testing**: How to test procedures in isolation vs. through CLI? May need test utilities to invoke procedures directly with mock context.
- **Database isolation**: Each test needs an isolated database. Current approach uses temp files - need to ensure proper cleanup and no test pollution.
- **CLI E2E testing**: Invoking CLI as subprocess adds complexity. Need to handle stdout parsing, error codes, and timeout scenarios.
- **Coverage targets**: 80% is aspirational. Need to determine what's realistic and what critical paths absolutely must be covered.

## Notes

Test file structure suggestion:
```
tests/
├── unit/
│   └── db/
│       └── helpers.test.ts    # Drizzle helper unit tests
├── integration/
│   ├── tags/
│   │   └── crud.test.ts       # Tag procedure tests
│   └── dirs/
│       ├── add.test.ts
│       ├── list.test.ts
│       ├── search.test.ts
│       ├── retag.test.ts
│       └── remove.test.ts
├── e2e/
│   └── cli.test.ts            # Full CLI subprocess tests
├── fixtures/
│   └── test-db.ts             # Test database setup utilities
└── path.test.ts               # Keep existing path tests
```

Existing test patterns in `tests/database.test.ts` can be adapted - the setup/teardown with temp directories is solid.

GitHub Actions workflow should use Bun's official action:
```yaml
- uses: oven-sh/setup-bun@v1
  with:
    bun-version: latest
```
