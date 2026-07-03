# Component Standards

## Atomic Design Hierarchy

All components follow the Atomic Design pattern:

| Level | Definition | Examples |
|---|---|---|
| **Atoms** | Smallest indivisible unit | Button, Input, Badge, Avatar, Icon |
| **Molecules** | 2–3 atoms combined | SearchBar (Input + Button), FormField (Label + Input + Error) |
| **Organisms** | Complex sections from molecules | PricingCard, HeroSection, SiteNav |
| **Templates** | Page shells with content slots | DashboardLayout, MarketingLayout |
| **Pages** | Templates with real content | PricingPage, LandingPage |

## File Structure

Component organization follows the same hierarchy regardless of framework.
See `docs/framework-config.md` for framework-specific file extensions and naming conventions.

```
[component_dir]/           ← value from .sdd-de/project.yaml
├── ui/                    ← Atoms
│   ├── button.[ext]
│   ├── input.[ext]
│   └── badge.[ext]
├── modules/               ← Molecules
│   ├── search-bar.[ext]
│   └── form-field.[ext]
└── sections/              ← Organisms
    ├── site-nav.[ext]
    └── hero-section.[ext]
```

## Style Encapsulation — CVA + cn()

**Components own their styles.** Consumers interact through props and variants.
Consumers CAN pass `className` for layout overrides (margin, position), which
merges last via `cn()`.

```
✗ BAD:  <Button className="bg-blue-500 text-white px-4 py-2 rounded" />
✓ GOOD: <Button variant="primary" size="md" />
✓ GOOD: <Button variant="primary" className="mt-4" />  (layout override OK)
```

### Required architecture

Every component follows this structure:

1. **Variants file** (`button.variants.ts`) — CVA definition, separate from the component.
   Variant names/values mirror the design source 1:1.
2. **Component file** (`Button.tsx`) — consumes variants, supports `forwardRef`,
   spreads native HTML attributes, merges `className` last via `cn()`.
3. **cn() utility** (`lib/utils.ts`) — `clsx` + `tailwind-merge` (Tailwind) or `clsx` alone.

```
✗ BAD:   Variants defined inline inside the component
✓ GOOD:  button.variants.ts (portable) + Button.tsx (consumes it)
```

### Component implementation rules

- `forwardRef` is required on all components
- `className` is always the LAST argument in `cn()` so consumers can override layout
- Native HTML attributes are spread via `...props`
- No inline `style={{}}` for design-system values (colors, spacing, radius, shadows)
- Variant types are exported via `VariantProps<typeof componentVariants>`
- `defaultVariants` must match the default state in the design source

Read `docs/styling-best-practices.md` for the full CVA pattern, `cn()` setup,
and per-framework styling examples.

## Variant Rules

- Define variants explicitly in the component — no ad-hoc style overrides at usage sites
- Variant props/attributes use union types or string literals: `variant: "primary" | "secondary" | "ghost"`
- Size props use union types: `size: "sm" | "md" | "lg"`
- For typed languages (TypeScript, etc.): use discriminated unions for variant definitions
- For CSS-only variants: use data attributes (`data-variant="primary"`) or BEM modifiers (`.btn--primary`)
- Never rely on className/class overrides at the usage site to change a component's variant

## State Requirements

Every interactive component must implement all applicable states:

| State | When required |
|---|---|
| `hover` | Any clickable element |
| `focus` | Any keyboard-focusable element |
| `active` | Buttons, links |
| `disabled` | Buttons, inputs, selects |
| `loading` | Submit buttons, async actions |
| `error` | Inputs, forms |
| `empty` | Lists, tables, cards that display data |

States must be implemented in the component — never delegated to the parent or handled with global styles.

## Component API Rules

- Props/inputs/attributes must be typed — TypeScript interface, PropTypes, Angular `@Input`, Svelte `export let`, or JSDoc
- Required props have no defaults; optional props always have defaults
- Event handler naming: `onClick`, `onSubmit`, `onChange` for React; `@click`, `@submit` for Vue/Angular; `on:click` for Svelte
- No component reads from global state directly — pass data via props/inputs
- Components are self-contained: all styles, tokens, and logic needed to render correctly are within the component

## Accessibility Baseline

- Semantic HTML first: `<button>` for actions, `<a>` for navigation, `<input>` for data entry
- Every icon-only interactive element has `aria-label`
- Every form input has a visible `<label>` (not placeholder-only)
- Color is never the only way information is conveyed — pair color with icon or text
- Focus ring: never `outline: none` without a custom visible focus style
- Contrast: 4.5:1 minimum for normal text, 3:1 for large text and UI components (WCAG AA)
- Disabled elements: use `aria-disabled="true"` for non-native disabled; use `disabled` attribute for native form elements
- Loading elements: use `aria-busy="true"` while loading; announce completion with `aria-live` if needed
