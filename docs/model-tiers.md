# Model tiers: which step runs where

The steps that follow a settled spec (`/implement-spec`, `/visual-verify`, `/adversarial-review`, `/commit`) run in their own subagents,
each fixed to its own model and effort (agent files in `ai-specs/agents/px-*.md`, wired from the skill front matter with
`context: fork` + `agent:`). The steps that need a dialogue with you (`/setup`, `/enrich-brief`, `/generate-artifacts`, `/sync-tokens`)
stay in the main session, on whatever model and effort it is set to.

| Step | Where it runs | Model | Effort |
|---|---|---|---|
| `/setup`, `/enrich-brief`, `/generate-artifacts`, `/sync-tokens` | Main session | session's model | session's setting |
| `/implement-spec` (once per task, or fix) | `px-screen-builder` | Sonnet | Low |
| `/visual-verify` | `px-visual-checker` | Sonnet | Low |
| `/adversarial-review` | `px-reviewer` | Opus | Low |
| `/commit` | `px-committer` | Haiku | Low |

Why these four: they read files and write code, one report or one commit, never ask you anything, and return a short summary. Opus is
kept for the review, where the judgement is. `/implement-spec` does one spec task per call, as the cycle requires (never the whole
spec in one shot), and cannot see the screen: the dev-server inspection after each task stays with you.

`/implement-spec` and its agent come from the PX-SDD-DE Storybook screen workflow, where the builder worked from self-contained Task
Packets. Here it works from the spec files and `.sdd-de/docs/` directly, which has **not been measured**: the effort figures below are
from the PX workflow. Not ported: the spec-writer agent (`/generate-artifacts` asks you questions, and a forked agent cannot), Task
Packets, `screen check`, `screen drift`, `lint-packets` and the cost report, which depend on a deployed-Storybook catalog this toolkit
does not have.

## Why `low` effort
Opus never runs at `high` here. The effort matrix was measured on the PX-SDD-DE screen workflow (one screen, headless, one run each
unless noted), not on this toolkit's cycle, so treat it as indicative: Opus and Sonnet at `low` cost $1.92–2.72 over three runs
(mean $2.23); Opus `medium` everywhere cost $3.77; one Opus-`medium` session cost $3.51. Opus output tokens are about 85% of every
run's cost, and `low` roughly halves them. Sonnet effort moved the cost by cents. Haiku as a builder was nearly free but produced a
weaker review and skipped its report, so Haiku stays on `/commit`. Raise an agent's effort in its file only if its output shows it is needed.

## How it works
- A forked skill runs in a fresh context: no conversation history, no way to ask the user. Each forked skill therefore reads only files (`specs/<feature>/…`, `.sdd-de/`) and returns `BLOCKED: <what is needed>` instead of asking. Pass the feature or component name as the argument: `/adversarial-review <name>`.
- Only the agent's short summary returns to the main session; the verbose work stays in the subagent.
- `background: false` makes the main session wait for each agent.
- Each model has its own prompt cache, and a subagent's first request is uncached. Tiering by forking avoids a cache miss in the main session, but very small tasks can cost more forked than inline.
- Claude Code is the only tool where a skill binds itself to an agent (`context: fork` + `agent:`). Everywhere else the
  binding goes through `AGENTS.md`: the `CLAUDE.md` / `AGENTS.md` / `GEMINI.md` / `codex.md` routing line names the agent for each step, and each forked skill carries a
  **Delegation** paragraph (hand the step to the named subagent if the tool has subagents, otherwise run it inline; if
  you already are that subagent, just do it).

## Other tools
The agent specs in `ai-specs/agents/px-*.md` are tool-neutral: `tier` (`frontier` | `balanced` | `fast`), `effort`
(`low` | `medium` | `high`), neutral `tools` (`read`, `write`, `shell`, `search`), `maxTurns`. `npx @royvillasana/sdd-de`,
`... update` and `sdd-de agents sync` render them into each tool's own format. Tools are auto-detected from their
folder (Claude is always included); override with `agents.tools` in `.sdd-de/project.yaml`.

| Tool | Rendered to | Model | Effort | Tool restriction |
|---|---|---|---|---|
| Claude Code | `.claude/agents/<name>.md` | `model` (default `opus`/`sonnet`/`haiku` by tier) | `effort` | `tools` |
| Cursor | `.cursor/agents/<name>.md` | `model`, effort as `id[effort=high]` | in the model string | not documented (inherits) |
| Codex CLI | `.codex/agents/<name>.toml` | `model` | `model_reasoning_effort` | not set (inherits) |
| Gemini CLI | `.gemini/agents/<name>.md` | `model` (`inherit`) | not documented | not set (inherits all) |
| GitHub Copilot | `.github/agents/<name>.agent.md` | `model` | not set | not set |
| opencode | `.opencode/agents/<name>.md` (`mode: subagent`) | `provider/model#variant` | the `#variant` | default permissions |
| Windsurf / Devin | `.devin/agents/<name>.md` (experimental) | `model` | not documented | not set |

Rules the renderer follows:
- **Models are never guessed.** Only Claude's names are filled in by default. For any other tool a tier with no
  `agents.models.<tool>.<tier>` is left unpinned, so that agent runs on the tool's default model (Cursor and Gemini
  write `inherit`). Pin them in `project.yaml`:
  ```yaml
  agents:
    models:
      codex: { frontier: <id>, balanced: <id>, fast: <id> }
      cursor: { frontier: <id>, balanced: <id>, fast: <id> }
  ```
  `sdd-de agents status` shows what is pinned. Until a tier is pinned in another tool, the saving does not apply there.
- **Tool restrictions** are applied only where the tool documents a matching field (Claude). Elsewhere the agent
  inherits all tools and relies on its instructions (the committer is told never to stage outside its list).
- Generated files carry a `generated by sdd-de` marker. A file without it (one you wrote) is never overwritten, and
  stale generated `px-*` files are removed. The persona agents in `ai-specs/agents/` (design-engineer, …) are not step agents and are left alone.
- Tool names, fields and paths were taken from each tool's current documentation (Nov 2026); formats for Devin
  subagents are marked experimental there. Re-check when a tool changes.
- A skill-to-agent binding exists in no other tool's documentation. opencode (command `agent:` + `subagent: true`) and
  Copilot (prompt file `agent:`) have the nearest mechanisms; not generated yet.
- `model` and `effort` in SKILL.md/agent front matter are Claude Code features; other tools ignore unknown keys, and
  claude.ai skill upload rejects them.
