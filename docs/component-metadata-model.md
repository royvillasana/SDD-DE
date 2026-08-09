# Component Metadata Model

Every design-system component has a metadata record at `.vortspec/metadata/<name>.json`. This is the
**structured, AI-consumable record** of what the component is, how to use it, and which tokens it
consumes. It powers two things:

1. **Rich Storybook docs** — the shared `.storybook/ComponentDocs` renderer reads it to build the
   component's autodocs page (Identity, Props, Item Shape, Common Patterns, Anti-Patterns, States,
   Accessibility, Design Tokens, AI Generation Hints, Keywords, Generation Rules).
2. **AI-assisted generation** — downstream tools read it to reuse the component correctly
   (right variant, right pattern, accessibility preserved) instead of re-inventing markup.

It is the design-system twin of the [Design Token Model](design-token-model.md): tokens define the
values, metadata defines each component's *meaning and usage*.

> **The record is VortSpec-owned, and Storybook READS it.** It used to be a `<Name>.metadata.ts`
> authored by `/storybook` in the component directory. That made metadata a Storybook feature: a
> project without Storybook had none at all, and the agent composing screens had nothing to read.
> Two writers also meant two truths that drift. `/generate-artifacts` writes the record; `/storybook`
> renders it; nothing else authors one.

## The three-file component set

| File | Owner | Purpose |
|---|---|---|
| `<Name>.tsx` | implementation | the component (CVA variants + `cn()` + `forwardRef`) |
| `<Name>.stories.tsx` | `/storybook` | stories (Default + one per variant/state) + `docs.page` wiring |
| `.vortspec/metadata/<name>.json` | `/generate-artifacts` (step 3b) | the structured metadata below |

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
  useCases?: string[],           // WHEN to reach for this component — see the rule below
  notFor?: { situation, use }[],  // when to reach for a DIFFERENT component — see the rule below
  states?: { state, description }[],
  accessibility?: { role?, keyboard?, screenReader?, wcag?, notes?: string[] },
  commonPatterns?: { name, description, code }[],
  antiPatterns?: { pattern, why, instead }[],
  aiHints?: {
    context?: string,
    selectionCriteria?: string[],   // ARRAY, one criterion per entry — not a sentence
    keywords?: string[],
    generationRules?: string[],
  },
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

## `useCases` — the field an agent reads first

`useCases` says WHEN to reach for this component, in the words someone would use to describe the job:
`"a single freestanding action in a form footer"`, `"grouping related content on its own surface"`.

It is the highest-value field in the record and the easiest to omit, because a component's *purpose*
feels obvious to whoever just built it. It is not obvious to a generator choosing between forty
components, and without it the model falls back to matching on NAME — which is how a `Card` gets used
for a banner and a `Badge` for a button.

- One entry per distinct job. Three specific ones beat a paragraph.
- Describe the SITUATION, not the component. "Confirming a destructive action" — not "a red button".
- It is distinct from `aiHints.selectionCriteria`: use cases say when to reach for the component at
  all, selection criteria say why THIS one rather than its siblings.

## `notFor` — the negative selection signal

`useCases` says when to reach for this component. `notFor` says when NOT to, and **which component to
reach for instead**:

```ts
notFor: [
  { situation: "navigating to another page or view", use: "Link — it renders an anchor and gets browser navigation, middle-click and open-in-new-tab for free" },
  { situation: "a row of related actions the user picks between", use: "ButtonGroup — it owns the spacing and the segmented selection state" },
]
```

**This is NOT the same as `antiPatterns`, and conflating them loses the useful half.** An anti-pattern
is about MISUSING this component — restyling it with inline styles, nesting it where it does not
belong. `notFor` is about SELECTION: the component is fine, it is simply the wrong one for this job.
A generator choosing between forty components needs the second far more than the first, and today it
is buried among implementation warnings or missing entirely.

- Every entry MUST name the alternative in `use`. "Do not use this for navigation" without naming
  `Link` leaves the model to guess, and it will guess a variant of the component it already has.
- Write the situations someone would actually reach for it in wrongly — the near misses, not absurd
  ones. "Do not use Button as a page layout" helps nobody.
- Two or three entries is usually the whole truth. A component with ten is probably doing too much.

## Rules

- **Resolve token values at generation time.** Embed real hex/rem in `designTokens` (deterministic,
  matches what the component renders). Re-running `/storybook` refreshes them after a token change.
- **Omit empty sections.** Only include `itemShape` for object/array props, `designTokens.shadows`
  when the component casts a shadow, etc.
- **Keep `commonPatterns[].code` runnable** — real, copy-pasteable JSX using the component's real API.
- **Category matches the atomic tier** used everywhere else (`ui/`→atom, `modules/`→molecule,
  `sections/`→organism); keep it in sync with `components.json` and `DESIGN.md`.
