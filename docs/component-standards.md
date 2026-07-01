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

```
src/
├── components/
│   ├── ui/            ← Atoms (shadcn/ui + custom)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── badge.tsx
│   ├── modules/       ← Molecules
│   │   ├── search-bar.tsx
│   │   └── form-field.tsx
│   └── sections/      ← Organisms
│       ├── site-nav.tsx
│       └── hero-section.tsx
```

## Variant Rules

- Use `cva` (class-variance-authority) for variant management
- Every component with visual variants must define them explicitly — no ad-hoc className overrides at usage sites
- Variant props use union types: `variant: "primary" | "secondary" | "ghost"`
- Size props use union types: `size: "sm" | "md" | "lg"`

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

## Accessibility Baseline

- Semantic HTML first: `<button>` for actions, `<a>` for navigation, `<input>` for data entry
- Every icon-only element has `aria-label`
- Every form input has a visible `<label>` (not placeholder-only)
- Color is never the only way information is conveyed (use icon + color, or text + color)
- Focus ring: never `outline: none` without a custom focus style
- Contrast: 4.5:1 for normal text, 3:1 for large text and UI components (WCAG AA)
