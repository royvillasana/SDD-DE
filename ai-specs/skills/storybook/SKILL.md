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

### Phase 3 — Generate Stories

9. **For each component**, generate a story file next to the component:

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
import { [ComponentName] } from './[ComponentName]';   // named import — matches the named export convention

const meta: Meta<typeof [ComponentName]> = {
  title: '[Category]/[ComponentName]',   // e.g., 'Atoms/Button', 'Molecules/SearchBar'
  component: [ComponentName],
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '[One-line description from the Component Spec]',
      },
    },
  },
  argTypes: {
    // Map every prop with controls
    // variant: { control: 'select', options: ['primary', 'secondary', 'ghost'] },
    // disabled: { control: 'boolean' },
    // size: { control: 'radio', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof [ComponentName]>;
```

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

14. **For each component**, the `tags: ['autodocs']` in the meta object will auto-generate a documentation page from the component's props, JSDoc/TSDoc comments, and story definitions. No separate docs page is needed per component.

### Phase 5 — Verify (do NOT start a blocking server)

15. **Verify the setup — never launch a long-running dev server here.** You are
    running head-less; `npm run storybook` is a foreground process that never
    exits, so starting it would hang this run. VortSpec's Playground starts and
    serves Storybook for the user. Instead, confirm the setup is complete and
    every built component has a story:
```bash
ls .storybook/main.* && node -e "process.exit(require('./package.json').scripts?.storybook?0:1)"
find [component_dir] -name "*.stories.*" | wc -l   # should match the component count
```
    If a story is missing for any built component, generate it now (Phase 3).
    Storybook opens at `http://localhost:6006` when the user runs the Playground.

16. **Announce**:

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
 Every component shows:
   • Live interactive preview with controls
   • All variants and states as separate stories
   • Auto-generated documentation from props/types
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

For each component, verify:

- [ ] Story file exists next to the component file
- [ ] `tags: ['autodocs']` is set for auto-documentation
- [ ] All props have `argTypes` with appropriate controls
- [ ] Default story exists with sensible default args
- [ ] Every variant has its own named story
- [ ] Interactive states (disabled, loading, error) have stories
- [ ] Component description is populated from the Component Spec
- [ ] Category (`Atoms/`, `Molecules/`, `Organisms/`) matches the component directory
- [ ] Design tokens are loaded (preview imports `[token_file]`)
- [ ] Accessibility addon is enabled and no violations flagged

## Updating Stories

When a component is modified during Screen Creation or later:
1. Re-read the component file to detect new props or variants
2. Update the story file to reflect changes
3. Verify the story renders correctly in Storybook
4. Run the a11y check on the updated story
