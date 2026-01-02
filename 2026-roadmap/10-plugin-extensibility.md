# Plugin System & Extensibility

**Category:** Architecture
**Quarter:** Q4
**T-shirt Size:** XL

## Why This Matters

No single tool can anticipate every user's needs. Some want integration with internal company tools, others want custom tag validators, and others want to connect to niche services. Without extensibility, Tag-CLI must either bloat with every conceivable feature or leave users wanting.

A plugin system transforms Tag-CLI from a fixed product into a platform. Users extend it for their needs, the community builds shared solutions, and the core remains lean and focused. This is how tools become ecosystems.

## Current State

**Monolithic Architecture**
- All functionality compiled into single binary
- No extension points
- Changes require core code modifications
- No way for users to add custom behavior

**Fixed Command Set**
- Commands defined by tRPC routers only
- Can't add commands without forking
- No command aliases beyond what's hardcoded

**No Event System**
- Can't hook into tag operations
- No lifecycle events (before/after add, remove, etc.)
- No notification capabilities

**No Custom Providers**
- Single SQLite backend
- Can't swap storage
- Can't add external data sources

## Proposed Future State

**Plugin Architecture**:
```bash
# Install community plugin
tag plugins install tag-cli-plugin-github
tag plugins install tag-cli-plugin-notion

# List installed plugins
tag plugins list
# github    1.2.0  Sync tags with GitHub Topics
# notion    0.8.0  Link directories to Notion pages

# Plugin provides new commands
tag github sync --import
tag notion link .
```

**Hook System**:
```typescript
// ~/.config/tag-cli/hooks.ts
export default {
  onTagAdd: async ({ directory, tags }) => {
    // Custom logic when tags are added
    await notifySlack(`Tagged ${directory} with ${tags.join(", ")}`);
  },

  onDirectoryRemove: async ({ directory }) => {
    // Cleanup external references
    await removeFromNotion(directory);
  },

  beforeSearch: async ({ query }) => {
    // Modify search behavior
    return { ...query, includeArchived: false };
  },
};
```

**Custom Tag Providers**:
```typescript
// Plugin that adds tags from external source
export const githubProvider: TagProvider = {
  name: "github",

  async resolveTags(directory: string): Promise<string[]> {
    const remote = await getGitRemote(directory);
    const topics = await fetchGitHubTopics(remote);
    return topics;
  },
};
```

**Custom Commands**:
```typescript
// Plugin adds new command
export const commands = {
  "deploy": createCommand({
    description: "Deploy tagged projects",
    input: z.object({ tag: z.string() }),
    handler: async ({ tag }) => {
      const dirs = await searchByTag(tag);
      for (const dir of dirs) {
        await deployProject(dir);
      }
    },
  }),
};
```

## Key Deliverables

- [ ] Design plugin manifest format (package.json or dedicated file)
- [ ] Create plugin loading mechanism from `~/.config/tag-cli/plugins/`
- [ ] Implement `tag plugins install/uninstall/list/update` commands
- [ ] Create plugin registry/discovery (npm scope? dedicated registry?)
- [ ] Design and implement hook system with lifecycle events
- [ ] Add beforeAdd, afterAdd, beforeRemove, afterRemove hooks
- [ ] Add beforeSearch, afterSearch hooks for query modification
- [ ] Create TagProvider interface for external tag sources
- [ ] Allow plugins to register custom commands
- [ ] Create SDK package for plugin development (`@tag-cli/sdk`)
- [ ] Implement plugin sandboxing for security
- [ ] Add plugin configuration in `~/.config/tag-cli/config.yaml`
- [ ] Create starter template for new plugins
- [ ] Document plugin development in comprehensive guide
- [ ] Create official plugin repository with community plugins

## Prerequisites

- **01-technical-debt-cleanup**: Clean architecture to build plugins on
- **02-test-infrastructure-cicd**: Test harness for plugins
- **07-import-export-backup**: Export format plugins can use
- **08-external-integrations**: First integrations become plugin examples

## Risks & Open Questions

- **Security**: Plugins run arbitrary code. Sandboxing? Permissions? Trust model?
- **API stability**: Plugin API must be stable. Versioning strategy for breaking changes?
- **Distribution**: npm? Dedicated registry? Git URLs? All three?
- **Discovery**: How do users find plugins? Curated list? Search? Ratings?
- **Compatibility**: Plugins must work across Tag-CLI versions. Semver enforcement?

## Notes

**Plugin Manifest** (`tag-cli-plugin.json`):
```json
{
  "name": "tag-cli-plugin-github",
  "version": "1.0.0",
  "description": "GitHub Topics integration",
  "main": "dist/index.js",
  "tag-cli": {
    "minVersion": "1.0.0",
    "commands": ["github sync", "github link"],
    "hooks": ["onTagAdd", "onSearch"],
    "providers": ["github"]
  }
}
```

**Hook Interface**:
```typescript
interface Hooks {
  // Directory lifecycle
  beforeDirectoryAdd?(ctx: { path: string; tags: string[] }): Promise<void>;
  afterDirectoryAdd?(ctx: { directory: Directory }): Promise<void>;
  beforeDirectoryRemove?(ctx: { directory: Directory }): Promise<void>;
  afterDirectoryRemove?(ctx: { path: string }): Promise<void>;

  // Tag lifecycle
  beforeTagCreate?(ctx: { name: string }): Promise<void>;
  afterTagCreate?(ctx: { tag: Tag }): Promise<void>;

  // Search
  beforeSearch?(ctx: { query: SearchQuery }): Promise<SearchQuery>;
  afterSearch?(ctx: { results: Directory[] }): Promise<Directory[]>;
}
```

**Plugin Loading**:
```typescript
async function loadPlugins(): Promise<Plugin[]> {
  const pluginDir = join(getConfigDir(), "plugins");
  const entries = await readdir(pluginDir);

  const plugins = await Promise.all(
    entries.map(async (name) => {
      const manifestPath = join(pluginDir, name, "tag-cli-plugin.json");
      const manifest = await readJson(manifestPath);
      const module = await import(join(pluginDir, name, manifest.main));
      return { manifest, module };
    })
  );

  return plugins;
}
```

**SDK Package Structure**:
```
@tag-cli/sdk/
├── src/
│   ├── types.ts        # Plugin interfaces
│   ├── hooks.ts        # Hook utilities
│   ├── commands.ts     # Command builder
│   ├── providers.ts    # Tag provider base
│   └── testing.ts      # Test utilities
└── package.json
```

**Example Community Plugins**:
- `tag-cli-plugin-github` - GitHub Topics sync
- `tag-cli-plugin-notion` - Notion database linking
- `tag-cli-plugin-linear` - Linear project tracking
- `tag-cli-plugin-slack` - Slack notifications
- `tag-cli-plugin-raycast` - Raycast integration
- `tag-cli-plugin-ai` - AI-powered tag suggestions

This initiative transforms Tag-CLI from a tool into a platform.
