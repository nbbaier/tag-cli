# Enhanced CLI Experience

**Category:** DX Improvement
**Quarter:** Q1-Q2
**T-shirt Size:** M

## Why This Matters

The command line is where developers live. A CLI that feels clunky, requires memorizing exact command syntax, or provides poor feedback creates friction that discourages adoption. Tag-CLI's core functionality is solid, but the developer experience has room to be delightful.

Shell completions alone can transform usability—instead of typing `tag dir search --tags fro<tab>` and nothing happening, imagine `frontend` auto-completing. Add fuzzy search, an interactive mode for exploration, and richer output formatting, and Tag-CLI becomes a joy to use rather than just a utility.

## Current State

**No Shell Completions**
- Users must memorize all commands, flags, and tag names
- No `<tab>` completion for tags, directories, or subcommands
- tRPC-CLI doesn't generate completions automatically

**Basic Output Formatting**
- Uses `chalk` for colors and `cli-table` for tables
- No JSON output mode for scripting
- Limited output customization options
- Error messages are functional but not helpful

**No Interactive Mode**
- Must know exact command before running
- No REPL for exploration
- No interactive selection of tags or directories
- Dependencies (`ink`, `react`, `@inkjs/ui`) are installed but unused

**Limited Search**
- No fuzzy matching on tag names
- No partial path matching for directories
- Case-sensitive matching only

## Proposed Future State

A CLI that feels like a productivity multiplier:

**Shell Completions**: Type `tag dir add --tags <tab>` and see all available tags. Type `tag dir search --tags back<tab>` and get `backend` completed. Works in Bash, Zsh, Fish, and PowerShell.

**Interactive Mode**: Run `tag` with no arguments to enter an interactive TUI. Browse directories, apply tags with arrow keys, search with fuzzy matching, preview results in real-time.

**Rich Output**:
- `--json` flag on all commands for scripting
- `--quiet` for minimal output
- Colored, contextual error messages with suggested fixes
- Relative time display ("added 2 days ago") for timestamps

**Smart Search**:
- Fuzzy matching: `frnt` matches `frontend`
- Partial path matching: `proj` matches `/home/user/projects/myapp`
- Case-insensitive by default with `--case-sensitive` flag

## Key Deliverables

- [ ] Generate shell completion scripts for Bash, Zsh, Fish
- [ ] Add `tag completions <shell>` command to output completion scripts
- [ ] Add `--json` output flag to all list/search commands
- [ ] Add `--quiet` flag for minimal output mode
- [ ] Implement fuzzy tag matching using algorithm like Levenshtein or fzf-style
- [ ] Add partial path matching for directory search
- [ ] Create interactive mode using Ink/React (dependencies already installed)
- [ ] Add interactive tag selection with checkboxes for `retag` command
- [ ] Improve error messages with actionable suggestions
- [ ] Add `--case-sensitive` / `-S` flag for search operations
- [ ] Add relative time display for list output ("2 hours ago")
- [ ] Add man page generation from tRPC metadata
- [ ] Create installation script that auto-installs completions

## Prerequisites

- **01-technical-debt-cleanup**: Clean foundation before adding features
- **02-test-infrastructure-cicd**: Tests for new interactive features

## Risks & Open Questions

- **tRPC-CLI completion support**: tRPC-CLI may not have built-in completion generation. May need to implement custom completion scripts or contribute upstream.
- **Interactive mode complexity**: Ink/React adds complexity. Need to determine scope—simple TUI vs. full-featured interface. Start minimal.
- **Shell compatibility**: Completion scripts differ significantly between shells. Testing across Bash/Zsh/Fish variants is time-consuming.
- **Fuzzy matching algorithm**: Need to choose between simple substring matching, Levenshtein distance, or full fzf-style fuzzy matching. Performance considerations for large tag sets.

## Notes

**Shell Completion Implementation**:
- Bash: Source script in `.bashrc`
- Zsh: Add to `fpath` and `compinit`
- Fish: Copy to `~/.config/fish/completions/`

**Interactive Mode Vision**:
```
$ tag
┌─────────────────────────────────────────┐
│  Tag CLI - Interactive Mode             │
├─────────────────────────────────────────┤
│  > Search: react                        │
│                                         │
│  Directories matching "react":          │
│  ✓ ~/projects/my-react-app [frontend]   │
│  ✓ ~/work/dashboard [frontend, react]   │
│    ~/legacy/old-app [react]             │
│                                         │
│  [Space] Toggle  [Enter] Open  [q] Quit │
└─────────────────────────────────────────┘
```

The Ink/React dependencies are already in `package.json` but unused. This initiative finally leverages them.

Reference files:
- `src/utils/format.ts` - Current output formatting
- `src/utils/time.ts` - Time utilities (may need relative time)
- `package.json:31-41` - Ink/React already installed
