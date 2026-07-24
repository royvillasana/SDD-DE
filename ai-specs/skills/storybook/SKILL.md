# Skill: storybook

Install real Storybook into the project (non-interactively) and generate a story for every component built during component creation, so the user can browse and interact with the component library. Do NOT start a blocking dev server and do NOT improvise a custom preview/gallery — VortSpec's Playground serves Storybook; this skill only installs it and writes the stories.

## When to invoke

User says: "storybook", "create stories", "document components", "/storybook", or when component creation is complete and all components have been committed.

## Prerequisites

- `.sdd-de/project.yaml` exists (project is configured)
- At least one component has been implemented and committed during component creation
- The component directory (`[component_dir]`) contains built components

## Steps

### Phase 1 — Install Storybook

1. **Read `.sdd-de/project.yaml`** — note `framework`, `language`, `styling`, `component_dir`, and `token_file`.

2. **Check if Storybook is already installed**:
```bash
# Check for existing Storybook config
ls .storybook/main.* 2>/dev/null
```

3. **If Storybook is NOT installed**, run the initializer for the detected framework. You are running head-less (no TTY), so the init MUST be non-interactive — always pass `--yes` and set `CI=1` so it never waits on a prompt:

#### Branch A — React / Next.js
```bash
CI=1 npx storybook@latest init --type react --yes
```

#### Branch B — Vue / Nuxt
```bash
CI=1 npx storybook@latest init --type vue3 --yes
```

#### Branch C — Svelte / SvelteKit
```bash
CI=1 npx storybook@latest init --type svelte --yes
```

#### Branch D — Angular
```bash
CI=1 npx storybook@latest init --type angular --yes
```

#### Branch E — Vanilla / Astro
```bash
CI=1 npx storybook@latest init --type html --yes
```

> **CRITICAL — install REAL Storybook, never a substitute.** Do NOT hand-roll a
> Vite "showcase/gallery" page, a `src/showcase/` folder, `*.preview.tsx` files,
> or any custom preview as a stand-in for Storybook. If `storybook init` fails or
> can't run, STOP and report the exact error — do not improvise an alternative
> preview. After init, VERIFY it actually took hold before continuing:
> ```bash
> ls .storybook/main.* 2>/dev/null && node -e "process.exit(require('./package.json').scripts?.storybook?0:1)"
> ```
> Both must succeed (a `.storybook` config exists AND a `storybook` script exists
> in package.json). If either is missing, the install did not complete — report it
> and stop; do not generate stories against a non-existent Storybook.

4. **Install additional addons**:
```bash
npm install -D @storybook/addon-a11y @storybook/addon-docs
```

5. **Configure addons** — update `.storybook/main.[ts|js]` to include:
```js
addons: [
  '@storybook/addon-essentials',
  '@storybook/addon-a11y',
  '@storybook/addon-docs',
],
```

**Mirror the tsconfig path aliases into Vite** (REQUIRED when components import via `@/…`). Vite does
NOT read `tsconfig.json` `compilerOptions.paths`, so `@/lib/utils` compiles under `tsc` but fails the
Storybook build with `[vite:import-analysis] Failed to resolve import "@/lib/utils"`. For every
`"@/*": ["./src/*"]` in tsconfig, add a matching `resolve.alias` in `main`'s `viteFinal`:
```ts
import { fileURLToPath } from 'node:url';
// …
viteFinal: async (config) => {
  config.resolve = config.resolve ?? {};
  config.resolve.alias = { ...config.resolve.alias, '@': fileURLToPath(new URL('../src', import.meta.url)) };
  return config;
},
```

6. **Configure the style imports** — update `.storybook/preview.[ts|js]` so all stories render with the real design system. For `styling: tailwind`, import the Tailwind entry stylesheet FIRST (the utility layers), THEN the tokens (the variables those utilities reference) — without the Tailwind import the token classes compile to nothing and stories render unstyled:

```js
// Tailwind layers first, then the design tokens the utilities reference.
import '../[styles_dir]/tailwind.css';   // omit for non-Tailwind styling
import '../[token_file]';
```

Replace `[token_file]` with the value from `.sdd-de/project.yaml` and `[styles_dir]` with its directory.

### Phase 2 — Scan Components

7. **Scan the component directory** (`[component_dir]`) and build an inventory of all components:

```bash
# List all component files (adapt extension to framework)
find [component_dir] -name "*.tsx" -o -name "*.vue" -o -name "*.svelte" -o -name "*.ts" -o -name "*.jsx" | sort
```

8. **For each component found**, read the component file and its corresponding Component Spec (if one exists at `specs/[feature-name]/[component]-component-spec.md`) to extract:
   - Component name
   - All props/inputs with types and defaults
   - All variants (e.g., primary, secondary, ghost, destructive)
   - All states (e.g., default, hover, disabled, loading, error)
   - Responsive breakpoints
   - Accessibility requirements
   - Design token usage

### Phase 3 — Install the shared docs system (once per project)

The rich per-component docs pages and the Foundations pages are driven by **shipped templates**
in this skill's `assets/` directory. Copy them into the project ONCE (before generating stories),
adapting import paths to the project. Read [`docs/component-metadata-model.md`](../../../docs/component-metadata-model.md)
first — it defines the metadata schema every component will carry.

Copy from `.sdd-de/ai-specs/skills/storybook/assets/` into the project:

| Template asset | Copy to | Notes |
|---|---|---|
| `docs/ComponentDocs.tsx` (or `.jsx` for JS projects) | `.storybook/ComponentDocs.tsx` | The shared docs-page renderer. **React/MDX even in Vue/Svelte/Angular** — the Docs addon renders in React everywhere. |
| `foundations/FoundationBlocks.tsx` | `.storybook/foundations/FoundationBlocks.tsx` | Presentational primitives for the Foundations pages. |
| `foundations/{Colors,Typography,Spacing,Radius}.mdx` | `.storybook/foundations/*.mdx` | Foundations pages — you fill their token arrays in Phase 4. |

Then make Storybook pick up the new folders — add `.storybook/**/*.mdx` and the foundations glob to
the `stories` array in `.storybook/main.*` (keep the existing component glob):

```ts
stories: [
  "../src/**/*.stories.@(ts|tsx|js|jsx)",
  "../.storybook/**/*.mdx",
],
```

Install the docs blocks if `storybook init` didn't (usually present via `addon-essentials`):
`npm install -D @storybook/blocks @storybook/addon-docs`.

> The `.stories.*` files stay in the project's framework format (React/Vue/Svelte/Angular). Only
> `ComponentDocs` and the Foundations `.mdx` are shared React/MDX. See `assets/wiring.md` for the
> exact per-framework stories snippet.

### Phase 3b — Generate Stories + Metadata

9. **For each component**, generate BOTH a story file and a metadata file next to the component:

```
src/components/Accordion/
├── Accordion.tsx            # the component (untouched)
├── Accordion.stories.tsx    # ← generated (stories + docs.page wiring)
└── Accordion.metadata.ts    # ← generated (structured metadata; see component-metadata-model.md)
```

```
[component_dir]/
├── ui/
│   ├── Button.tsx
│   ├── Button.stories.[tsx|ts|jsx|js]    ← generated
│   ├── Input.tsx
│   ├── Input.stories.[tsx|ts|jsx|js]     ← generated
│   ...
├── modules/
│   ├── SearchBar.tsx
│   ├── SearchBar.stories.[tsx|ts|jsx|js] ← generated
│   ...
└── sections/
    ├── Header.tsx
    ├── Header.stories.[tsx|ts|jsx|js]    ← generated
    ...
```

10. **Story file structure** — each story file MUST include:

#### a) Default export with metadata

The component import MUST match the component's actual export. Components follow the NAMED-export
convention (`docs/component-standards.md` → Exports), so import it as a named import — `import
{ [ComponentName] } from './[ComponentName]'`. Before writing the story, verify the component's
export: if it still uses `export default`, either convert it to a named export or import it as a
default import to match — never emit `{ Name }` for a default export or `Name` for a named export,
which fails the build with `MISSING_EXPORT`.

```tsx
import type { Meta, StoryObj } from '@storybook/[framework]';
import { [ComponentName] } from './[ComponentName]';       // named import — matches the named export convention
import { metadata } from './[ComponentName].metadata';     // the structured metadata (Phase 3c)
import { ComponentDocs } from '../../../.storybook/ComponentDocs';  // adjust depth, or use the project alias

const meta: Meta<typeof [ComponentName]> = {
  title: '[Category]/[ComponentName]',   // e.g., 'Atoms/Button', 'Molecules/SearchBar'
  component: [ComponentName],
  tags: ['autodocs'],
  parameters: {
    // Render the SHARED rich docs page (Identity, Props, Patterns, Anti-Patterns, States,
    // Accessibility, Design Tokens, AI Hints, …) instead of the bare autodocs default.
    docs: { page: () => <ComponentDocs meta={metadata} /> },
  },
  argTypes: {
    // Map every prop with controls (feeds the interactive Controls block on the docs page)
    // variant: { control: 'select', options: ['primary', 'secondary', 'ghost'] },
    // disabled: { control: 'boolean' },
    // size: { control: 'radio', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof [ComponentName]>;
```

See `assets/wiring.md` for the exact snippet in Vue / Svelte / Angular (the `docs.page` call is the
same; only the story format differs).

#### b) A `Default` story showing the component with default props

```tsx
export const Default: Story = {
  args: {
    // default prop values
  },
};
```

#### c) One story per variant

```tsx
export const Primary: Story = {
  args: { variant: 'primary' },
};

export const Secondary: Story = {
  args: { variant: 'secondary' },
};

export const Ghost: Story = {
  args: { variant: 'ghost' },
};

export const Destructive: Story = {
  args: { variant: 'destructive' },
};
```

#### d) One story per interactive state

```tsx
export const Disabled: Story = {
  args: { disabled: true },
};

export const Loading: Story = {
  args: { loading: true },
};
```

#### e) A responsive story (if the component has responsive behavior)

```tsx
export const Mobile: Story = {
  args: { /* default args */ },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};
```

#### f) An accessibility story with the a11y addon

```tsx
export const AccessibilityTest: Story = {
  args: { /* default args */ },
  parameters: {
    a11y: { disable: false },
  },
};
```

#### g) The component metadata file — `[ComponentName].metadata.ts` (MANDATORY)

Author a structured metadata file next to the component. **This is what makes the docs page rich** —
without it the docs page falls back to bare autodocs (props only), which is exactly the "no metadata"
failure this skill exists to prevent. Every component MUST get a non-empty metadata file with an
`identity` block, `props`, `designTokens`, and the analysis fields below. Start from
`assets/metadata.template.ts`.

**Use the `ai-component-metadata` skill to produce the analysis-derived fields.** The specs are the
first source, but they may not carry rich `commonPatterns` / `antiPatterns` / `aiHints` / `states` /
`accessibility` — so **invoke the `ai-component-metadata` skill on the component** (it analyzes the
component's composition, variants, props, and a11y and emits exactly these fields). Then merge:

- **Spec-sourced (authoritative when present):** `props`/`itemShape` and the "Design Tokens Used" table
  from the Component Spec; `identity.category`/`figmaFile`/`figmaNode`/variants from
  **`.sdd-de/components.json`** (`level`, `figmaNodeId`, `componentKey`); timing/behaviour for `states`
  from the Interaction Spec.
- **`ai-component-metadata`-sourced (fills the gaps):** `commonPatterns`, `antiPatterns`,
  `aiHints` (context + keywords + generationRules), and any `states`/`accessibility` the specs omit.
- **`token_file` (computed — the ONE thing you resolve, not copy):** every used token name → its VALUE
  for `designTokens`, grouped by `colors` / `typography` / `spacing` / `shadows` / `radius` (spacing
  covers margins). Embed the real hex/rem, never the token name.

**Schema bridge.** The `ai-component-metadata` skill emits a `component: { … }` block with a plural
`category` (`atoms|molecules|organisms`); the toolkit's `ComponentDocs` renderer reads the canonical
shape in [`docs/component-metadata-model.md`](../../../docs/component-metadata-model.md) — an
`identity: { … }` block with a **singular** `category` (`atom|molecule|organism|template`). Map
`component`→`identity`, singularize the category, and add `designTokens`/`itemShape` (which the
analysis skill doesn't produce). The final file MUST match the canonical schema — that's what
`ComponentDocs` renders.

Emit only the sections the component has (omit `itemShape` unless it has an object/array prop, omit
`designTokens.shadows` unless it casts a shadow, etc.) — but `identity`, `props`, and `designTokens`
are never omitted for a real component.

11. **Category mapping** for the story `title` field:

| Component directory | Storybook category |
|---|---|
| `[component_dir]/ui/` | `Atoms/[ComponentName]` |
| `[component_dir]/modules/` | `Molecules/[ComponentName]` |
| `[component_dir]/sections/` | `Organisms/[ComponentName]` |
| Any other directory | `Components/[ComponentName]` |

12. **Adapt story format to framework**:

- **React / Next.js** (`language: typescript`): Use `.stories.tsx` with CSF3 format (Component Story Format 3)
- **React / Next.js** (`language: javascript`): Use `.stories.jsx` with CSF3 format
- **Vue**: Use `.stories.ts` or `.stories.js` — import from `.vue` file
- **Svelte**: Use `.stories.ts` or `.stories.js` — import from `.svelte` file
- **Angular**: Use `.stories.ts` — use `moduleMetadata` decorator
- **Vanilla / Astro**: Use `.stories.ts` or `.stories.js` — render as raw HTML

### Phase 4 — Documentation Pages

13. **Create an overview documentation page** at `.storybook/stories/Introduction.mdx`:

```mdx
import { Meta } from '@storybook/blocks';

<Meta title="Introduction" />

# [Project Name] Component Library

This component library was built using **SDD-DE** (Spec-Driven Development for Design Engineers).

## Design Token System

All components reference design tokens from `[token_file]`. No hardcoded color, spacing, or typography values.

## Atomic Design Structure

| Level | Directory | Purpose |
|---|---|---|
| **Atoms** | `[component_dir]/ui/` | Base UI elements (Button, Input, Badge) |
| **Molecules** | `[component_dir]/modules/` | Composed elements (SearchBar, Card) |
| **Organisms** | `[component_dir]/sections/` | Complex sections (Header, Sidebar) |

## How Components Were Built

Each component followed the SDD 7-step cycle:
1. Enriched brief with acceptance criteria
2. Component Spec + Interaction Spec + Page Spec generated
3. Implementation — one task at a time
4. Visual verification against design spec
5. Adversarial review before commit
6. Design token sync
7. PR with spec as description
```

14. **Generate the Foundations pages from `token_file`.** These are global docs pages that visualize
    the design system's tokens — the same values components reference. Fill the token arrays in the
    `.mdx` files you copied in Phase 3 (`.storybook/foundations/`) from the project's `token_file`:

    | Page | Title | Fill from these token categories |
    |---|---|---|
    | `Colors.mdx` | `Foundations/Colors & Shadows` | color tokens (brand/semantic, numbered shade ramps, neutrals) + shadow tokens |
    | `Typography.mdx` | `Foundations/Typography` | font-size + weight + line-height tokens (the type scale) |
    | `Spacing.mdx` | `Foundations/Spacing` | the spacing scale (drives padding AND margin utilities) |
    | `Radius.mdx` | `Foundations/Radius` | border-radius tokens |

    Embed RESOLVED values (real hex/rem) so a page always reflects the tokens it was generated from.
    Re-running `/storybook` after a token change refreshes them. Read `token_file` and group by the
    naming conventions in [`docs/design-token-model.md`](../../../docs/design-token-model.md).

15. **Order the sidebar** so Foundations sits above the component library. Add `options.storySort`
    to `.storybook/preview.*`:

```ts
export const parameters = {
  options: {
    storySort: {
      order: ['Introduction', 'Foundations', ['Colors & Shadows', 'Typography', 'Spacing', 'Radius'],
              'Atoms', 'Molecules', 'Organisms'],
    },
  },
  a11y: { /* keep the a11y addon config */ },
};
```

Every built component's rich docs page is produced by the shared `ComponentDocs` renderer wired in
Phase 3b (`parameters.docs.page`) — not the bare autodocs default — reading its `[ComponentName].metadata.ts`.

### Phase 5 — Verify (do NOT start a blocking server)

16. **Verify the setup — never launch a long-running dev server here.** You are
    running head-less; `npm run storybook` is a foreground process that never
    exits, so starting it would hang this run. VortSpec's Playground starts and
    serves Storybook for the user. Instead, confirm the setup is complete — every
    built component has BOTH a story and a metadata file, and the shared docs system
    is in place:
```bash
ls .storybook/main.* && node -e "process.exit(require('./package.json').scripts?.storybook?0:1)"
ls .storybook/ComponentDocs.* .storybook/foundations/*.mdx    # shared docs + Foundations exist
find [component_dir] -name "*.stories.*" | wc -l              # should match the component count
find [component_dir] -name "*.metadata.*" | wc -l             # should ALSO match the component count
# Every metadata file must be REAL, not a stub: an `identity` block, `designTokens`, and the
# docs.page must be wired. Any hit here is a component that would render bare autodocs — fix it.
for m in $(find [component_dir] -name "*.metadata.*"); do
  grep -q "identity" "$m" && grep -q "designTokens" "$m" || echo "THIN METADATA: $m"
done
grep -RL "ComponentDocs" [component_dir] --include="*.stories.*"   # stories NOT wired to ComponentDocs
```
    If a story OR metadata file is missing, or a metadata file is thin (no `identity`/`designTokens`),
    or a story isn't wired to `ComponentDocs`, **fix it now (Phase 3b/3c) before announcing** — a
    passing story count with empty metadata is the exact "docs show no metadata" bug. Storybook opens
    at `http://localhost:6006` when the user runs the Playground.

17. **Announce**:

```
──────────────────────────────────────────────
 ✓ Storybook installed and stories generated
   [N] components documented
   [N] stories created (variants + states)
──────────────────────────────────────────────
 What happens next
──────────────────────────────────────────────

 Storybook is running at: http://localhost:6006

 Browse the component library in your browser.
 Foundations pages (Colors & Shadows, Typography,
 Spacing, Radius) sit at the top; every component shows:
   • Live interactive preview with controls
   • All variants and states as separate stories
   • Component Identity, Props + Item Shape
   • Common Patterns + Anti-Patterns
   • States & Behaviour + Accessibility
   • Design Tokens (colors, typography, spacing,
     shadows, radius) with resolved swatches
   • AI Generation Hints, Keywords, Generation Rules
   • Accessibility audit via the a11y addon

 When you are satisfied with your component library,
 you are ready to start Screen Creation.

 Next step → /enrich-brief
 Describe the first page you want to compose
 using the components you just built.

 Run it now: /enrich-brief
──────────────────────────────────────────────
```

## Story Generation Checklist

Shared, once per project:

- [ ] `.storybook/ComponentDocs.(tsx|jsx)` copied from this skill's `assets/`
- [ ] `.storybook/foundations/FoundationBlocks.tsx` + `{Colors,Typography,Spacing,Radius}.mdx` copied and filled from `token_file`
- [ ] `.storybook/main.*` `stories` glob includes `.storybook/**/*.mdx`
- [ ] `.storybook/preview.*` sets `options.storySort` (Foundations above Atoms/Molecules/Organisms)

For each component, verify:

- [ ] Story file exists next to the component file
- [ ] `[ComponentName].metadata.ts` exists, is non-empty, and follows `component-metadata-model.md` (has `identity`, `props`, `designTokens` at minimum — never a stub)
- [ ] Analysis fields (`commonPatterns`, `antiPatterns`, `aiHints`) generated via the `ai-component-metadata` skill where the specs don't carry them
- [ ] `parameters.docs.page` renders the shared `ComponentDocs` with this component's `metadata`
- [ ] `tags: ['autodocs']` is set (feeds the interactive Controls block)
- [ ] All props have `argTypes` with appropriate controls
- [ ] Default story exists with sensible default args
- [ ] Every variant has its own named story
- [ ] Interactive states (disabled, loading, error) have stories
- [ ] `metadata.designTokens` values are RESOLVED from `token_file` (real hex/rem, not names)
- [ ] Category (`Atoms/`, `Molecules/`, `Organisms/`) matches the component directory + `components.json` level
- [ ] Design tokens are loaded (preview imports `[token_file]`)
- [ ] Accessibility addon is enabled and no violations flagged

## Updating Stories

When a component is modified during Screen Creation or later:
1. Re-read the component file to detect new props or variants
2. Update the story file AND `[ComponentName].metadata.ts` to reflect changes
3. Re-resolve `metadata.designTokens` values if the component's token usage changed
4. Verify the story + docs page render correctly in Storybook
5. Run the a11y check on the updated story
