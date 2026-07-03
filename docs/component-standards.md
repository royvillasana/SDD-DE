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

## Style Encapsulation (Epic 1 — Component Library)

**These rules apply to Epic 1 component library code only.** During Epic 2 (page
composition), you are free to use Tailwind utilities or any CSS approach directly in
page-level code. Token references are still required in both epics.

**Components own their styles.** Consumers interact through props and variants — never
through raw class names, utility classes, or style overrides.

```
✗ BAD:  <Button className="bg-blue-500 text-white px-4 py-2 rounded" />
✓ GOOD: <Button variant="primary" size="md" />
```

Read `docs/styling-best-practices.md` for framework-specific patterns.

### Max 2 Classes Rule (Epic 1)

No element in an Epic 1 component should have more than **2 class names**: a base class
(`.btn`) and a variant class (`.btn-primary`). A size modifier (`.btn-lg`) makes 3 max.
All structural styles (layout, spacing, radius, typography, transitions, focus ring) go
in the base CSS class. Variants override **only colors and shadows**.

```html
✗ BAD:   class="inline-flex items-center justify-center whitespace-nowrap rounded-full
               font-semibold bg-primary text-white px-6 py-3 ..."  (30+ classes)
✓ GOOD:  class="btn btn-primary"  (2 classes)
```

### Epic 2 — Free Styling

During page composition, you can use any styling approach for layout, spacing, and
responsive adjustments:
- Tailwind utility classes directly in page markup
- Inline styles for one-off layout values
- CSS classes for reusable page patterns

The only rule that carries over: **all visual values must reference design tokens** — no
hardcoded hex colors or pixel values.

### Per-framework summary (Epic 1 components)

- **Tailwind**: extract base to `@layer components` CSS class. HTML shows `.btn .btn-primary`, never raw utilities.
- **Styled Components / Emotion**: define styled wrappers at module scope. Use data attributes for variants.
- **CSS Modules**: one `.module.css` per component. Use `composes` for shared patterns.
- **SCSS**: one root class with BEM modifiers (`&--primary`). Max 3 levels of nesting.
- **Vue**: always use `<style scoped>`. Use class selectors, never element selectors.
- **Svelte**: styles are auto-scoped. Use CSS custom properties for child theming.
- **Angular**: use ViewEncapsulation. Style via `:host` and co-located `.scss`.

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
