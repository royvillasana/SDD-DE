# Skill: sync-agent-symlinks

Keep `.claude/skills/`, `.cursor/skills/`, `.claude/agents/`, and `.cursor/agents/` in sync with the canonical `ai-specs/` directory.

## When to invoke

User says: "sync symlinks", "fix symlinks", "broken skill", "/sync-agent-symlinks", or after adding, renaming, or removing a skill or agent.

## Purpose

The canonical source of skills is `ai-specs/skills/`. Editor-specific paths (`.claude/skills/`, `.cursor/skills/`) reference skills via symlinks. A missing or broken symlink means the skill is silently unavailable. This skill audits and repairs symlink integrity across all supported editors.

---

## Steps

### Step 1 — Discover Canonical Sources

List all directories (skills/agents) in:
- `ai-specs/skills/` → canonical skills
- `ai-specs/agents/` → canonical agents

### Step 2 — Audit Each Editor Directory

For each of `.claude/skills/`, `.cursor/skills/`, `.claude/agents/`, `.cursor/agents/`:

Classify every entry:

| Status | Definition | Action |
|---|---|---|
| **Linked** | Symlink exists and target resolves | No action needed |
| **Broken** | Symlink exists but target is missing or deleted | Remove and recreate pointing to canonical source |
| **Orphan** | Real directory (not a symlink) — was not created by this tool | Warn user; do NOT auto-delete |
| **Missing** | Skill/agent exists in `ai-specs/` but no symlink in editor dir | Create symlink |
| **External** | Symlink target is outside `ai-specs/` | Warn user; flag for manual review |

### Step 3 — Apply Fixes

Safe operations (always safe to run):
- Create missing symlinks using relative paths
- Remove broken symlinks (the dangling pointer only — not the target)
- Recreate broken symlinks pointing to canonical source

Never do:
- Delete real directories (orphans)
- Create `.cursor/` if it does not exist — only add symlinks if `.cursor/` is already present
- Use absolute paths in symlinks (symlinks must be relative for portability)

Symlink path pattern:
```bash
# From .claude/skills/[skill-name] → ../../ai-specs/skills/[skill-name]
ln -s ../../ai-specs/skills/[skill-name] .claude/skills/[skill-name]
```

### Step 4 — Report

Print a summary table:

```
Symlink sync complete.
  .claude/skills/   → N linked, N broken (fixed), N missing (created), N orphans (warned)
  .cursor/skills/   → N linked, N broken (fixed), N missing (created), N orphans (warned)
  .claude/agents/   → N linked, N broken (fixed), N missing (created), N orphans (warned)
  .cursor/agents/   → N linked, N broken (fixed), N missing (created), N orphans (warned)
```

---

## Notes

- This skill is idempotent — safe to run multiple times
- Run after any `npx sdd-de` update that adds or removes skills
- Run whenever a new skill or agent is added to `ai-specs/` manually
- Symlinks must use relative paths so the repo works on any machine
