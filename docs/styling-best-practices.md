# Styling Best Practices

This document defines how components must handle styles for each supported styling
approach. The core rule: **components own their styles**. Consumers should never
need to pass utility classes or override internals to use a component correctly.

Read `.sdd-de/project.yaml` → `styling` to determine which section applies.

---

## Universal Principle — Style Encapsulation

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

## Tailwind CSS

### The Problem

Tailwind's utility-first approach can scatter dozens of class names across every
usage site, making components hard to maintain and inconsistent across a codebase.

### The Solution — Component Wrapper Pattern

Wrap Tailwind utilities inside the component. Expose variants as props. Use a
class variance utility like `cva` or `clsx` to map variants to class lists.

```tsx
// ✓ Button.tsx — styles live here, not at the usage site
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2',
  {
    variants: {
      variant: {
        primary:     'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]',
        secondary:   'bg-[var(--color-secondary)] text-[var(--color-text)] hover:bg-[var(--color-secondary-hover)]',
        ghost:       'bg-transparent hover:bg-[var(--color-surface-hover)]',
        destructive: 'bg-[var(--color-destructive)] text-white hover:bg-[var(--color-destructive-hover)]',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  disabled?: boolean;
}

export function Button({ variant, size, disabled, children }: ButtonProps) {
  return (
    <button className={buttonVariants({ variant, size })} disabled={disabled}>
      {children}
    </button>
  );
}
```

### When `@layer components` Is Acceptable

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
2. Use `cva`, `clsx`, or `cn()` to map variant props to class lists
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
| **Tailwind** | Inside component via `cva`/`clsx` | Props → class map | Utility classes at usage site |
| **Styled Components** | Module-scope styled wrappers | Data attributes | Prop interpolation for variants; defining in render |
| **Emotion** | Module-scope styled wrappers | Data attributes | Same as Styled Components |
| **CSS Modules** | `.module.css` next to component | `composes` + class lookup | Element selectors; circular composes |
| **SCSS** | `.scss` next to component | BEM modifiers (`&--variant`) | Nesting > 3 levels; `@extend` across files |
| **Vue Scoped** | `<style scoped>` in SFC | Class binding + BEM | Element selectors; unscoped styles |
| **Svelte** | `<style>` in SFC (auto-scoped) | Class binding + BEM | `:global()` for child internals |
| **Angular** | `.scss` in component decorator | Class binding + BEM | `::ng-deep`; global stylesheets |
