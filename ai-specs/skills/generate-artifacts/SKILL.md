# Skill: generate-artifacts

Generate all three spec artifacts from an enriched story. Run after /enrich-brief.

## When to invoke

User says: "generate artifacts", "create specs", "/generate-artifacts", or after enriched story is confirmed.

## Before starting

Read `.sdd-de/project.yaml` to determine:
- `design_source` — `figma` | `library` | `github` | `zip` | `stitch` | `claude-design` | `enterprise`

> **Consume sources.** `library` and `enterprise` are the same family: the components ALREADY exist
> and are referenced, never recreated; customization is an overlay rather than a fork; and
> `token_file` points at the real token source rather than a file this toolkit writes. Wherever this
> skill says Branch B, it applies to both. `claude-design` is an EXTRACT source and behaves like
> Figma: the design is read, then components are generated.

- `framework`, `language`, `styling` — for framework-appropriate spec content
- `token_file` — for token references in specs

## Prerequisites

- `specs/[feature-name]/enriched-story.md` must exist and be confirmed
- Design tokens must be defined in `token_file` (add missing ones before speccing)
- For Figma flow: Figma Variables must exist in the `figma_token_collection`

---

## Steps

1. **Read** `.sdd-de/project.yaml`
2. **Read** `specs/[feature-name]/enriched-story.md`

3. **Run the design-source preflight** for the active flow — **before branching.**
   Every flow has a gate that can stop the run (see the flow sections below):

   | `design_source` | Preflight gate |
   |---|---|
   | `figma` | Resolve the component's Figma node. Unresolvable → record it as **unreferenced** and stop |
   | `library` | `.sdd-de/components.json` must hold the library entry. Missing → stop, point at `/provision-library` |
   | `github` / `zip` | The source component file must be readable. Missing → stop, name the path |
   | `stitch` | The screen + token mapping table must exist in `enriched-story.md`. Missing → stop |
   | `claude-design` | The design MCP must resolve the project. Unresolvable → stop, say so |
   | `enterprise` | `.sdd-de/components.json` must hold the consumed component's pointer entry. Missing → stop, point at `/extract-design-system` |

   If a gate stops the run, **do not create the branch** — the user stays on their current
   branch with nothing to clean up. Branching first would leave an empty orphan branch.

4. **Create the feature branch** (see [Branch creation](#branch-creation) below) —
   only once the preflight passes, and **before** writing any spec file, so the specs
   land on the branch and never on `main`.

5. **Generate Component Spec** using `docs/component-spec-template.md`:
   - Fill every section from the enriched story
   - List design tokens using the project's variable format (CSS `var(--token)` or SCSS `$token`)
   - **Fill the metadata-feeding sections** — `Common Patterns`, `Anti-Patterns`, and `AI Usage Hints`.
     Step 3b turns these into the component's metadata record. See `docs/component-metadata-model.md`.

3b. **Write the metadata record** — `.vortspec/metadata/[component].json` (MANDATORY)

   This step used to be a sentence saying the spec sections "become the component's metadata".
   Nothing performed that becoming, so projects ended up with complete specs and an EMPTY
   `.vortspec/metadata/` — the docs page had nothing to render and grounded runs had no record to
   read. The information existed only as prose in a spec nobody parses.

   **Use the `ai-component-metadata` skill** for the three analysis-derived sections
   (`usage.commonPatterns`, `usage.antiPatterns`, `aiHints`). Everything else is a TRANSFORM of what
   you just wrote in the specs — carry it across rather than re-deriving it, which is both cheaper
   and more accurate than a second analysis of the same component.

   **Schema bridge — the skill's output is NOT the record shape.** `ai-component-metadata` emits
   `component: { … }` with a PLURAL category (`atoms`/`molecules`/`organisms`). The record uses
   `identity: { … }` with a SINGULAR one (`atom`/`molecule`/`organism`/`template`). Map and
   singularise before writing, or the record will not parse and the docs page stays empty.

   | Record field | Source |
   |---|---|
   | `identity` | Component Spec §1 Purpose + the roster entry (name, category, importPath) |
   | `props` | Component Spec's variant-axes → props table |
   | `designTokens` | Component Spec's token sections, with values RESOLVED from the token file |
   | `states` | Interaction Spec's state transitions |
   | `accessibility` | Component Spec's Accessibility section |
   | `commonPatterns` | Component Spec §Common Patterns (`code` must be runnable JSX) |
   | `antiPatterns` | Component Spec §Anti-Patterns — every entry needs `instead`, not just a warning |
   | `aiHints` | Component Spec §AI Usage Hints |

   Rules that decide whether the record is worth its tokens:

   - `antiPatterns` MUST carry an alternative. A bare "do not do X" leaves the model to invent the Y,
     and the alternative is the only field that changes generated code.
   - `aiHints.selectionCriteria` says what makes THIS component the right choice over its siblings —
     not what it does. A composer reads it first.
   - `props[].description` and `variants[].purpose` explain WHY to pick a value. The enum values are
     already in the source; the reasoning is the only thing the record adds.
   - Omit a section you have nothing real for. An empty section is honest; a padded one costs tokens
     on every run and tells the model nothing.
   - Write ONLY the JSON record. Do NOT create a `[ComponentName].metadata.ts` in the component
     directory — the record is VortSpec-owned and must exist whether or not Storybook is installed.
   - Apply design-source-specific header (see branches below)
   - Save to `specs/[feature-name]/[component]-component-spec.md`

6. **Generate Interaction Spec** using `docs/interaction-spec-template.md`:
   - Cover every state transition and animation from the enriched story
   - Apply design-source-specific notes (see branches below)
   - Save to `specs/[feature-name]/[component]-interaction-spec.md`

7. **Generate Page/Feature Spec** using `docs/page-spec-template.md`:
   - Cover layout, breakpoints, component composition, data flow
   - Reference framework-agnostic patterns from `docs/page-standards.md`
   - Fill the **Preview / Deep Link** section: every screen must be preview-addressable (reachable by URL). Router screens use their route; state-navigated screens deep-link via `?screen=<Name>` and are registered in `.vortspec/screen-preview.json` (see `docs/page-standards.md` → Preview-Addressable Screens, and `docs/framework-config.md` for the per-framework snippet)
   - Apply design-source-specific notes (see branches below)
   - Save to `specs/[feature-name]/[page]-page-spec.md`

8. **Announce** (see per-flow announcement below)

---

## Branch creation

The skill creates the branch itself. The user never runs `git checkout -b` by hand.

**Name**: `feature/[feature-name]-spec` — the same `[feature-name]` used for the
`specs/[feature-name]/` directory, lowercased and hyphenated
(e.g. `feature/button-spec`, `feature/checkout-flow-spec`).

**Procedure** — run after the preflight passes, before writing any spec file:

1. Confirm the project is a git repository (`git rev-parse --git-dir`).
   If it is not, skip branch creation entirely, generate the specs, and say so in the
   announcement: `⚠ Not a git repository — no branch created.`
2. Read the current branch (`git rev-parse --abbrev-ref HEAD`) and apply the matching case:

| Current state | Action |
|---|---|
| On `main` / `master` / any non-feature branch | `git checkout -b feature/[feature-name]-spec` |
| Already on `feature/[feature-name]-spec` | Reuse it — do not branch again |
| On a *different* `feature/*` branch | **Stop and ask.** Do not branch off unrelated in-progress work. Offer: branch from here, or switch to `main` first |
| `feature/[feature-name]-spec` already exists | `git checkout feature/[feature-name]-spec` — reuse, never force-create |

3. If the working tree has uncommitted changes, **do not stash and do not commit them**.
   `git checkout -b` carries them onto the new branch, which is the desired behavior.
   If the checkout fails because of a conflict, stop and report it — never use `--force`.

**Never** commit, push, or open a PR here. Committing the specs is `/commit`'s job at step 7
of the cycle.

---

## Branch A — Figma Flow  (design_source: figma | claude-design)

**`claude-design` uses the same flow with a different reader.** Screens and tokens come from the
design MCP rather than the Figma MCP; everything after the read — token extraction, spec shape,
component generation — is identical. Where a step below says "Figma MCP", use the design MCP for a
`claude-design` project. If that MCP is not connected, STOP and say so: an invented structure is
worse than an unconfigured project, because it looks finished.

### Resolve the component's Figma node FIRST (autonomously — never ask for a link)

Before writing the spec, resolve the component's authoritative reference: **its own Figma node**
(the component set). Resolve it in order — (1) the entry's **`figmaNodeId`/`componentKey`** in
`.sdd-de/components.json`, read via the Figma MCP; (2) if missing, **`search_design_system`** scoped
to THIS file's own library (from `figma_file_url`) to resolve it by name — it is **NOT capped** like
the page listing; (3) the **Desktop Bridge** (`figma.root.children`) if connected. **Do NOT rely on
the remote page listing — it caps at 3 pages**, so a component 4th+ would look "missing" and get
built blind.
Read the node's frames/variants and view its screenshot, and generate the spec to **reproduce that
referenced design** — its structure, parts,
and variants. Design tokens supply **values only** (color/spacing/radius/typography) — use the
component's own semantic tokens (`--component-<name>-*`) where defined; never hardcode a hex/rgba.
Do **not** infer the component's shape from its name, and do **not** copy a different existing
component (an alert is not a restyled button). If the node truly can't be resolved by any method,
do not fabricate from the name — record the component as **unreferenced** and stop
(it needs a Figma page / a reachable MCP), so it is never mistaken for a design-matched component.

### Component Spec header additions
```
Design source:  Figma
Figma file:     [figma_file_url]
Reference page: [page named after the component] ([figmaPageId])
Frame URL:      [specific variant frame URL, if any]
Token collection: [figma_token_collection]
```

### Interaction Spec notes
- State transitions must reference Figma prototype flows where defined
- Note which interactions are driven by Figma component properties (e.g. boolean toggles, variant switches)

### Page Spec notes
- Reference Figma frame for each responsive breakpoint (375 / 768 / 1440)
- Include Figma layout grid details extracted during enrich-brief

### Announce
```
──────────────────────────────────────────────
 ✓ Branch feature/[feature-name]-spec created
 ✓ 3 spec artifacts generated
   specs/[feature-name]/[component]-component-spec.md
   specs/[feature-name]/[component]-interaction-spec.md
   specs/[feature-name]/[page]-page-spec.md
   Design source: Figma → [frame URL]
──────────────────────────────────────────────
 What happens next
──────────────────────────────────────────────

 Next step → Implement

 Open the Component Spec and work through each task
 one at a time, marking [ ] → [x] as you complete them.
 Do not move to the next task until the current one is done.
 When all tasks are checked, run: /visual-verify
──────────────────────────────────────────────
```

---

## Branch B — Component Library Flow  (design_source: library | enterprise)

Use this branch for both CONSUME sources. The spec describes how an EXISTING component is used and
customized — it never specifies a component to build. Three consequences for the artifacts:

- The Component Spec names the consumed component and its import path, and its task list contains no
  "implement the component" task. There is nothing to implement; there is something to configure.
- Every visual difference is expressed against the library's own theming surface (an overlay), not
  as a restyle of the component's internals. The library's source is never edited — the next install
  would overwrite the edit, and until then it is an invisible fork.
- `token_file` is a POINTER for these sources. Specs reference the real tokens; they never propose
  writing to that path.

> **Adapt, don't rebuild.** The library's real components are already in `component_dir`
> (provisioned by `/provision-library`, inventoried in `.sdd-de/components.json`). A library
> component spec describes the **customization of a named, provisioned base component** — the
> props, tokens, and overrides to apply — NOT a from-scratch reconstruction. If `components.json`
> has no library entry, stop and point the user at `/provision-library`; do not spec a rebuild.

### Component Spec header additions
```
Design source:  Component Library
Library:        [component_library] ([component_library_kind])
Base component: [provisioned component name + its file path from components.json]
Customization:  [only the props/variants/tokens/overrides to apply]
```

Scope the spec's **task list to customization**: apply token bindings, add project-specific
props/variants, compose/re-export — never tasks that reimplement behavior the base already ships.
For `package` libraries the "component" is the token-mapped wrapper around the library import;
for `copy-source` libraries it's the owned source file the CLI wrote.

### Interaction Spec notes
- Note which interactions are handled natively by the library vs. must be implemented custom
- Document any library events/callbacks that must be wired (e.g. `onChange`, `onOpenChange`)

### Page Spec notes
- Note which layout primitives (Grid, Stack, Container) come from the library vs. are custom
- Reference library documentation for composition patterns

### Announce
```
──────────────────────────────────────────────
 ✓ Branch feature/[feature-name]-spec created
 ✓ 3 spec artifacts generated
   specs/[feature-name]/[component]-component-spec.md
   specs/[feature-name]/[component]-interaction-spec.md
   specs/[feature-name]/[page]-page-spec.md
   Design source: Library → [library name]
──────────────────────────────────────────────
 What happens next
──────────────────────────────────────────────

 Next step → Implement

 Open the Component Spec and work through each task
 one at a time, marking [ ] → [x] as you complete them.
 Do not move to the next task until the current one is done.
 When all tasks are checked, run: /visual-verify
──────────────────────────────────────────────
```

---

## Branch C — GitHub Repository Flow  (design_source: github)

### Component Spec header additions
```
Design source:     GitHub Repository
Repo:              [github_repo_url]
Branch:            [github_branch]
Source component:  [github_component_dir]/[component-file]
Available props/variants: [extracted from enriched story]
```

### Interaction Spec notes
- Note which interactions are defined in the source component and must be preserved
- Document any events/callbacks from the source component's API that must be wired
- Flag any source behaviors that conflict with the project's interaction patterns

### Page Spec notes
- Note which layout patterns come from the source repo vs. are project-specific
- Reference the source repo's documentation or README if available

### Announce
```
──────────────────────────────────────────────
 ✓ Branch feature/[feature-name]-spec created
 ✓ 3 spec artifacts generated
   specs/[feature-name]/[component]-component-spec.md
   specs/[feature-name]/[component]-interaction-spec.md
   specs/[feature-name]/[page]-page-spec.md
   Design source: GitHub → [github_repo_url] ([github_branch]/[github_component_dir])
──────────────────────────────────────────────
 What happens next
──────────────────────────────────────────────

 Next step → Implement

 Open the Component Spec and work through each task
 one at a time, marking [ ] → [x] as you complete them.
 Do not move to the next task until the current one is done.
 When all tasks are checked, run: /visual-verify
──────────────────────────────────────────────
```

---

## Branch D — ZIP File Flow  (design_source: zip)

Same process as Branch C. The ZIP source is treated identically to a GitHub repo source.

### Component Spec header additions
```
Design source:     ZIP Archive
Archive:           [zip_file_path]
Source component:  [zip_component_dir]/[component-file]
Available props/variants: [extracted from enriched story]
```

### Interaction Spec notes
- Same as Branch C — preserve all interactions defined in the source component

### Page Spec notes
- Same as Branch C

### Announce
```
──────────────────────────────────────────────
 ✓ Branch feature/[feature-name]-spec created
 ✓ 3 spec artifacts generated
   specs/[feature-name]/[component]-component-spec.md
   specs/[feature-name]/[component]-interaction-spec.md
   specs/[feature-name]/[page]-page-spec.md
   Design source: ZIP → [zip_file_path] ([zip_component_dir])
──────────────────────────────────────────────
 What happens next
──────────────────────────────────────────────

 Next step → Implement

 Open the Component Spec and work through each task
 one at a time, marking [ ] → [x] as you complete them.
 Do not move to the next task until the current one is done.
 When all tasks are checked, run: /visual-verify
──────────────────────────────────────────────
```

---

## Branch E — Google Stitch Flow  (design_source: stitch)

### Component Spec header additions
```
Design source:    Google Stitch
Connection:       [mcp | zip]
Screen:           [screen name from enriched story]
Design system:    [stitch_zip_path or "via MCP"]
Token mapping:    [reference to token mapping table in enriched-story.md]
```

Include the complete Stitch → project token mapping table from `enriched-story.md` in the
Design Tokens section of the Component Spec. This is the primary spec artifact for the
Stitch flow — the token table IS the design handoff.

### Interaction Spec notes
- Use `fetch_screen_code` output (MCP) or the HTML in `design.md` (ZIP) as the baseline
  for interaction structure
- Note which interactions are defined in the Stitch-generated HTML vs. must be added custom
- Document state transitions not represented in the Stitch screen (e.g. error, loading states)

### Page Spec notes
- Reference `screen.png` (or MCP screenshot) for layout at each breakpoint
- Map every spacing, typography, and color value in the Stitch layout to project token variables
- Note any layout patterns from the Stitch-generated HTML that must be adapted to the project's framework

### Announce
```
──────────────────────────────────────────────
 ✓ Branch feature/[feature-name]-spec created
 ✓ 3 spec artifacts generated
   specs/[feature-name]/[component]-component-spec.md
   specs/[feature-name]/[component]-interaction-spec.md
   specs/[feature-name]/[page]-page-spec.md
   Design source: Google Stitch ([mcp | zip export])
   Token mapping table included in Component Spec.
──────────────────────────────────────────────
 What happens next
──────────────────────────────────────────────

 Next step → Implement

 Open the Component Spec and work through each task
 one at a time, marking [ ] → [x] as you complete them.
 Do not move to the next task until the current one is done.
 When all tasks are checked, run: /visual-verify
──────────────────────────────────────────────
```

---

## Output structure

```
specs/
└── [feature-name]/
    ├── enriched-story.md
    ├── [component]-component-spec.md
    ├── [component]-interaction-spec.md
    └── [page]-page-spec.md

.vortspec/metadata/
└── [component].json          # ← step 3b; the docs page and every grounded run read THIS
```

## Done means

Not done until every box is true. The metadata record is listed because it is the one that was
silently skipped for as long as it was only described in prose.

- [ ] Component Spec, Interaction Spec and Page Spec written for every component in scope
- [ ] `.vortspec/metadata/[component].json` EXISTS for every component, and is not a stub
- [ ] Each record uses `identity` with a SINGULAR category — not the skill's `component` + plural
- [ ] Every `antiPatterns` entry carries an `instead`
- [ ] `designTokens` values are RESOLVED (the real hex/rem), not token names alone
- [ ] No `[ComponentName].metadata.ts` was written into the component directory

If a record could not be written, say which component and why. A spec without its record is a
component the docs page cannot describe and a generator cannot use correctly — report it rather
than leaving the gap to be discovered in Storybook.
