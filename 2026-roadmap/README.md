# Tag-CLI 2026 Strategic Roadmap

## Executive Summary

Tag-CLI is a TypeScript CLI tool for organizing development projects by tagging directories. Built on tRPC-CLI with SQLite/Drizzle ORM persistence, it provides a solid foundation for project organization but has significant unrealized potential.

This roadmap outlines 10 high-impact initiatives plus one moonshot that will transform Tag-CLI from a simple tagging utility into a **comprehensive project portfolio management platform** over the next four quarters.

### The Vision

By end of 2026, Tag-CLI should be:
- **Indispensable**: Deep integration with GitHub, VS Code, and the developer ecosystem
- **Intelligent**: Auto-detection, smart suggestions, and AI-powered organization
- **Scalable**: Performant with thousands of projects
- **Extensible**: A platform that the community builds upon
- **Delightful**: A joy to use, not just a utility

### Current State Assessment

| Aspect | Status | Notes |
|--------|--------|-------|
| Core Functionality | ✅ Solid | CRUD for tags/directories works well |
| Database Layer | ⚠️ Transitioning | Drizzle migration complete, legacy layer remains |
| Test Coverage | ⚠️ Low (~15%) | No procedure tests, no CI/CD |
| CLI Experience | ⚠️ Basic | No completions, no interactive mode |
| Scalability | ⚠️ Limited | No pagination, loads all into memory |
| Integrations | ❌ None | Completely isolated from ecosystem |
| Analytics | ❌ None | No insights from collected data |

---

## High-Level Themes

The roadmap is organized around five strategic themes:

### 1. Foundation & Technical Debt (Q1)
Clean up the codebase, establish quality gates, and create a stable platform for feature development.

### 2. Developer Experience (Q1-Q2)
Make the CLI a joy to use with completions, interactive mode, and intelligent defaults.

### 3. Intelligence & Organization (Q2)
Move beyond flat tags to hierarchies, aliases, and smart automation.

### 4. Scale & Performance (Q2-Q3)
Ensure Tag-CLI works with thousands of projects, not just dozens.

### 5. Platform & Ecosystem (Q3-Q4)
Transform from a tool into a platform with integrations, analytics, and plugins.

---

## Initiative Summary

| # | Initiative | Category | Quarter | Size | Impact |
|---|-----------|----------|---------|------|--------|
| 00 | [AI-Powered Project Intelligence](#moonshot) | Moonshot | Q4+ | XXL | 🚀 |
| 01 | [Technical Debt Cleanup](./01-technical-debt-cleanup.md) | Technical Debt | Q1 | M | Foundation |
| 02 | [Test Infrastructure & CI/CD](./02-test-infrastructure-cicd.md) | Testing | Q1 | L | Quality |
| 03 | [Enhanced CLI Experience](./03-enhanced-cli-experience.md) | DX | Q1-Q2 | M | Adoption |
| 04 | [Tag Hierarchies & Aliases](./04-tag-hierarchies-aliases.md) | Feature | Q2 | L | Power Users |
| 05 | [Bulk Operations & Automation](./05-bulk-operations-automation.md) | Feature | Q2 | M | Productivity |
| 06 | [Pagination & Performance](./06-pagination-performance.md) | Performance | Q2-Q3 | M | Scale |
| 07 | [Import/Export & Backup](./07-import-export-backup.md) | Feature | Q3 | S | Data Safety |
| 08 | [External Integrations](./08-external-integrations.md) | Integration | Q3 | XL | Ecosystem |
| 09 | [Analytics & Insights](./09-analytics-insights.md) | Feature | Q3-Q4 | L | Value |
| 10 | [Plugin System](./10-plugin-extensibility.md) | Architecture | Q4 | XL | Platform |

**Size Legend**: S (days) • M (1-2 weeks) • L (2-4 weeks) • XL (1-2 months) • XXL (quarter+)

---

## Dependency Graph

```
                    ┌─────────────────────────────────────────────────┐
                    │                    Q1                           │
                    │  ┌──────────────┐    ┌──────────────────────┐   │
                    │  │ 01 Technical │    │ 02 Test Infrastructure│  │
                    │  │    Debt      │───▶│       & CI/CD         │  │
                    │  └──────────────┘    └──────────────────────┘   │
                    │         │                      │                │
                    │         ▼                      ▼                │
                    │  ┌──────────────────────────────────────────┐   │
                    │  │      03 Enhanced CLI Experience          │   │
                    │  └──────────────────────────────────────────┘   │
                    └─────────────────────────────────────────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────────┐
                    │                    Q2                          │
                    │         ┌───────────┴───────────┐              │
                    │         ▼                       ▼              │
                    │  ┌──────────────┐    ┌───────────────────┐     │
                    │  │ 04 Tag       │    │ 05 Bulk Operations │    │
                    │  │ Hierarchies  │    │    & Automation    │    │
                    │  └──────────────┘    └───────────────────┘     │
                    │         │                       │              │
                    │         └───────────┬───────────┘              │
                    │                     ▼                          │
                    │         ┌───────────────────────┐              │
                    │         │ 06 Pagination &       │              │
                    │         │    Performance        │              │
                    │         └───────────────────────┘              │
                    └─────────────────────┼─────────────────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────────┐
                    │                    Q3                          │
                    │         ┌───────────┴───────────┐              │
                    │         ▼                       ▼              │
                    │  ┌──────────────┐    ┌───────────────────┐     │
                    │  │ 07 Import/   │    │ 08 External       │     │
                    │  │ Export       │───▶│    Integrations   │     │
                    │  └──────────────┘    └───────────────────┘     │
                    │                             │                  │
                    │         ┌───────────────────┘                  │
                    │         ▼                                      │
                    │  ┌───────────────────┐                         │
                    │  │ 09 Analytics &    │                         │
                    │  │    Insights       │                         │
                    │  └───────────────────┘                         │
                    └─────────────────────┼─────────────────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────────┐
                    │                    Q4                          │
                    │                     ▼                          │
                    │         ┌───────────────────────┐              │
                    │         │ 10 Plugin System &    │              │
                    │         │    Extensibility      │              │
                    │         └───────────────────────┘              │
                    │                     │                          │
                    │                     ▼                          │
                    │         ┌───────────────────────┐              │
                    │         │ 00 MOONSHOT           │              │
                    │         │ AI-Powered Project    │              │
                    │         │ Intelligence          │              │
                    │         └───────────────────────┘              │
                    └────────────────────────────────────────────────┘
```

---

## Quarterly Breakdown

### Q1 2026: Foundation

**Goal**: Establish a rock-solid foundation for everything that follows.

| Initiative | Focus | Success Metric |
|------------|-------|----------------|
| 01 Technical Debt | Clean codebase | Zero legacy code, single path utilities |
| 02 Testing/CI | Quality gates | >80% coverage, automated CI on every PR |
| 03 CLI Experience | Usability | Shell completions working in Bash/Zsh/Fish |

**Q1 Exit Criteria**:
- All tests pass on every PR
- Clean `biome check` on all code
- Shell completions installable and working

---

### Q2 2026: Intelligence

**Goal**: Make Tag-CLI smart about organization and scale.

| Initiative | Focus | Success Metric |
|------------|-------|----------------|
| 04 Hierarchies | Power organization | Tag trees with inheritance working |
| 05 Bulk Ops | Productivity | Can tag 100 projects in one command |
| 06 Performance | Scale | <100ms list with 10K directories |

**Q2 Exit Criteria**:
- Users can create tag hierarchies with `--parent`
- `tag scan ~/code --detect --apply` works end-to-end
- Pagination on all list/search commands

---

### Q3 2026: Ecosystem

**Goal**: Connect Tag-CLI to the broader development ecosystem.

| Initiative | Focus | Success Metric |
|------------|-------|----------------|
| 07 Import/Export | Data portability | Full roundtrip export/import |
| 08 Integrations | Ecosystem | GitHub sync + VS Code extension |
| 09 Analytics | Insights | `tag stats` shows actionable insights |

**Q3 Exit Criteria**:
- Can export and import all data to JSON/YAML
- GitHub Topics sync in both directions
- VS Code extension available in marketplace
- `tag health` identifies issues and suggests fixes

---

### Q4 2026: Platform

**Goal**: Transform from tool to platform.

| Initiative | Focus | Success Metric |
|------------|-------|----------------|
| 10 Plugins | Extensibility | 3+ community plugins published |
| 00 Moonshot | Intelligence | AI tag suggestions working |

**Q4 Exit Criteria**:
- Plugin SDK published and documented
- At least 3 community plugins in registry
- AI-powered features in experimental preview

---

## Moonshot

### [00-moonshot.md](./00-moonshot.md): AI-Powered Project Intelligence Platform

The moonshot envisions Tag-CLI evolving into an AI-powered project intelligence platform that:

- **Auto-tags** projects by analyzing code, dependencies, and patterns
- **Recommends** related projects and optimal organization
- **Predicts** which projects you'll need based on context
- **Generates** natural language insights about your portfolio
- **Learns** your organization patterns and applies them automatically

This is the "what if we went all-in on the craziest version" idea. Read [00-moonshot.md](./00-moonshot.md) for the full vision.

---

## Prioritization Rationale

Initiatives are ranked by weighing:

1. **Foundation building** (01, 02): Everything else depends on clean code and tests
2. **User impact** (03, 04, 05): Direct improvements to daily usage
3. **Scale enablement** (06): Must work before large datasets
4. **Data safety** (07): Users need confidence in their data
5. **Strategic positioning** (08, 09): What makes Tag-CLI stand out
6. **Platform play** (10): Long-term ecosystem building

The moonshot is unranked—it's the north star that pulls everything forward.

---

## How to Read This Roadmap

Each initiative file contains:

- **Why This Matters**: Strategic value and impact
- **Current State**: What exists today
- **Proposed Future State**: The vision when done
- **Key Deliverables**: Specific, actionable items
- **Prerequisites**: What must happen first
- **Risks & Open Questions**: Known unknowns

Use the dependency graph to understand sequencing. Start with Q1 initiatives even if Q4 ideas are more exciting—the foundation enables everything else.

---

## Success Metrics for 2026

By end of year, Tag-CLI should achieve:

| Metric | Target |
|--------|--------|
| GitHub Stars | 1,000+ |
| Monthly Active Users | 500+ |
| Community Plugins | 10+ |
| Test Coverage | >80% |
| CLI Response Time | <100ms for all operations |
| Supported Integrations | GitHub, VS Code, 2+ IDEs |

---

## Contributing to This Roadmap

This roadmap is a living document. To propose changes:

1. Open an issue describing the initiative
2. Reference specific pain points or opportunities
3. Consider dependencies with existing initiatives
4. Propose a quarter and t-shirt size

The best roadmaps evolve with their communities.
