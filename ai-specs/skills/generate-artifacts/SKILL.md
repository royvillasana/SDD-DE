# Skill: generate-artifacts

Generate all three spec artifacts from an enriched story. Run after /enrich-brief.

## When to invoke

User says: "generate artifacts", "create specs", "/generate-artifacts", or after enriched story is confirmed.

## Before starting

Read `.sdd-de/project.yaml` to determine:
- `design_source` — `figma` | `library` | `github` | `zip` | `stitch`
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

3. **Generate Component Spec** using `docs/component-spec-template.md`:
   - Fill every section from the enriched story
   - List design tokens using the project's variable format (CSS `var(--token)` or SCSS `$token`)
   - Apply design-source-specific header (see branches below)
   - Save to `specs/[feature-name]/[component]-component-spec.md`

4. **Generate Interaction Spec** using `docs/interaction-spec-template.md`:
   - Cover every state transition and animation from the enriched story
   - Apply design-source-specific notes (see branches below)
   - Save to `specs/[feature-name]/[component]-interaction-spec.md`

5. **Generate Page/Feature Spec** using `docs/page-spec-template.md`:
   - Cover layout, breakpoints, component composition, data flow
   - Reference framework-agnostic patterns from `docs/page-standards.md`
   - Fill the **Preview / Deep Link** section: every screen must be preview-addressable (reachable by URL). Router screens use their route; state-navigated screens deep-link via `?screen=<Name>` and are registered in `.vortspec/screen-preview.json` (see `docs/page-standards.md` → Preview-Addressable Screens, and `docs/framework-config.md` for the per-framework snippet)
   - Apply design-source-specific notes (see branches below)
   - Save to `specs/[feature-name]/[page]-page-spec.md`

6. **Announce** (see per-branch announcement below)

---

## Branch A — Figma Flow  (design_source: figma)

### Resolve the reference page FIRST (page-per-component)

Each Figma **page is one component** and holds that component with all its variations — a page
named `accordion` holds the accordion and its variant frames. Before writing the spec, resolve the
component's authoritative reference: the **page named after it** (matched by normalized name).
**Enumerate ALL pages to find it** — prefer the Figma Desktop Bridge (`figma.root.children` lists
every page). **Do NOT rely on the remote Figma MCP's page listing: it caps at 3 pages**, so a
component whose page is 4th+ (Alerts, Buttons, Card, …) would look "missing" and get built blind.
Read its frames/variants and view its screenshot, and generate the spec to **reproduce that
referenced design** — its structure, parts,
and variants. Design tokens supply **values only** (color/spacing/radius/typography). Do **not**
infer the component's shape from its name, and do **not** copy a different existing component (an
alert is not a restyled button). If **no** page matches the component's name, or the Figma MCP is
unavailable, do not fabricate from the name — record the component as **unreferenced** and stop
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
 ✓ 3 spec artifacts generated
   specs/[feature-name]/[component]-component-spec.md
   specs/[feature-name]/[component]-interaction-spec.md
   specs/[feature-name]/[page]-page-spec.md
   Design source: Figma → [frame URL]
──────────────────────────────────────────────
 What happens next
──────────────────────────────────────────────

 Next step → Create a branch, then implement

   git checkout -b feature/[name]-spec

 Open the Component Spec and work through each task
 one at a time, marking [ ] → [x] as you complete them.
 Do not move to the next task until the current one is done.
 When all tasks are checked, run: /visual-verify
──────────────────────────────────────────────
```

---

## Branch B — Component Library Flow  (design_source: library)

### Component Spec header additions
```
Design source:  Component Library
Library:        [component_library]
Base component: [LibraryComponentName]
Customization:  [brief summary of what to override]
```

### Interaction Spec notes
- Note which interactions are handled natively by the library vs. must be implemented custom
- Document any library events/callbacks that must be wired (e.g. `onChange`, `onOpenChange`)

### Page Spec notes
- Note which layout primitives (Grid, Stack, Container) come from the library vs. are custom
- Reference library documentation for composition patterns

### Announce
```
──────────────────────────────────────────────
 ✓ 3 spec artifacts generated
   specs/[feature-name]/[component]-component-spec.md
   specs/[feature-name]/[component]-interaction-spec.md
   specs/[feature-name]/[page]-page-spec.md
   Design source: Library → [library name]
──────────────────────────────────────────────
 What happens next
──────────────────────────────────────────────

 Next step → Create a branch, then implement

   git checkout -b feature/[name]-spec

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
 ✓ 3 spec artifacts generated
   specs/[feature-name]/[component]-component-spec.md
   specs/[feature-name]/[component]-interaction-spec.md
   specs/[feature-name]/[page]-page-spec.md
   Design source: GitHub → [github_repo_url] ([github_branch]/[github_component_dir])
──────────────────────────────────────────────
 What happens next
──────────────────────────────────────────────

 Next step → Create a branch, then implement

   git checkout -b feature/[name]-spec

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
 ✓ 3 spec artifacts generated
   specs/[feature-name]/[component]-component-spec.md
   specs/[feature-name]/[component]-interaction-spec.md
   specs/[feature-name]/[page]-page-spec.md
   Design source: ZIP → [zip_file_path] ([zip_component_dir])
──────────────────────────────────────────────
 What happens next
──────────────────────────────────────────────

 Next step → Create a branch, then implement

   git checkout -b feature/[name]-spec

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
 ✓ 3 spec artifacts generated
   specs/[feature-name]/[component]-component-spec.md
   specs/[feature-name]/[component]-interaction-spec.md
   specs/[feature-name]/[page]-page-spec.md
   Design source: Google Stitch ([mcp | zip export])
   Token mapping table included in Component Spec.
──────────────────────────────────────────────
 What happens next
──────────────────────────────────────────────

 Next step → Create a branch, then implement

   git checkout -b feature/[name]-spec

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
```
