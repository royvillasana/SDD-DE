# Skill: design-doc

Generate a DESIGN.md file that captures the full design system built during component creation, validate it with the `@google/design.md` CLI, and export tokens. Run this after `/storybook` but before starting Screen Creation.

## When to invoke

User says: "design doc", "generate DESIGN.md", "/design-doc", or when component creation is complete and `/storybook` has been run.

## Prerequisites

- `.sdd-de/project.yaml` exists (project is configured)
- At least one component has been implemented and committed during component creation
- The component directory (`[component_dir]`) contains built components
- `/storybook` has been run (Storybook is installed and stories exist)
- `@google/design.md` is installed (`npx @google/design.md --version` succeeds). If not, install it: `npm install -D @google/design.md`

## Steps

### Phase 1 — Gather Design System Data

1. **Read `.sdd-de/project.yaml`** — note `framework`, `language`, `styling`, `component_dir`, `token_file`, and `design_source`.

2. **Check for token gaps** — if `specs/token-gaps.md` exists, read it. These are tokens that were flagged as missing during `/sync-tokens`. Remind the user:

```
🔵 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ Token gaps from component creation

  The following tokens were missing during /sync-tokens:
  [list from specs/token-gaps.md]

  Adding these in Figma now and re-running /sync-tokens will
  produce a more complete DESIGN.md and better Screen Creation output.

  You can continue without them — they'll be documented as
  gaps in DESIGN.md.
🔵 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

If the user adds the missing tokens and re-runs `/sync-tokens`, then re-run `/design-doc` to pick up the complete token set.

3. **Read the format specification**:
```bash
npx @google/design.md spec
```
Study the output. The DESIGN.md file must use YAML frontmatter with specific keys (`colors`, `typography`, `rounded`, `spacing`, `components`) plus Markdown prose sections.

3. **Read the project's token file** (`[token_file]`) to extract all design tokens:
   - Color tokens (CSS custom properties or SCSS variables) → map to `colors` in YAML frontmatter
   - Typography tokens (font families, sizes, weights, line-heights) → map to `typography`
   - Border radius tokens → map to `rounded`
   - Spacing tokens → map to `spacing`
   - Shadow tokens → include in prose section

4. **Scan all component files** in `[component_dir]`:
```bash
find [component_dir] -name "*.tsx" -o -name "*.vue" -o -name "*.svelte" -o -name "*.ts" -o -name "*.jsx" | sort
```
   For each component, extract:
   - Component name
   - Props/variants (from TypeScript interfaces, PropTypes, or equivalent)
   - Which tokens the component references
   - Atomic design level (atom, molecule, organism) based on directory (`ui/` = atom, `modules/` = molecule, `sections/` = organism)

5. **Read existing Component Specs** from `specs/`:
```bash
find specs/ -name "*-component-spec.md" | sort
```
   Extract design intent, usage guidelines, and acceptance criteria from each spec.

6. **Read the existing `design.md`** (if it exists) for any intentional deviations and design decisions documented during the SDD cycle.

### Phase 2 — Compose DESIGN.md

7. **Create the DESIGN.md file** at the project root using the `@google/design.md` format.

The file has two parts: YAML frontmatter (structured tokens) and Markdown prose (design intent).

#### YAML Frontmatter

```yaml
---
name: "[Project Name]"
version: "1.0.0"

colors:
  primary: "[value from token file]"
  primary-hover: "[value]"
  secondary: "[value]"
  background: "[value]"
  foreground: "[value]"
  surface: "[value]"
  muted: "[value]"
  border: "[value]"
  destructive: "[value]"
  success: "[value]"
  warning: "[value]"
  # Include ALL color tokens from the token file

typography:
  display-lg:
    fontFamily: "[value]"
    fontSize: "[value]"
    fontWeight: "[value]"
    lineHeight: "[value]"
  heading-lg:
    fontFamily: "[value]"
    fontSize: "[value]"
    fontWeight: "[value]"
    lineHeight: "[value]"
  body-md:
    fontFamily: "[value]"
    fontSize: "[value]"
    fontWeight: "[value]"
    lineHeight: "[value]"
  label-sm:
    fontFamily: "[value]"
    fontSize: "[value]"
    fontWeight: "[value]"
    lineHeight: "[value]"
  # Include ALL typography tokens

rounded:
  sm: "[value]"
  DEFAULT: "[value]"
  md: "[value]"
  lg: "[value]"
  full: "9999px"
  # Include ALL radius tokens

spacing:
  unit: "[base unit value]"
  xs: "[value]"
  sm: "[value]"
  md: "[value]"
  lg: "[value]"
  xl: "[value]"
  # Include ALL spacing tokens

components:
  [component-name-lowercase]:
    backgroundColor: "{colors.[token]}"
    textColor: "{colors.[token]}"
    typography: "{typography.[token]}"
    rounded: "{rounded.[token]}"
    padding: "{spacing.[token]}"
    source: "[component_dir]/ui/[component-name]/[ComponentName].tsx"
    variants: "[component_dir]/ui/[component-name]/[component-name].variants.ts"
    storybook: "http://localhost:6006/?path=/docs/atoms-[componentname]"
    # Map each component to its token references AND source files
  # One entry per component built during component creation
---
```

#### Markdown Prose

After the YAML frontmatter, write these sections. **Every component annotation MUST
reference the actual source files, variant definitions, and Storybook stories that
already exist in the project.** The DESIGN.md is not a standalone spec — it is a
living index that points to real, implemented code.

```markdown
## Brand & Style

[Describe the overall design philosophy, visual language, and brand identity.
Synthesize from Component Specs and the design source. Be specific — reference
concrete influences, moods, or aesthetic choices rather than generic descriptors.]

## Colors

[Describe the color system: brand palette purpose, neutral scale logic, semantic
colors (success/warning/destructive), and usage guidelines. State when to use
primary vs. secondary, surface vs. background.]

## Typography

[Describe the type system: font families and their roles (sans for UI, mono for
code, serif for display if applicable), size scale progression, weight usage
guidelines, and line-height rationale.]

## Spacing

[Describe the spacing system: base unit, scale logic (linear vs. geometric),
and guidance on which sizes to use for different contexts (component padding,
section margins, gap between elements).]

## Rounded

[Describe the radius system: which components use which radius values and why.
For example: buttons and inputs use md, cards use lg, avatars use full.]

## Components

Every component entry below references the **actual files in the project**.
Use these references when composing pages in Screen Creation — import the component,
check its variants in the `.variants.ts` file, and preview it in Storybook.

### Atoms

#### [ComponentName]

[One-line purpose of this component.]

| | |
|---|---|
| **Component** | `[component_dir]/ui/[component-name]/[ComponentName].tsx` |
| **Variants** | `[component_dir]/ui/[component-name]/[component-name].variants.ts` |
| **Storybook** | `http://localhost:6006/?path=/docs/atoms-[componentname]` |
| **Spec** | `specs/[feature-name]/[component]-component-spec.md` |

**Import:**
```tsx
import { [ComponentName] } from '@/components/ui/[component-name]/[ComponentName]';
```

**Variants** (from `[component-name].variants.ts`):
- `variant`: [list actual variant values from the CVA file, e.g., primary | secondary | tertiary | outline | destructive | ghost]
- `size`: [list actual size values, e.g., sm | md | lg | icon]

**Default state:** `variant="[default]"` `size="[default]"`

**Usage:**
```tsx
<[ComponentName] variant="primary" size="md" />
<[ComponentName] variant="outline" size="lg" className="mt-4" />
```

**Tokens used:** `{colors.primary}`, `{typography.label-sm}`, `{rounded.md}`, `{spacing.sm}`

[Repeat this pattern for each atom.]

### Molecules

[Same pattern — each molecule entry includes Component path, Variants path,
Storybook URL, Spec path, import statement, variant list, and usage example.
Also list which atoms it composes.]

#### [MoleculeName]

**Composes:** [ComponentA], [ComponentB]

[Same table and code blocks as atoms.]

### Organisms

[Same pattern — each organism entry includes all references plus which
molecules/atoms it composes.]

## Responsive Behavior

[Describe breakpoint strategy: 375px (mobile), 768px (tablet), 1440px (desktop).
How the spacing scale, typography, and layout adapt across breakpoints.]

## Accessibility

[Summarize accessibility requirements: WCAG AA compliance, minimum contrast
ratios, focus management strategy, keyboard navigation, screen reader
expectations. Reference the project's accessibility baseline from
component-standards.md.]

## Design Decisions

[Any intentional deviations from the original design source, with rationale.
Import from the existing design.md if it exists.]
```

### Phase 3 — Validate and Export

8. **Lint the DESIGN.md** using the `@google/design.md` CLI:
```bash
npx @google/design.md lint DESIGN.md
```

If linting reports errors:
- Read each error message
- Fix the corresponding section in DESIGN.md
- Re-run lint until it passes with zero errors
- Warnings are acceptable; errors must be resolved

9. **Export tokens** to verify consistency with the project's token file:

```bash
# Export as CSS custom properties
npx @google/design.md export DESIGN.md --format css-vars

# If the project uses Tailwind, also export Tailwind config
npx @google/design.md export DESIGN.md --format tailwind
```

Review the exported output. Verify it matches the project's existing token file values. If there are discrepancies, update DESIGN.md to match the authoritative token file — the token file is the source of truth, DESIGN.md documents it.

10. **Optionally run diff** if a previous DESIGN.md existed:
```bash
npx @google/design.md diff DESIGN.md.bak DESIGN.md
```

### Phase 4 — Integrate with CLAUDE.md

11. **Check if CLAUDE.md already references DESIGN.md**. If not, add the following section to CLAUDE.md immediately before the "How the Workflow Is Organized" section:

```markdown
## Design System Document

After component creation is complete, a `DESIGN.md` file is generated at the project root using the
`@google/design.md` format. This file captures the complete design system: all tokens,
all components, design intent, and usage guidelines.

**Read `DESIGN.md` before starting Screen Creation.** It provides the full context of
the component library so you can compose pages accurately.

To validate: `npx @google/design.md lint DESIGN.md`
To export tokens: `npx @google/design.md export DESIGN.md --format css-vars`
```

### Phase 5 — Announce

12. **Announce**:

```
──────────────────────────────────────────────
 ✓ DESIGN.md generated and validated
   [N] color tokens documented
   [N] typography scales documented
   [N] spacing tokens documented
   [N] components documented (with source paths, variant files, Storybook URLs)
   Lint: passed (0 errors)
   Format: @google/design.md v1.0
──────────────────────────────────────────────
 What happens next
──────────────────────────────────────────────

 Your complete design system is documented in DESIGN.md
 at the project root. The AI agent will read this file
 before starting any Screen Creation work.

 DESIGN.md captures:
   • All design tokens (colors, typography, spacing, radius)
   • Every component built during component creation (variants, props, usage)
   • Design intent and brand rationale
   • Responsive behavior and accessibility requirements

 You are ready to start Screen Creation.

 Next step → /enrich-brief
 Describe the first page you want to compose
 using the components you built during component creation.

 Run it now: /enrich-brief
──────────────────────────────────────────────
```

## DESIGN.md Checklist

Before announcing completion, verify:

- [ ] DESIGN.md exists at the project root
- [ ] YAML frontmatter contains all token categories: `colors`, `typography`, `rounded`, `spacing`, `components`
- [ ] Every token from the project's token file is represented in the YAML frontmatter
- [ ] Every component built during component creation is listed in the `components` key with token references
- [ ] Token references use the `{path.to.token}` syntax (e.g., `{colors.primary}`)
- [ ] **Every component entry has real file references** — verify these paths exist:
  - [ ] Component file path (e.g., `src/components/ui/button/Button.tsx`) — `ls` the file
  - [ ] Variants file path (e.g., `src/components/ui/button/button.variants.ts`) — `ls` the file
  - [ ] Storybook URL path (e.g., `?path=/docs/atoms-button`) — matches a real story
  - [ ] Spec file path (e.g., `specs/button/button-component-spec.md`) — `ls` the file
  - [ ] Import statement works (e.g., `import { Button } from '@/components/ui/button/Button'`)
- [ ] **Every component entry has a usage example** with actual variant values from the `.variants.ts` file
- [ ] **Molecules/organisms list which atoms they compose** with import paths
- [ ] Markdown prose sections describe design intent with specifics, not generic descriptions
- [ ] `npx @google/design.md lint DESIGN.md` passes with zero errors
- [ ] Token export matches the project's existing token file
- [ ] CLAUDE.md references DESIGN.md for Screen Creation context

## Updating DESIGN.md

If new components are added after initial generation (e.g., during Screen Creation when a missing atom is discovered):
1. Add the new component to the `components` YAML key
2. Add any new tokens to the appropriate YAML section
3. Update the prose section for the component's atomic level
4. Re-run `npx @google/design.md lint DESIGN.md`
5. Commit the updated DESIGN.md

## Comparing Versions

When the design system changes, use diff to detect regressions:
```bash
npx @google/design.md diff DESIGN.md.bak DESIGN.md
```
