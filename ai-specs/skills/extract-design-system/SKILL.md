# Skill: extract-design-system

Extract the **complete** token set and component inventory from the design source into
`token_file` and `.sdd-de/components.json`, **once**, before the 7-step cycle begins.

## When to invoke

- User says: "extract design system", "pull tokens", "inventory components", "/extract-design-system"
- Right after `/setup` completes for a **Figma** project, before `/enrich-brief`
- `.sdd-de/components.json` does not exist, or the Figma file changed and you need a fresh inventory

This skill exists because agents that improvise Figma extraction burn thousands of tokens
rediscovering which MCP tool works, and still under-extract. This codifies the verified,
minimal path so a full extraction costs a handful of calls, not dozens.

## Before starting

Read `.sdd-de/project.yaml`:
- `design_source` — this skill's bulk path is for `figma`. For `library`/`github`/`zip`/`stitch`,
  the source files ARE the inventory: read the component directory directly, skip to
  "Write components.json".
- `figma_file_url`, `token_file`, `component_dir`.

Then read project memory (`memory/figma-token-extraction-method.md` if present). If it records a
working extraction path for this file, **use it and skip the capability probe entirely.**

---

## The two non-negotiable efficiency rules

1. **Probe capability ONCE, in priority order, stop at the first success, record the winner.**
   Do not discover-by-failure across every tool. One transport wins; use only it.
2. **Never call a known-dead path.** These waste tokens and never succeed headlessly:
   - `get_variable_defs` (official Figma MCP) — requires a *live desktop selection*. Unusable non-interactively.
   - `search_design_system` — returns variables from *external* libraries (Radix/MSIP/Obra), not this file's locals. Noise.
   - Variables REST (`figma_get_file_data`, raw REST) — Enterprise-token only; skip unless a token is present.
   - Re-fetching the page list after it caps at 3 — it will cap again. Fetch once.

3. **A heavy call timing out ≠ the bridge is down.** This is the exact bug that wrecked the first
   run: `figma_get_design_system_kit` defaults to `format:"full"` across **every** component — on a
   large file (thousands of components) that one call overflows or times out. The agent then
   concluded "Desktop Bridge unavailable" and abandoned it for slow per-node sampling. **Do not.**
   If any extraction call times out, re-probe with `figma_diagnose` (cheap). If it still reports
   connected, the call was simply too heavy — retry it `compact`/`summary` or scoped, or use the
   light calls in Step 2A. Only fall to Path B when `figma_diagnose` itself reports disconnected.

---

## Step 1 — Capability probe (one pass)

Call in this order. **Stop at the first that succeeds.**

### Path A — Desktop Bridge bulk (PREFERRED — works on any Figma plan, complete, ~compact)

Probe: `figma_diagnose` (figma-console MCP).
- Connected → **verify the OPEN file first.** The Desktop Bridge reads whatever file is currently open
  in Figma Desktop — which may NOT be the file configured in `project.yaml`. Compare the open file's key
  (from `figma.root` / the file url) to the `<FILE_KEY>` in the configured `figma_file_url`. If they
  MATCH → use Path A (Step 2A). If a DIFFERENT file is open → do NOT extract from it (that silently reads
  the wrong design system); either fall to Path B (remote MCP reads the configured file by key) or tell
  the user, in one sentence, to open the configured file in Figma Desktop and re-probe. Record the actual
  key you read; it MUST equal `<FILE_KEY>`.
- Not connected → tell the user, in one plain sentence, how to enable it, then re-probe:

  > The Desktop Bridge gives a complete token + component dump in two calls instead of
  > dozens of samples. To enable it: open the Figma **desktop app**, open your file, then run
  > the **"Figma Console MCP – Desktop Bridge"** plugin (Plugins → Development, or search
  > "Desktop Bridge"). It listens on port 9223. Say "ready" and I'll re-probe.

  If the user declines or the plugin can't run, fall through to Path B.

### Path B — Official Figma `get_design_context` sampling (FALLBACK only)

Use only when the Bridge is unavailable. This resolves tokens per node as `var(--name, value)`
pairs but sees only the components you sample — so the inventory is a **union of sampled
components, not the whole file.** Go to Step 2B.

Record the winning path to `memory/figma-token-extraction-method.md` so the next run skips this probe.

---

## Step 2A — Bulk extraction via Desktop Bridge

> **Do NOT open with `figma_get_design_system_kit { format: "full" }`.** On a large file that
> single call overflows/times out — it is the trap that caused the original run to (wrongly) give
> up on the bridge. Use the light, targeted calls below. If you do want the combined kit, call it
> `format: "compact"` (names/types only) or scope it with `componentIds`.

**Tokens (one call, complete, resolved):**

1. `figma_get_variables { format: "summary" }` — see the real collections and counts. This is
   your ground truth for completeness (e.g. "95 variables across 6 collections"). Verified fast
   even on a 2,000+ component file; `figma_get_design_system_summary` is the component-side twin.
2. Write the token file directly with `figma_export_tokens`:
   - `{ format: "css-vars", resolveAliases: true, outputPath: <token_file> }` for CSS var projects
   - `{ format: "tailwind-v4", outputPath: <token_file> }` for Tailwind v4
   - `{ format: "scss", outputPath: <token_file> }` for SCSS
   Pick the format from `project.yaml → styling`. This replaces hand-writing `tokens.css`.
   If the styling has no matching formatter, use `figma_get_variables { format: "full",
   resolveAliases: true }` and write the file yourself, preserving Figma slash-paths in comments.

   **Tailwind (v3) — author a CURATED, SEMANTIC theme so components use idiomatic classes.** This is
   the single biggest driver of component fidelity. Do NOT dump every token as a raw arbitrary key —
   that forces ugly `bg-[var(--brand-primary-100)]` classes and leaves standard utilities (`p-4`,
   `rounded`, `shadow-md`, `border`) resolving to Tailwind's hardcoded defaults instead of your
   tokens. Instead, hand-author `tailwind.config.js` (`theme.extend`) that maps **idiomatic Tailwind
   scale names → your tokens**, so the component code reads like normal Tailwind and every value is a
   token. Model it on this shape (adapt the token names to what's actually in `tokens.css`):
   ```js
   theme: { extend: {
     colors: {
       white: 'var(--primitive-neutral-white)', black: 'var(--primitive-neutral-black)',
       primary: { DEFAULT: 'var(--theme-primary)', hover: 'var(--button-primary-background-hover)' },
       secondary: 'var(--theme-secondary)', success: 'var(--color-status-success)',
       danger: 'var(--color-status-danger)', warning: 'var(--color-status-warning)',
       info: 'var(--color-status-info)',
       neutral: { 100: 'var(--color-neutral-100)', 300: 'var(--color-neutral-300)', 600: 'var(--color-neutral-600)', 900: 'var(--color-neutral-900)', muted: 'var(--color-neutral-muted)' },
       text: { DEFAULT: 'var(--color-text-default)', muted: 'var(--color-text-muted)' },
       'brand-primary': { 100: 'var(--brand-primary-100)', /* …200–900 */ },
     },
     spacing: { 2: 'var(--spacing-8)', 3: 'var(--spacing-12)', 4: 'var(--spacing-16)', /* … */ },
     borderRadius: { sm: 'var(--radius-4)', DEFAULT: 'var(--radius-8)', md: 'var(--radius-8)', lg: 'var(--radius-6)' },
     boxShadow: { DEFAULT: 'var(--shadow-default)', md: 'var(--shadow-default)' },
     borderWidth: { DEFAULT: 'var(--stroke-width-1)', 1: 'var(--stroke-width-1)' },
     fontFamily: { base: 'var(--font-family-base)', sans: 'var(--font-family-base)', mono: 'var(--font-family-mono)' },
     fontSize: { body: ['var(--font-size-body)', { lineHeight: 'var(--line-height-body)' }], h1: ['var(--font-size-h1)', { lineHeight: 'var(--line-height-heading)' }] /* … */ },
     opacity: { disabled: 'var(--opacity-disabled)' },
   } }
   ```
   `content`: `['./src/**/*.{ts,tsx}', './.storybook/**/*.{ts,tsx}']`. Components then use CLEAN
   idiomatic classes — `bg-primary`, `text-danger`, `bg-success/20`, `border-1 border-neutral-300`,
   `rounded shadow-md p-3 gap-2`, `text-body`, `opacity-disabled` — NEVER raw `bg-[var(--…)]`.
   Also create (only what's missing — never overwrite a hand-authored config):
   - `postcss.config.cjs` — `{ plugins: { tailwindcss: {}, autoprefixer: {} } }`.
   - a `@tailwind base/components/utilities` entry stylesheet next to `tokens.css`.
   - ensure `postcss` and `autoprefixer` are installed.
   Components must use only config-backed token classes (no class that the bridge can't resolve).

**Component inventory (compact → targeted):**

3. `figma_get_design_system_summary` — categories + component/set counts (token-optimized, no details).
   This is the true `totals` (e.g. 216 component sets). Never trust a page listing for this.
4. For each category you intend to build (see Step 3 — Scope), `figma_search_components` to
   enumerate the sets and their variants. Do **not** dump every component's full detail — names,
   node IDs, variant axes, and category are enough for the inventory.

**Record the Figma reference on every `components.json` entry** — set `figmaNodeId` to the component
set's node id and `componentKey` to its durable library key (you already have both from
`figma_search_components`). This is REQUIRED: build and verify look it up to fetch the authoritative
design and validate against it without asking the user. Never leave a component without at least a
`figmaNodeId`.

Set `components.json → complete: true` — the Bridge sees the whole file.

---

## Step 2B — Sampling extraction (fallback, incomplete by construction)

1. Pull file metadata once to disk at the depth you need; enumerate **all** component pages
   (not just the first the config points at — the page listing caps at 3, so read the document
   tree / Cover sitemap to find the rest).
2. Fan out `get_design_context` across representative nodes of **every** component page via
   parallel subagents. Each subagent returns only the compact `var(--token, value)` pairs — never
   the full node payload — to keep the orchestrator lean.
3. Aggregate into the token file, converting slash-paths to the project's convention, preserving
   the Figma path in a comment.
4. Set `components.json → complete: false` and `log()` clearly: "Token set is the union of
   sampled components; connect the Desktop Bridge and re-run for a complete dump."

---

## Step 3 — Scope before you enumerate

A real design system can hold hundreds of component sets. Do **not** inventory or build all of
them blindly — that is the other big token sink. After Step 2's summary, show the category
counts and ask the user which to include:

```
──────────────────────────────────────────────
 Design system found — [N] component sets across [M] categories
──────────────────────────────────────────────
  buttons        1 set          layout-slots   29
  form-item      32 sets        navbar         2
  table          2 sets         tabs           2
  ...
Which do you want in scope for this build?
  • "all"            — inventory everything (heavier)
  • a category list  — e.g. "buttons, form-item, table"
  • "core atoms"     — Button, Input, Icon, Badge, Avatar, and the like
```

Only the in-scope categories get enumerated in Step 2A/4. Record scope in `components.json`.

---

## Step 4 — Write components.json

Write `.sdd-de/components.json`. Classify each set into an atomic level and order atoms →
molecules → organisms → templates (the order the 7-step cycle will follow).

```json
{
  "source": "figma",
  "fileKey": "<fileKey>",
  "extractionMethod": "desktop-bridge-bulk" | "design-context-sampling",
  "complete": true,
  "scope": ["buttons", "form-item"],
  "totals": { "componentSets": 216, "components": 2154 },
  "components": [
    {
      "name": "Button",
      "level": "atom",
      "figmaCategory": "components",
      "nodeId": "4:192632",
      "variants": { "size": ["sm","md","lg"], "type": ["primary","secondary","..."] },
      "status": "pending"
    }
  ]
}
```

`level`: `atom` | `molecule` | `organism` | `template`. `status`: `pending` | `in-progress` | `done`.

---

## Step 5 — Report honestly, then route

Report with **real counts** and the completeness flag:

```
🔵 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Design System Extracted — [Bulk via Desktop Bridge | Sampled fallback]

  Tokens     → [token_file]
             [N] variables · [M] collections · complete ✅ / partial ⚠️
  Inventory  → .sdd-de/components.json
             [X] sets in scope of [TOTAL] in file · [atoms]/[molecules]/[organisms]

  [if sampled] ⚠️ Inventory is a sampled subset. Connect the Desktop Bridge and
               re-run /extract-design-system for the complete [TOTAL]-set dump.
🔵 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Routing — one component first, then batch per tier (NOT stage-by-stage)

The 7-step cycle runs **once per component**. For an inventory of many components:

1. **Pilot the richest atom end-to-end** (usually Button — most variants/states). Run all 7 steps,
   commit. This *proves the token set is complete enough* before you build on it; if a token is
   missing, the pilot surfaces it while it's cheap to fix.
2. **Then fan out the rest per tier**, respecting atom → molecule → organism order. Run each
   remaining component's cycle in an **isolated subagent** (parallel within a tier); the heavy
   context — specs, Figma context, generated code — lives and dies inside the subagent, and only a
   compact pass/fail + diff summary returns to the orchestrator. Gate user approval at **tier
   boundaries** (all atoms approved before molecules), not once per component.
3. **Never batch stage-by-stage** ("enrich all, then implement all"): a bad foundational token
   propagates into every component before any gate catches it, and it forces the whole inventory
   into one context — the opposite of token-efficient. It also breaks the spec-first gates.

```
 Next step → pilot the first atom through the full cycle:
   /enrich-brief Button
```
