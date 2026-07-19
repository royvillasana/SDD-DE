# Framework Configuration

This document defines framework-specific conventions for SDD-DE projects.
Read `.sdd-de/project.yaml` first to determine which section applies to your project.

---

## Configuration Schema

`.sdd-de/project.yaml`:

```yaml
framework: react           # react | next | vue | nuxt | svelte | sveltekit | angular | astro | vanilla
language: typescript       # typescript | javascript
styling: css-modules       # css | css-modules | scss | tailwind | styled-components | emotion
token_file: src/styles/tokens.css   # path to your design token file
component_dir: src/components       # root component directory
test_runner: vitest        # vitest | jest | playwright | cypress | none
```

All generated code, file extensions, imports, and framework idioms must match the values in this file.

---

## React (Vite / CRA)

**Component file**: `src/components/[category]/[ComponentName].[tsx|jsx]`

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = 'primary', disabled, children, onClick }: ButtonProps) {
  return (
    <button
      className={`btn btn--${variant}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

**Variant management**: CVA in a colocated `.variants.ts` file + `cn()` utility for class merging.
**Token file**: `src/styles/tokens.css` or `src/index.css`.

---

## Next.js (App Router)

**Component file**: `src/components/[category]/[ComponentName].tsx`
**Page file**: `app/[page]/page.tsx`

```tsx
// app/dashboard/page.tsx
import type { Metadata } from 'next';
import { HeroSection } from '@/components/sections/hero-section';

export const metadata: Metadata = {
  title: 'Dashboard — Brand',
  description: '150 chars max.',
};

export default function DashboardPage() {
  return (
    <main id="main-content">
      <HeroSection />
    </main>
  );
}
```

- Server Components by default; add `'use client'` only for `useState`, `useEffect`, event handlers, or browser APIs.
- **Token file**: `app/globals.css`.
- **Imports**: use `@/` alias for `src/`.

---

## Vue 3 (Vite)

**Component file**: `src/components/[category]/[ComponentName].vue`

```vue
<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
}
const props = withDefaults(defineProps<Props>(), { variant: 'primary', disabled: false });
const emit = defineEmits<{ click: [] }>();
</script>

<template>
  <button
    :class="['btn', `btn--${variant}`]"
    :disabled="disabled"
    @click="emit('click')"
  >
    <slot />
  </button>
</template>

<style scoped>
.btn { background: var(--color-brand-primary); }
</style>
```

**Composables**: `src/composables/` for shared logic.
**Token file**: `src/assets/tokens.css` or `src/styles/tokens.css`.

---

## Nuxt 3

**Component file**: `components/[ComponentName].vue` (auto-imported)
**Page file**: `pages/[page].vue`

```vue
<!-- pages/dashboard.vue -->
<script setup lang="ts">
useSeoMeta({
  title: 'Dashboard — Brand',
  description: '150 chars max.',
});
</script>

<template>
  <main id="main-content">
    <HeroSection />
  </main>
</template>
```

**Token file**: `assets/css/tokens.css`.
**Composables**: `composables/` directory.

---

## Svelte / SvelteKit

**Component file**: `src/lib/components/[ComponentName].svelte`
**Page file** (SvelteKit): `src/routes/[page]/+page.svelte`

```svelte
<script lang="ts">
  export let variant: 'primary' | 'secondary' | 'ghost' = 'primary';
  export let disabled: boolean = false;
</script>

<button class="btn btn--{variant}" {disabled} on:click>
  <slot />
</button>

<style>
  .btn { background: var(--color-brand-primary); }
</style>
```

**Token file**: `src/app.css` or `src/lib/styles/tokens.css`.
**Stores**: `src/lib/stores/` for shared state.

---

## Angular

**Component directory**: `src/app/components/[component-name]/`
**Files**: `[name].component.ts`, `[name].component.html`, `[name].component.scss`

```typescript
// button.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'ghost' = 'primary';
  @Input() disabled = false;
  @Output() clicked = new EventEmitter<void>();
}
```

```html
<!-- button.component.html -->
<button [class]="'btn btn--' + variant" [disabled]="disabled" (click)="clicked.emit()">
  <ng-content />
</button>
```

**Token file**: `src/styles/tokens.css` (imported in `angular.json` styles array).
**Feature modules**: `src/app/features/[feature]/`.

---

## Astro

**Component file**: `src/components/[ComponentName].astro`
**Page file**: `src/pages/[page].astro`

```astro
---
// src/components/Button.astro
interface Props {
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
}
const { variant = 'primary', disabled = false } = Astro.props;
---

<button class={`btn btn--${variant}`} disabled={disabled}>
  <slot />
</button>

<style>
  .btn { background: var(--color-brand-primary); }
</style>
```

**Token file**: `src/styles/tokens.css`.
**Islands**: use React/Vue/Svelte with `client:load` for interactive components.

---

## Vanilla HTML / CSS / JS

**Component**: Each UI component is a reusable HTML partial with its own CSS file.
**Token file**: `css/tokens.css` (imported first in `main.css`).

```html
<!-- components/button.html -->
<button class="btn btn--primary">
  Label
</button>
```

```css
/* components/button.css */
.btn { background: var(--color-brand-primary); }
.btn--primary { color: var(--color-background); }
```

**Module pattern**: ES modules with `export` / `import` for JavaScript.

---

## Styling: Tailwind CSS

When `styling: tailwind`, token references use CSS variable syntax inside utility classes:

```html
<button class="bg-[var(--color-brand-primary)] px-[var(--spacing-4)]">
```

**Token file**: `tailwind.config.js` (extends `theme.extend`) + a base CSS file for non-Tailwind overrides.

---

## Styling: SCSS / Sass

Token file uses SCSS variables:

```scss
// tokens.scss
$color-brand-primary: #F4A500;
$spacing-4: 16px;

// Component usage
.btn {
  background: $color-brand-primary;
  padding: $spacing-4;
}
```

---

## Preview-Addressable Screens

Implements the **Preview-Addressable Screens** standard in `docs/page-standards.md`. Router frameworks already satisfy it (every screen has a route). The snippets below are for **state-navigated apps** (no router) — make the app deep-linkable so every screen is reachable via `?screen=<Name>`, and register screens in `.vortspec/screen-preview.json`.

### React (Vite) — deep-link the app (preferred)

Read the screen (and any selection) from the URL on mount, and reflect navigation back into the URL. This reuses the app's real prop-building — no separate harness.

```tsx
// src/App.tsx
const params = new URLSearchParams(location.search);
const [screen, setScreen] = React.useState(params.get('screen') ?? 'home');
// A screen that needs a selection reads it too, then hydrates from the app's own data:
const [itemId, setItemId] = React.useState(params.get('item'));

React.useEffect(() => {
  const u = new URL(location.href);
  screen === 'home' ? u.searchParams.delete('screen') : u.searchParams.set('screen', screen);
  itemId == null ? u.searchParams.delete('item') : u.searchParams.set('item', String(itemId));
  history.replaceState(null, '', u); // deep-linkable, no reload
}, [screen, itemId]);

// Render the selected screen using the SAME props the in-app navigation builds
// (e.g. DestinationDetail gets toDestination(LISTINGS[Number(itemId)])).
```

### React (Vite) — dev-only harness (fallback)

Use only if deep-linking the app is impractical. Production output is unchanged because it's `import.meta.env.DEV`-guarded.

```tsx
// src/main.tsx
import DestinationDetail from './screens/DestinationDetail';
const screen = import.meta.env.DEV ? new URLSearchParams(location.search).get('screen') : null;
const sampleProps = { /* representative props built from the app's own sample data */ };

createRoot(document.getElementById('root')!).render(
  screen === 'DestinationDetail' ? <DestinationDetail {...sampleProps} /> : <App />,
);
```

### Vue 3 / Svelte / Vanilla

Same pattern: on mount read `new URLSearchParams(location.search).get('screen')` into the app's active-screen state, and call `history.replaceState` when it changes. Hydrate any selection from the app's own data source. Register each screen in `.vortspec/screen-preview.json`.

### Router frameworks (Next.js, Nuxt, SvelteKit, Angular, Astro)

No action needed — screens are routes and already URL-addressable. Do **not** add a `?screen=` harness; use the real route.

### The manifest — `.vortspec/screen-preview.json`

Write/patch this whenever a state-navigated screen is added, so the cockpit's sitemap can list and open screens:

```json
{ "param": "screen", "screens": [ { "name": "DestinationDetail", "file": "src/screens/DestinationDetail.tsx" } ] }
```

---

## Design Token File — Default Locations

| Framework     | Default `token_file`            |
|---------------|---------------------------------|
| React (Vite)  | `src/styles/tokens.css`         |
| Next.js       | `app/globals.css`               |
| Vue 3         | `src/assets/tokens.css`         |
| Nuxt 3        | `assets/css/tokens.css`         |
| SvelteKit     | `src/app.css`                   |
| Angular       | `src/styles/tokens.css`         |
| Astro         | `src/styles/tokens.css`         |
| Vanilla       | `css/tokens.css`                |
