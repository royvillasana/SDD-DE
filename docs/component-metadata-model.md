# Component Metadata Model

Every design-system component ships a `<Name>.metadata.ts` alongside its component and stories
files. This is the **structured, AI-consumable record** of what the component is, how to use it,
and which tokens it consumes. It powers two things:

1. **Rich Storybook docs** — the shared `.storybook/ComponentDocs` renderer reads it to build the
   component's autodocs page (Identity, Props, Item Shape, Common Patterns, Anti-Patterns, States,
   Accessibility, Design Tokens, AI Generation Hints, Keywords, Generation Rules).
2. **AI-assisted generation** — downstream tools read it to reuse the component correctly
   (right variant, right pattern, accessibility preserved) instead of re-inventing markup.

It is the design-system twin of the [Design Token Model](design-token-model.md): tokens define the
values, metadata defines each component's *meaning and usage*.

## The three-file component set

| File | Owner | Purpose |
|---|---|---|
| `<Name>.tsx` | implementation | the component (CVA variants + `cn()` + `forwardRef`) |
| `<Name>.stories.tsx` | `/storybook` | stories (Default + one per variant/state) + `docs.page` wiring |
| `<Name>.metadata.ts` | `/storybook` | the structured metadata below |

Plus two **shared** files per project (authored once): `.storybook/ComponentDocs.(tsx\|jsx)` (the docs
renderer) and `.storybook/foundations/*.mdx` (the token Foundations pages).

## Schema

```ts
export const metadata = {
  identity: {
    name: string,
    category: "atom" | "molecule" | "organism" | "template",
    type: "interactive" | "display" | "input" | "container" | "navigation",
    description: string,          // one line: what it is for
    importPath: string,           // e.g. "@/components/Accordion/Accordion"
    figmaFile?: string,           // Figma file key
    figmaNode?: string,           // component-set node id
  },
  props?: { name, type, default?, description }[],
  itemShape?: { field, type, required, description }[],   // for object/array props
  designTokens?: {
    colors?:     { role, value }[],   // resolved values (hex/rgb)
    typography?: { role, value }[],
    spacing?:    { role, value }[],   // covers margins (same scale)
    shadows?:    { role, value }[],
    radius?:     { role, value }[],
  },
  states?: { state, description }[],
  accessibility?: { role?, keyboard?, screenReader?, wcag?, notes?: string[] },
  commonPatterns?: { name, description, code }[],
  antiPatterns?: { pattern, why, instead }[],
  aiHints?: { context?, keywords?: string[], generationRules?: string[] },
} as const;
```

## Where each field comes from (source of truth — do NOT re-derive)

| Metadata field | Source |
|---|---|
| `identity.category` / `figmaFile` / `figmaNode` | `.sdd-de/components.json` (`level`, `figmaNodeId`, `componentKey`) |
| `identity.importPath` / `type` / `description` | Component Spec header + component export |
| `props` / `itemShape` | Component Spec "Props / API" table + the component's TS types |
| `designTokens` | Component Spec "Design Tokens Used" table, **values resolved from `token_file`** |
| `states` | Component Spec "States" table + Interaction Spec |
| `accessibility` | Component Spec "Accessibility" section |
| `commonPatterns` | Component Spec "Common Patterns" section |
| `antiPatterns` | Component Spec "Anti-Patterns" section (was the free-text "Do Not") |
| `aiHints` | Component Spec "AI Usage Hints" section |

Because the Component/Interaction Specs already capture variants, states, sizes, props, ARIA/keyboard/
WCAG, token usage, patterns, and anti-patterns, generating the metadata is a **mechanical transform of
the specs**, not a fresh analysis. The one thing to compute is resolving each used token name to its
value via `token_file`.

## Rules

- **Resolve token values at generation time.** Embed real hex/rem in `designTokens` (deterministic,
  matches what the component renders). Re-running `/storybook` refreshes them after a token change.
- **Omit empty sections.** Only include `itemShape` for object/array props, `designTokens.shadows`
  when the component casts a shadow, etc.
- **Keep `commonPatterns[].code` runnable** — real, copy-pasteable JSX using the component's real API.
- **Category matches the atomic tier** used everywhere else (`ui/`→atom, `modules/`→molecule,
  `sections/`→organism); keep it in sync with `components.json` and `DESIGN.md`.
