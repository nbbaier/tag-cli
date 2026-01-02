# External Integrations Ecosystem

**Category:** Integration
**Quarter:** Q3
**T-shirt Size:** XL

## Why This Matters

Tag-CLI currently exists in isolation. Your project tags in Tag-CLI don't know about your GitHub Topics, your VS Code workspaces, your IDE's project list, or your package.json metadata. This fragmentation means organizing in one place doesn't help elsewhere.

Integrations transform Tag-CLI from a standalone tool into a hub that syncs with your entire development ecosystem. Tag a project once, and it's organized everywhere. Import your GitHub Topics, and your CLI reflects your remote organization. This is how Tag-CLI becomes indispensable.

## Current State

**Complete Isolation**
- Tag-CLI data stays in SQLite
- No integration with any external service
- No awareness of project file structure
- No IDE or editor integration

**No Project Introspection**
- Doesn't read package.json, Cargo.toml, etc.
- Doesn't detect project type automatically
- Tags are purely user-defined

**No Version Control Integration**
- No Git hooks
- No awareness of repository remotes
- Can't sync with GitHub/GitLab

**No Editor Support**
- No VS Code extension
- No JetBrains plugin
- No Neovim integration

## Proposed Future State

**GitHub Integration**:
```bash
# Sync GitHub Topics to local tags
tag sync github --import
# Imported topics from 45 repositories

# Push local tags to GitHub Topics
tag sync github --export

# Two-way sync
tag sync github --bidirectional

# Link repository
tag github link https://github.com/user/repo
```

**VS Code Extension**:
- Sidebar showing all tagged projects
- Quick switch between projects by tag
- Right-click to add/remove tags
- Status bar showing current project's tags
- Workspace generation from tag search

**IDE Project Detection**:
```bash
# Auto-detect project type from files
tag dir add . --detect
# Detected: Node.js project (package.json)
# Suggested tags: javascript, nodejs
# Dependencies detected: react, typescript
# Apply suggested tags? [y/n]
```

**Git Hooks**:
```bash
# Install hooks in repository
tag hooks install
# Installed: post-checkout (updates tags on branch switch)

# Auto-tag on clone
git clone ... && tag dir add . --detect
```

**Package Manager Integration**:
```bash
# Tag based on dependencies
tag dir analyze .
# Found in package.json:
#   react, typescript, tailwindcss
# Found in devDependencies:
#   vitest, eslint, prettier
# Suggested tags: frontend, react, typescript, testing
```

## Key Deliverables

- [ ] Create GitHub CLI integration (`gh` extension or API)
- [ ] Implement `tag sync github` with import/export/bidirectional modes
- [ ] Add `tag github link` to associate directory with repository
- [ ] Create VS Code extension with sidebar, status bar, commands
- [ ] Add workspace generation from tag search results
- [ ] Implement project detection for Node.js, Python, Rust, Go, Java
- [ ] Add `--detect` flag to `tag dir add` for auto-suggestion
- [ ] Create `tag analyze` command for dependency inspection
- [ ] Implement Git hook templates for post-checkout, post-clone
- [ ] Add `tag hooks install/uninstall` commands
- [ ] Create JetBrains plugin (IntelliJ, WebStorm, PyCharm)
- [ ] Add Raycast extension for macOS users
- [ ] Add Alfred workflow for macOS users
- [ ] Create Neovim plugin with Telescope integration
- [ ] Document API for third-party integration development

## Prerequisites

- **01-technical-debt-cleanup**: Stable database before external tools access
- **03-enhanced-cli-experience**: Shell completions for integration scripts
- **07-import-export-backup**: Export format for sync operations

## Risks & Open Questions

- **GitHub API rate limits**: Syncing many repositories needs throttling. Use GraphQL for efficiency?
- **Authentication**: How to handle GitHub auth? `gh auth` delegation? OAuth flow?
- **Conflict resolution**: What if GitHub Topic and local tag conflict? Which wins?
- **Extension maintenance**: VS Code and JetBrains plugins need separate maintenance. Resource investment.
- **Detection accuracy**: Auto-detection might mis-tag projects. User should always confirm.

## Notes

**GitHub Topics Sync**:
```typescript
// Using Octokit
const repos = await octokit.repos.listForAuthenticatedUser();
for (const repo of repos) {
  const topics = await octokit.repos.getAllTopics({ owner, repo: repo.name });
  const localPath = findLocalPath(repo.clone_url);
  if (localPath) {
    await tagDirectory(localPath, topics.names);
  }
}
```

**VS Code Extension Structure**:
```
vscode-tag-cli/
├── src/
│   ├── extension.ts      # Activation, command registration
│   ├── sidebar.ts        # Tree view provider
│   ├── statusbar.ts      # Status bar integration
│   └── tag-cli.ts        # CLI wrapper
├── package.json          # Extension manifest
└── README.md
```

**Project Detection Heuristics**:
```yaml
Node.js:
  files: [package.json]
  tags: [javascript, nodejs]
  inspect: package.json → dependencies

Python:
  files: [pyproject.toml, setup.py, requirements.txt]
  tags: [python]
  inspect: pyproject.toml → [tool.poetry.dependencies]

Rust:
  files: [Cargo.toml]
  tags: [rust]
  inspect: Cargo.toml → [dependencies]

Go:
  files: [go.mod]
  tags: [go]
  inspect: go.mod → require

Docker:
  files: [Dockerfile, docker-compose.yml]
  tags: [docker, containerized]
```

**Git Hook Example (post-checkout)**:
```bash
#!/bin/bash
# .git/hooks/post-checkout

# Update tag-cli entry on branch switch
tag dir add . --update-only --silent
```

This initiative positions Tag-CLI at the center of the developer's tooling universe.
