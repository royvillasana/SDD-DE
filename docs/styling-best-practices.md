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
✓ GOOD: <Button variant="primary" className="mt-4" />  (layout override is OK)
```

The component file contains all styling logic. The consumer never sees variant
internals — only semantic props. Consumers CAN pass `className` for layout
overrides (margin, positioning), which gets merged last via `cn()`.

---

## Component Variant Architecture — CVA + cn()

Every component uses **Class Variance Authority (CVA)** for variant definitions and a
**`cn()` utility** to merge class names safely. This is the universal pattern regardless
of styling approach.

### Required dependencies

```bash
npm install class-variance-authority clsx
# If using Tailwind, also install:
npm install tailwind-merge
```

### The `cn()` utility

Create `lib/utils.ts` (or equivalent path for your framework):

```ts
// lib/utils.ts — WITH Tailwind
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```ts
// lib/utils.ts — WITHOUT Tailwind (CSS Modules, SCSS, plain CSS)
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
```

### Variant definitions — separate colocated file

For each component, define variants in a **separate file** from the component itself.
This makes variant definitions portable, testable, and framework-agnostic.

```
[component_dir]/
├── ui/
│   ├── button/
│   │   ├── button.variants.ts    ← CVA definition (portable, no JSX)
│   │   ├── Button.tsx            ← React component (consumes variants)
│   │   └── Button.stories.tsx    ← Storybook stories
│   ├── input/
│   │   ├── input.variants.ts
│   │   ├── Input.tsx
│   │   └── Input.stories.tsx
```

### CVA definition example

Variant names and values MUST mirror the design source 1:1. If Figma defines
`Variant = Primary | Secondary | Ghost | Destructive` and `Size = SM | MD | LG`,
the CVA definition must match exactly.

```ts
// button.variants.ts
import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  // Base styles — shared by ALL variants
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:     'bg-[--color-primary] text-[--color-primary-foreground] hover:bg-[--color-primary-hover] shadow-sm',
        secondary:   'bg-[--color-secondary] text-[--color-secondary-foreground] hover:bg-[--color-secondary-hover]',
        tertiary:    'bg-transparent text-[--color-foreground] hover:bg-[--color-muted]',
        outline:     'border border-[--color-border] bg-transparent text-[--color-foreground] hover:bg-[--color-muted]',
        destructive: 'bg-[--color-destructive] text-[--color-destructive-foreground] hover:bg-[--color-destructive]/90',
        ghost:       'text-[--color-foreground] hover:bg-[--color-muted]',
        link:        'text-[--color-primary] underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
```

**Without Tailwind** (plain CSS / CSS Modules), the CVA strings are CSS class names
instead of utility classes:

```ts
// button.variants.ts — plain CSS version
import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva('btn', {
  variants: {
    variant: {
      primary:     'btn-primary',
      secondary:   'btn-secondary',
      tertiary:    'btn-tertiary',
      outline:     'btn-outline',
      destructive: 'btn-destructive',
    },
    size: {
      sm: 'btn-sm',
      md: '',
      lg: 'btn-lg',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

export type ButtonVariants = VariantProps<typeof buttonVariants>;
```

### Component implementation

The component consumes the CVA definition, supports `forwardRef`, spreads native
HTML attributes, and merges `className` **last** via `cn()` so consumers can apply
layout overrides.

```tsx
// Button.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';
import { buttonVariants, type ButtonVariants } from './button.variants';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariants {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, disabled, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={disabled}
        aria-disabled={disabled || undefined}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button };
```

### Key rules

1. **`className` is always last** in `cn()` — this lets consumers override layout
   (margin, position) without fighting the component's internal styles
2. **`forwardRef` is required** — all components must forward refs for composition
3. **Native HTML attributes are spread** via `...props` — components are transparent
   wrappers, not opaque boxes
4. **No inline `style={{}}` for design-system values** — inline styles are only
   allowed for runtime-computed values (e.g., dynamic widths, scroll positions)
5. **Variant types are exported** from the `.variants.ts` file via `VariantProps`
6. **`defaultVariants` must match the design source** — if Figma's default button
   state is "Primary / MD", the CVA defaults must be `{ variant: 'primary', size: 'md' }`

---

## Tailwind CSS

### Configuration

Extend `tailwind.config` to reference CSS custom properties so utilities use
design tokens instead of hardcoded values:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary:     { DEFAULT: 'var(--color-primary)', foreground: 'var(--color-primary-foreground)', hover: 'var(--color-primary-hover)' },
        secondary:   { DEFAULT: 'var(--color-secondary)', foreground: 'var(--color-secondary-foreground)' },
        destructive: { DEFAULT: 'var(--color-destructive)', foreground: 'var(--color-destructive-foreground)' },
        muted:       { DEFAULT: 'var(--color-muted)', foreground: 'var(--color-muted-foreground)' },
        border:      'var(--color-border)',
        ring:        'var(--color-ring)',
        background:  'var(--color-background)',
        foreground:  'var(--color-foreground)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        full: 'var(--radius-full)',
      },
      spacing: {
        // Map token scale to Tailwind spacing
      },
    },
  },
};
```

### Rules (Tailwind path)

1. CVA variant strings use Tailwind utilities — the class composition handles merging
2. `tailwind-merge` (via `cn()`) resolves class conflicts automatically
3. Every color, spacing, and radius in `tailwind.config` references a CSS custom property
4. No hardcoded hex values or magic pixel numbers in component utility classes
5. Consumers pass `className` for layout overrides only (margin, grid placement)

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

All approaches use **CVA for variant definitions** in a colocated `.variants.ts` file
and **`cn()` for class merging**. The styling approach only determines what strings
go inside the CVA definition.

| Styling Approach | CVA strings contain | cn() uses | Anti-Pattern |
|---|---|---|---|
| **Tailwind** | Tailwind utility classes | `clsx` + `twMerge` | Hardcoded hex; no `cn()` merge; inline 30+ classes at usage site |
| **Styled Components** | Data attribute selectors | `clsx` | Prop interpolation for variants; defining in render |
| **Emotion** | Data attribute selectors | `clsx` | Same as Styled Components |
| **CSS Modules** | CSS module class names | `clsx` | Element selectors; circular composes |
| **SCSS** | BEM class names (`btn--primary`) | `clsx` | Nesting > 3 levels; `@extend` across files |
| **Vue Scoped** | Scoped class names | `clsx` | Element selectors; unscoped styles |
| **Svelte** | Scoped class names | `clsx` | `:global()` for child internals |
| **Angular** | Component class names | `clsx` | `::ng-deep`; global stylesheets |
