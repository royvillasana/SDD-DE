# Skill: visual-verify

Run a structured visual QA comparing the live implementation to the design spec.

## When to invoke

User says: "verify", "visual QA", "/visual-verify", or after all Apply tasks are checked.

## Before starting

Read `.sdd-de/project.yaml` to determine `design_source`:
`figma` | `library` | `github` | `zip` | `stitch`

The verification process adapts based on the source of truth.
For `github` and `zip`, the source of truth is the component source files.
For `stitch`, the source of truth is the Stitch screen image + `design.md`.

## Prerequisites

- All tasks in the Component Spec are checked (`- [x]`)
- Dev server (or Storybook) is running — this is the render surface the VISUAL layer needs
- For the Figma flow, the component's **reference page** is resolvable (see the convention below); for the library flow, library component docs are accessible

---

## The gate: three layers, reported in order — VISUAL → TOKEN → CODE

Verification is three layers, evaluated and reported in this order. A component is
**"verified" only when ALL THREE pass on real evidence** — report each layer independently
and never let a passing layer mask a failing one.

1. **VISUAL (primary)** — render the live component and compare every variant/state to its
   authoritative design (each branch below says where that reference comes from). A component
   that COMPILES and uses tokens but does **not** match its reference **fails** this layer —
   name the concrete differences (missing parts/slots, wrong container shape, absent variants,
   wrong proportions), not a bare verdict. If there is no running render surface, VISUAL is
   **BLOCKED, never PASS** — do the source-level checks you can and list what you could not render.
2. **TOKEN** — every color/spacing/radius/typography value references a design token; zero
   hardcoded hex/px (the TOKEN AUDIT in each branch's checklist).
3. **CODE** — the component type-checks/builds cleanly (`npx tsc --noEmit`, and for a
   Storybook/library project `npm run build-storybook`). Code that does not compile is a failing
   CODE layer — and because it can't be rendered, VISUAL is then BLOCKED.

### Resolve the Figma reference yourself (Figma) — never ask for a link

The authoritative reference for a component is **its own Figma node** (the component set). **Resolve
it autonomously**, in this order:
1. The entry's **`figmaNodeId` / `componentKey`** in `.sdd-de/components.json` — read that exact node
   via the Figma MCP (`get_design_context` / `get_screenshot`).
2. If missing, **`search_design_system`** scoped to THIS file's own library (from `figma_file_url`) —
   it resolves the component by name and is **NOT capped** like the page listing.
3. The **Desktop Bridge** (`figma.root.children`) if connected.

**Do NOT use the remote page listing to locate it — it caps at 3 pages.** Read the resolved node's
frames/variants and view its screenshot. Compare EVERY variant/state. If the node truly cannot be
resolved by any method, do **not** invent a reference — record the component as unreferenced and mark
VISUAL as BLOCKED.

**TOKEN layer, specifically:** flag any hardcoded `#hex` / `rgb()` / `rgba()` / raw `px` in the
component AND its `*.variants.*` file (e.g. a `focus:ring-[rgba(13,110,253,0.25)]`) as a TOKEN
failure, and confirm the component uses the design system's own semantic tokens (e.g.
`--component-<name>-*`) where they exist.

### Required: machine-readable verdict block

Every `visual-verify-report.md` **MUST end with this block** — the VortSpec cockpit reads it
verbatim to set the component's status; a `fail` or `blocked` layer keeps the component out of
"verified":

```
VISUAL: pass | fail | blocked
TOKEN: pass | fail
CODE: pass | fail
VERIFY: PASS | ISSUES (<failing layers>) | BLOCKED (<what you could not verify>)
```

Report **PASS only** when all three layers passed on real evidence — you ACTUALLY rendered and
compared (VISUAL), tokens are clean (TOKEN), and it compiles (CODE). Never claim a check you did
not perform, and never report a VISUAL pass you did not render-and-compare.

---

## Branch A — Figma Flow  (design_source: figma)

Use this branch when `design_source: figma`.

### Steps

1. **Read** `specs/[feature-name]/[component]-component-spec.md`
2. **Open the live component** at the correct URL and viewport
3. **Open the reference** — resolve the component's Figma node yourself (its `figmaNodeId`/
   `componentKey` from `.sdd-de/components.json`, else `search_design_system` scoped to this file's
   library; see "Resolve the Figma reference yourself" above). Read its variant frames and screenshot
   as authoritative. If the node truly can't be resolved, mark VISUAL **BLOCKED** and record it.
4. **Run the visual checklist** (report pass ✓ or fail ✗ for each). A component that compiles and
   uses tokens but does not match this reference **fails the VISUAL layer**:

```
VIEWPORT: 375px
[ ] Matches the reference page — layout, parts/slots, proportions (compare side-by-side with Figma)
[ ] All variants present and correct (compare side-by-side with Figma)
[ ] All states present: default, hover, focus, active, disabled, loading, error
[ ] Colors match Figma Variables → CSS tokens (check DevTools Computed)
[ ] Spacing matches design tokens (padding, margin, gap)
[ ] Font size / weight / line-height match design tokens
[ ] Border radius matches design tokens
[ ] Shadows match design tokens

VIEWPORT: 768px
[ ] Layout changes are correct per Figma tablet frame

VIEWPORT: 1440px
[ ] Layout changes are correct per Figma desktop frame

ACCESSIBILITY
[ ] Correct HTML element (button, a, input, etc.)
[ ] aria-disabled on disabled state
[ ] aria-busy on loading state
[ ] Focus ring visible at 2:1+ contrast ratio
[ ] axe accessibility audit: zero errors

TOKEN AUDIT (DevTools → Computed — zero tolerance)
[ ] Zero hardcoded hex values in component
[ ] Zero hardcoded pixel values (except 1px borders, outline-width)
[ ] Every color references a CSS token variable
[ ] Every spacing value references a CSS token variable
```

5. **Run the CODE layer**: `npx tsc --noEmit` (and `npm run build-storybook` for a Storybook/library
   project). A build error is a failing CODE layer — fix inline and re-run.
6. **Document results** in `specs/[feature-name]/visual-verify-report.md`:
   - List every discrepancy; for each, state whether Figma or code is authoritative, and the fix applied
   - **End the report with the machine-readable verdict block** (VISUAL / TOKEN / CODE / VERIFY)
7. **Gate**: all three layers pass on real evidence → proceed to `/adversarial-review`
8. **If any layer fails or is blocked**: fix what you can, re-run, mark resolved; report ISSUES/BLOCKED honestly rather than a false PASS
9. **Announce**:

```
──────────────────────────────────────────────
 ✓ Visual QA passed — zero unresolved discrepancies
   specs/[feature-name]/visual-verify-report.md saved
──────────────────────────────────────────────
 What happens next
──────────────────────────────────────────────

 Next step → /adversarial-review

 Claude will red-team the implementation independently,
 challenging every assumption to find what visual QA can miss:
 silent omissions, untested states, hardcoded token values,
 and accessibility gaps. All Blocker findings must be resolved
 before the PR can be opened.

 Run it now: /adversarial-review
──────────────────────────────────────────────
```

---

## Branch B — Component Library Flow  (design_source: library)

Use this branch when `design_source: library`.

### Steps

1. **Read** `specs/[feature-name]/[component]-component-spec.md`
2. **Open the live component** at the correct URL and viewport
3. **Reference**: library component documentation (not Figma)
4. **Run the visual checklist**:

```
VIEWPORT: 375px
[ ] Base library component renders without errors
[ ] All custom variants are present (beyond library defaults)
[ ] Brand tokens applied: color, spacing, radius, typography (check DevTools)
[ ] Library-native states work: hover, focus, disabled, loading, error
[ ] No library defaults leak through (e.g. wrong color, wrong border-radius)

VIEWPORT: 768px
[ ] Layout changes correct per spec

VIEWPORT: 1440px
[ ] Layout changes correct per spec

LIBRARY OVERRIDE AUDIT
[ ] Library default styles properly overridden (no unintended defaults visible)
[ ] Token variables applied — no raw values from library theme object

ACCESSIBILITY
[ ] Library component's native accessibility is intact (not broken by overrides)
[ ] axe accessibility audit: zero errors
[ ] Focus management works correctly

TOKEN AUDIT (zero tolerance)
[ ] Zero hardcoded hex values in customization layer
[ ] Zero hardcoded pixel values (except 1px borders)
[ ] Every brand override uses a CSS token variable
```

5. **Document results** in `specs/[feature-name]/visual-verify-report.md`
6. **Gate**: Zero unresolved discrepancies → proceed to `/adversarial-review`
7. **If discrepancies exist**: fix, re-run, mark resolved
8. **Announce**:

```
──────────────────────────────────────────────
 ✓ Visual QA passed — zero unresolved discrepancies
   specs/[feature-name]/visual-verify-report.md saved
──────────────────────────────────────────────
 What happens next
──────────────────────────────────────────────

 Next step → /adversarial-review

 Claude will red-team the implementation independently,
 challenging every assumption to find what visual QA can miss:
 silent omissions, untested states, hardcoded token values,
 and accessibility gaps. All Blocker findings must be resolved
 before the PR can be opened.

 Run it now: /adversarial-review
──────────────────────────────────────────────
```

---

## Branch C — GitHub Repository Flow  (design_source: github)

The source of truth is the component source files from the GitHub repo.
There is no Figma frame to compare against — compare the live implementation to the Component Spec
(which was generated from the repo's component API).

### Steps

1. **Read** `specs/[feature-name]/[component]-component-spec.md`
2. **Open the live component** at the correct URL and viewport
3. **Run the visual checklist**:

```
VIEWPORT: 375px
[ ] All variants from the spec are present and visually correct
[ ] All props exposed in the source component are implemented or explicitly excluded
[ ] Brand tokens applied correctly: color, spacing, radius, typography
[ ] All states work: hover, focus, disabled, loading, error
[ ] No raw values from the source repo leak through (token overrides in effect)

VIEWPORT: 768px
[ ] Layout changes correct per spec

VIEWPORT: 1440px
[ ] Layout changes correct per spec

PROP/API COMPLIANCE
[ ] All prop types from the source component are respected
[ ] No breaking changes introduced during adaptation

ACCESSIBILITY
[ ] Source component's native accessibility is intact
[ ] axe accessibility audit: zero errors

TOKEN AUDIT (zero tolerance)
[ ] Zero hardcoded values in the adaptation/customization layer
[ ] Every brand override uses a CSS token variable
```

4. **Document results** in `specs/[feature-name]/visual-verify-report.md`
5. **Gate**: Zero unresolved discrepancies → proceed to `/adversarial-review`
6. **Announce**:

```
──────────────────────────────────────────────
 ✓ Visual QA passed — zero unresolved discrepancies
   specs/[feature-name]/visual-verify-report.md saved
──────────────────────────────────────────────
 What happens next
──────────────────────────────────────────────

 Next step → /adversarial-review

 Claude will red-team the implementation independently,
 challenging every assumption to find what visual QA can miss:
 silent omissions, untested states, hardcoded token values,
 and accessibility gaps. All Blocker findings must be resolved
 before the PR can be opened.

 Run it now: /adversarial-review
──────────────────────────────────────────────
```

---

## Branch D — ZIP File Flow  (design_source: zip)

Same process as Branch C (GitHub). The source of truth is the component source files extracted from the ZIP.

### Steps

1. **Read** `specs/[feature-name]/[component]-component-spec.md`
2. **Open the live component** at the correct URL and viewport
3. **Run the same checklist as Branch C** — the ZIP is treated identically to a GitHub repo source
4. **Document results** in `specs/[feature-name]/visual-verify-report.md`
5. **Gate**: Zero unresolved discrepancies → proceed to `/adversarial-review`
6. **Announce**:

```
──────────────────────────────────────────────
 ✓ Visual QA passed — zero unresolved discrepancies
   specs/[feature-name]/visual-verify-report.md saved
──────────────────────────────────────────────
 What happens next
──────────────────────────────────────────────

 Next step → /adversarial-review

 Claude will red-team the implementation independently,
 challenging every assumption to find what visual QA can miss:
 silent omissions, untested states, hardcoded token values,
 and accessibility gaps. All Blocker findings must be resolved
 before the PR can be opened.

 Run it now: /adversarial-review
──────────────────────────────────────────────
```

---

## Branch E — Google Stitch Flow  (design_source: stitch)

The source of truth is the Stitch screen image plus the `design.md` design system spec.
Compare the live implementation against these visually and token-by-token.

### Steps

1. **Read** `specs/[feature-name]/[component]-component-spec.md`
2. **Open the live component** at the correct URL and viewport
3. **Get the reference image**:
   - **MCP** (`stitch_connection: mcp`): call `fetch_screen_image` to get the current Stitch screen screenshot
   - **ZIP** (`stitch_connection: zip`): read `screen.png` from the extracted ZIP
4. **Get the design system spec**: read `design.md` (from ZIP or from `extract_design_context` via MCP)
5. **Run the visual checklist**:

```
VIEWPORT: 375px
[ ] Live component matches Stitch screen.png — layout, spacing, proportions
[ ] All variants visible in Stitch screen are implemented
[ ] Brand colors match design.md color values → mapped to project token variables
[ ] Typography matches design.md — size, weight, line-height → mapped to tokens
[ ] Spacing matches design.md scale → mapped to token variables
[ ] Border radius matches design.md component rules → mapped to tokens
[ ] All states: hover, focus, disabled, loading, error

VIEWPORT: 768px
[ ] Layout changes correct per spec

VIEWPORT: 1440px
[ ] Layout changes correct per spec

STITCH TOKEN AUDIT
[ ] All values from design.md are mapped to project token variables (not hardcoded)
[ ] No Stitch HTML/CSS default values leak into the implementation without tokenization
[ ] Every color, spacing, and typography value uses a project token variable

ACCESSIBILITY
[ ] axe accessibility audit: zero errors
[ ] Focus management works correctly
```

6. **Document results** in `specs/[feature-name]/visual-verify-report.md`
7. **Gate**: Zero unresolved discrepancies → proceed to `/adversarial-review`
8. **Announce**:

```
──────────────────────────────────────────────
 ✓ Visual QA passed — zero unresolved discrepancies
   specs/[feature-name]/visual-verify-report.md saved
──────────────────────────────────────────────
 What happens next
──────────────────────────────────────────────

 Next step → /adversarial-review

 Claude will red-team the implementation independently,
 challenging every assumption to find what visual QA can miss:
 silent omissions, untested states, hardcoded token values,
 and accessibility gaps. All Blocker findings must be resolved
 before the PR can be opened.

 Run it now: /adversarial-review
──────────────────────────────────────────────
```
