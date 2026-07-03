# Styling Best Practices

This document defines how components must handle styles for each supported styling
approach. The core rule: **components own their styles**. Consumers should never
need to pass utility classes or override internals to use a component correctly.

Read `.sdd-de/project.yaml` → `styling` to determine which section applies.

---

## Epic 1 vs Epic 2 — Styling Scope

These rules apply differently depending on which epic you are in:

| | Epic 1 — Component Library | Epic 2 — Page Composition |
|---|---|---|
| **Styling approach** | CSS base classes + token variables | Any approach (Tailwind, utilities, etc.) |
| **Classes in markup** | Max 2 per element (`.btn .btn-primary`) | Unlimited — use whatever is fastest |
| **Token references** | Required — no hardcoded values | Required — no hardcoded values |
| **Encapsulation** | Component owns all its styles internally | Pages compose components freely |

**Why the distinction?** Epic 1 components are the foundation — they must be sustainable,
framework-portable, and readable by any developer or AI agent. CSS base classes achieve this.
Epic 2 pages are compositions that consume those components. Page-level layout, spacing,
and responsive adjustments can use whatever styling approach the user prefers (Tailwind
utilities, inline styles, CSS classes, etc.) as long as design token variables are used
for all visual values.

---

## Universal Principle — Style Encapsulation (Epic 1)

Every component must encapsulate its visual presentation internally.
Consumers interact with the component through **props and variants**, never through
raw class names or style overrides.

```
✗ BAD:  <Button className="bg-blue-500 text-white px-4 py-2 rounded-md" />
✓ GOOD: <Button variant="primary" />
```

The component file contains all styling logic. The consumer never sees CSS, utility
classes, or style objects — only semantic props.

---

## The Nesting Rule — Max 2 Visible Classes Per Element

**No element in a component's rendered HTML should have more than 2 class names visible
in the markup.** All base styles must be extracted to a CSS class. The only classes in
the HTML are:

1. The **base class** (e.g., `.btn`) — contains ALL shared structural styles
2. The **variant class** (e.g., `.btn-primary`) — contains ONLY the visual overrides

This applies to every styling approach. The goal is readable HTML where you can
instantly see what an element IS (base) and which VARIANT it uses, without wading
through 30+ utility classes.

```html
✗ BAD (30+ classes, unreadable):
<a class="inline-flex items-center justify-center whitespace-nowrap rounded-full
   font-semibold leading-none cursor-pointer border-[length:var(--btn-border-width)]
   transition-[color,background-color,border-color,box-shadow] bg-primary
   text-on-primary border-transparent shadow-[var(--btn-primary-shadow)]
   hover:bg-primary/90 focus-visible:outline-2 h-11 px-6 text-base
   gap-2 w-full md:w-auto">Get Started</a>

✓ GOOD (2 classes, instantly readable):
<button class="btn btn-primary">Get Started</button>

✓ GOOD with size variant (3 classes max):
<button class="btn btn-primary btn-lg">Get Started</button>
```

### How to extract base styles

Define the base class in your token file or a component CSS file. The base class
contains everything that's true for ALL variants: layout, spacing, radius, typography,
transitions, focus ring, cursor. The variant class overrides ONLY colors and shadows.

```css
/* In your token file or component CSS */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  white-space: nowrap;
  border-radius: var(--radius-full);
  padding: var(--btn-padding-y) var(--btn-padding-x);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  line-height: 1;
  cursor: pointer;
  border: var(--btn-border-width) solid transparent;
  transition: color 0.15s, background-color 0.15s, border-color 0.15s, box-shadow 0.15s;
  width: 100%;
}

@media (min-width: 768px) {
  .btn { width: auto; }
}

.btn:focus-visible {
  outline: 2px solid var(--color-ring);
  outline-offset: 2px;
}

.btn:disabled,
.btn[aria-disabled="true"] {
  opacity: 0.5;
  pointer-events: none;
}

/* Variants — ONLY visual overrides */
.btn-primary {
  background: var(--color-primary);
  color: var(--color-primary-foreground);
  box-shadow: var(--btn-primary-shadow);
}
.btn-primary:hover { background: var(--color-primary-hover); }

.btn-secondary {
  background: var(--color-secondary);
  color: var(--color-secondary-foreground);
}
.btn-secondary:hover { background: var(--color-secondary-hover); }

.btn-tertiary {
  background: transparent;
  color: var(--color-foreground);
}
.btn-tertiary:hover { background: var(--color-muted); }

.btn-outline {
  background: transparent;
  color: var(--color-foreground);
  border-color: var(--color-border);
}
.btn-outline:hover {
  background: var(--color-muted);
  border-color: var(--color-foreground);
}

/* Sizes */
.btn-sm { padding: var(--spacing-1) var(--spacing-3); font-size: var(--font-size-sm); }
.btn-lg { padding: var(--spacing-3) var(--spacing-6); font-size: var(--font-size-lg); }
```

### The component file is minimal

With base styles in CSS, the component file has almost no styling logic:

```tsx
// Button.tsx — clean, readable, maintainable
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', disabled, children }: ButtonProps) {
  const sizeClass = size !== 'md' ? ` btn-${size}` : '';
  return (
    <button
      className={`btn btn-${variant}${sizeClass}`}
      disabled={disabled}
      aria-disabled={disabled || undefined}
    >
      {children}
    </button>
  );
}
```

---

## Tailwind CSS

### The Problem

Tailwind's utility-first approach can produce 30+ classes per element, making HTML
unreadable and unmaintainable. Arbitrary value syntax like `border-[length:var(--x)]`
makes it worse.

### The Solution — CSS Base + Tailwind Overrides

Extract all shared styles to a CSS base class using `@layer components`. The HTML
only shows the base class and variant class — never raw utilities.

```css
/* globals.css or tokens.css */
@layer components {
  .btn {
    @apply inline-flex items-center justify-center whitespace-nowrap
           rounded-full font-semibold leading-none cursor-pointer
           transition-colors w-full md:w-auto;
    padding: var(--btn-padding-y) var(--btn-padding-x);
    border: var(--btn-border-width) solid transparent;
    font-size: var(--font-size-base);
    gap: var(--spacing-2);
  }

  .btn:focus-visible {
    @apply outline-2 outline-offset-2;
    outline-color: var(--color-ring);
  }

  .btn:disabled { @apply opacity-50 pointer-events-none; }

  .btn-primary {
    background: var(--color-primary);
    color: var(--color-primary-foreground);
    box-shadow: var(--btn-primary-shadow);
  }
  .btn-primary:hover { background: var(--color-primary-hover); }

  .btn-secondary {
    background: var(--color-secondary);
    color: var(--color-secondary-foreground);
  }
  .btn-secondary:hover { background: var(--color-secondary-hover); }

  .btn-tertiary { background: transparent; color: var(--color-foreground); }
  .btn-tertiary:hover { background: var(--color-muted); }

  .btn-outline {
    background: transparent;
    color: var(--color-foreground);
    border-color: var(--color-border);
  }
  .btn-outline:hover { background: var(--color-muted); border-color: var(--color-foreground); }

  .btn-sm { padding: var(--spacing-1) var(--spacing-3); font-size: var(--font-size-sm); }
  .btn-lg { padding: var(--spacing-3) var(--spacing-6); font-size: var(--font-size-lg); }
}
```

```tsx
// Button.tsx — 2 classes, not 30
export function Button({ variant = 'primary', size = 'md', disabled, children }) {
  const sizeClass = size !== 'md' ? ` btn-${size}` : '';
  return (
    <button className={`btn btn-${variant}${sizeClass}`} disabled={disabled}>
      {children}
    </button>
  );
}
```

### When standalone `@apply` Is Acceptable

For **single HTML elements** repeated across files where a full component feels
heavy (e.g., a consistent link style), define a custom class:

```css
@layer components {
  .link-primary {
    color: var(--color-primary);
    text-decoration-line: underline;
    text-underline-offset: 2px;

    &:hover {
      color: var(--color-primary-hover);
    }
  }
}
```

Never use `@layer components` for multi-element patterns. Use a framework
component instead.

### Rules

1. All Tailwind utilities live inside the component file — never at the usage site
2. Map variant props to CSS class names (e.g., `btn-${variant}`)
3. Every color, spacing, and radius value references a CSS custom property (design token)
4. Consumers only pass variant props: `variant`, `size`, `disabled`, `loading`
5. For dynamic values from external sources, use inline style CSS custom properties

---

## Styled Components / Emotion (CSS-in-JS)

### Component Selector Pattern

Define styled wrappers at **module scope** (never inside render). Use the
component selector `${ChildComponent}` to style children from the parent:

```tsx
// ✓ Card.tsx
const CardImage = styled.img`
  width: 100%;
  border-radius: var(--radius-md);
`;

const CardTitle = styled.h3`
  font-size: var(--font-size-lg);
  color: var(--color-text);
`;

const CardRoot = styled.article`
  padding: var(--spacing-lg);
  background: var(--color-surface);
  border-radius: var(--radius-lg);

  &:hover ${CardTitle} {
    color: var(--color-primary);
  }
`;

export function Card({ title, image }: CardProps) {
  return (
    <CardRoot>
      <CardImage src={image} alt="" />
      <CardTitle>{title}</CardTitle>
    </CardRoot>
  );
}
```

### Variants via Data Attributes (Not Prop Interpolation)

Prop interpolation generates a new CSS class per variant value. Use data
attributes for finite variant sets — one cached CSS rule:

```tsx
// ✗ BAD — new class per variant
const Button = styled.button<{ $variant: string }>`
  background: ${p => p.$variant === 'primary' ? 'var(--color-primary)' : 'var(--color-secondary)'};
`;

// ✓ GOOD — single static CSS rule
const Button = styled.button`
  background: var(--color-secondary);

  &[data-variant='primary'] {
    background: var(--color-primary);
    color: white;
  }

  &[data-variant='destructive'] {
    background: var(--color-destructive);
    color: white;
  }
`;

// Usage: <Button data-variant="primary">Save</Button>
```

### CSS Custom Properties for Dynamic Values

Never use prop interpolation for rapidly changing values (mouse position, scroll,
animation). Use CSS custom properties:

```tsx
// ✓ Single class, value updates via native CSS
const ProgressBar = styled.div`
  width: var(--progress, 0%);
  background: var(--color-primary);
  height: 4px;
  transition: width 0.2s;
`;

// Usage: <ProgressBar style={{ '--progress': `${percent}%` }} />
```

### Extending Styles

Build variant hierarchies through `styled()` extension, not prop ternaries:

```tsx
const BaseButton = styled.button`
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  border: none;
  cursor: pointer;
`;

const PrimaryButton = styled(BaseButton)`
  background: var(--color-primary);
  color: white;
`;

const GhostButton = styled(BaseButton)`
  background: transparent;
  color: var(--color-text);
`;
```

### Rules

1. Define all styled components at **module scope** — never inside a render function
2. Use data attributes for variant styling, not prop interpolation
3. Use CSS custom properties for dynamic or frequently changing values
4. Use `.attrs()` for per-frame updates (animations, mouse tracking)
5. Use `&&` for specificity boosts instead of `!important`
6. Memoize theme objects passed to `<ThemeProvider>`
7. Every value references a design token variable

---

## CSS Modules

### One Module Per Component

Each component gets a co-located `.module.css` file. Class names are auto-scoped:

```css
/* Button.module.css */
.root {
  display: inline-flex;
  align-items: center;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  padding: var(--spacing-sm) var(--spacing-md);
}

.primary {
  composes: root;
  background: var(--color-primary);
  color: white;
}

.secondary {
  composes: root;
  background: var(--color-secondary);
  color: var(--color-text);
}

.disabled {
  opacity: 0.5;
  pointer-events: none;
}
```

```tsx
import styles from './Button.module.css';

export function Button({ variant = 'primary', disabled, children }: ButtonProps) {
  const className = [
    styles[variant],
    disabled && styles.disabled,
  ].filter(Boolean).join(' ');

  return <button className={className} disabled={disabled}>{children}</button>;
}
```

### Use `composes` for Reuse

The `composes` keyword is the CSS Modules equivalent of inheritance. Use it
instead of duplicating declarations or Sass mixins:

```css
/* shared.module.css */
.focusRing {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

/* Button.module.css */
.root {
  composes: focusRing from './shared.module.css';
}
```

### Rules

1. One `.module.css` file per component, co-located next to the component file
2. Use `composes` for shared style patterns — no duplication
3. Use class selectors, not element selectors (performance)
4. Map variants to class names via a lookup (object or switch)
5. Every value references a CSS custom property (design token)

---

## SCSS / Sass

### Nesting and BEM

Use BEM naming with Sass nesting. The component's root class contains all styles:

```scss
// Button.scss
.btn {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  border: none;
  cursor: pointer;
  transition: background 0.2s;

  // Variants
  &--primary {
    background: var(--color-primary);
    color: white;

    &:hover {
      background: var(--color-primary-hover);
    }
  }

  &--secondary {
    background: var(--color-secondary);
    color: var(--color-text);
  }

  &--ghost {
    background: transparent;
    color: var(--color-text);
  }

  // States
  &:disabled,
  &--disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  &--loading {
    position: relative;
    pointer-events: none;
  }

  // Sizes
  &--sm { padding: var(--spacing-xs) var(--spacing-sm); font-size: var(--font-size-sm); }
  &--lg { padding: var(--spacing-md) var(--spacing-lg); font-size: var(--font-size-lg); }
}
```

### Rules

1. One root class per component — all variants and states nest inside it
2. Use BEM modifiers (`&--variant`) for variants, not separate root classes
3. Use Sass variables only for local computation — all visual values reference CSS custom properties
4. Keep nesting to 3 levels maximum
5. Never use `@extend` across files — use mixins or CSS custom properties instead

---

## Vue Scoped Styles

### Default: `<style scoped>`

All styles are scoped via `data-v-[hash]` attributes. No class name conflicts:

```vue
<template>
  <button :class="['btn', `btn--${variant}`]" :disabled="disabled">
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
}>();
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
}

.btn--primary {
  background: var(--color-primary);
  color: white;
}

.btn--secondary {
  background: var(--color-secondary);
  color: var(--color-text);
}
</style>
```

### Rules

1. Always use `<style scoped>` — never unscoped unless applying global resets
2. Use **class selectors**, not element selectors (element + attribute is slow)
3. Use `:deep()` sparingly — only for third-party component overrides
4. Use `v-bind()` in CSS for reactive style values tied to component state
5. Prefer CSS custom properties over `:deep()` for child component theming

---

## Svelte Component Styles

### Default: Automatic Scoping

Svelte scopes all `<style>` rules to the component automatically:

```svelte
<script lang="ts">
  let { variant = 'primary', disabled = false }: {
    variant?: 'primary' | 'secondary' | 'ghost';
    disabled?: boolean;
  } = $props();
</script>

<button class="btn btn--{variant}" {disabled}>
  <slot />
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-md);
    border: none;
    cursor: pointer;
  }

  .btn--primary {
    background: var(--color-primary);
    color: white;
  }

  .btn--secondary {
    background: var(--color-secondary);
    color: var(--color-text);
  }
</style>
```

### Rules

1. Styles are scoped by default — never use `:global()` to style child component internals
2. Use **CSS custom properties** for theming child components: `<Child --color="red" />`
3. Use the class object/array syntax for dynamic classes (Svelte 5.16+)
4. Keep `:global()` for truly global rules only (body resets, keyframe names)

---

## Angular Component Styles

### Default: ViewEncapsulation.Emulated

Angular scopes styles per component using `_nghost-*` and `_ngcontent-*` attributes:

```typescript
@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'ghost' = 'primary';
  @Input() disabled = false;
}
```

```scss
// button.component.scss
:host {
  display: inline-flex;
}

.btn {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);

  &.primary {
    background: var(--color-primary);
    color: white;
  }

  &.secondary {
    background: var(--color-secondary);
  }
}
```

### Rules

1. Use `:host` for the component's own element styles
2. Use `::ng-deep` only as a last resort for third-party overrides — it is deprecated
3. Prefer CSS custom properties for theming child components
4. Co-locate styles in the component's `.scss` file — no shared global stylesheets for component visuals

---

## Summary — Decision Table

| Styling Approach | Where Styles Live | Variant Pattern | Anti-Pattern |
|---|---|---|---|
| **Tailwind** | `@layer components` CSS base classes | Props → CSS class name | Utility classes in Epic 1 component markup |
| **Styled Components** | Module-scope styled wrappers | Data attributes | Prop interpolation for variants; defining in render |
| **Emotion** | Module-scope styled wrappers | Data attributes | Same as Styled Components |
| **CSS Modules** | `.module.css` next to component | `composes` + class lookup | Element selectors; circular composes |
| **SCSS** | `.scss` next to component | BEM modifiers (`&--variant`) | Nesting > 3 levels; `@extend` across files |
| **Vue Scoped** | `<style scoped>` in SFC | Class binding + BEM | Element selectors; unscoped styles |
| **Svelte** | `<style>` in SFC (auto-scoped) | Class binding + BEM | `:global()` for child internals |
| **Angular** | `.scss` in component decorator | Class binding + BEM | `::ng-deep`; global stylesheets |
