# Page Standards

This document defines framework-agnostic page composition standards for SDD-DE projects.
For framework-specific file structure and code examples, see `docs/framework-config.md`.

---

## Core Page Principles

- Every page is a composition of components — never write one-off layout code inside a page file
- Pages are responsible for: layout shell, component composition, data-fetching orchestration, and metadata/SEO
- No business logic lives in page files — delegate to services, stores, composables, or controllers
- Every page has exactly one `<main>` landmark containing the primary content

---

## Page File Structure

Regardless of framework, a page file follows this logical order:

```
1. Imports        — layout shell, sections/components, data services
2. Metadata / SEO — title, description, og tags
3. Data / state   — fetch or initialize page-level data
4. Render         — layout shell → sections → content regions
```

Framework-specific implementations of this pattern: see `docs/framework-config.md`.

---

## Preview-Addressable Screens (Deep-Linkable)

**Every screen must be reachable by URL**, so it can be opened and previewed in isolation — in a browser, in a design-review tool, or in a shared link. A screen that can only be reached by clicking through the running app is not preview-addressable and must be fixed.

There are two cases:

- **Router apps** (Next.js, react-router, SvelteKit, Nuxt, Angular): every screen already has a route — this standard is satisfied automatically. Nothing to add.
- **State-navigated apps** (no router — a screen shown by local state, e.g. `useState`): the app **must be made deep-linkable**. This is the required approach, in preference order:
  1. **Deep-link the app itself (preferred).** On mount, the entry reads a `?screen=<Name>` query param (plus any selection id it needs, e.g. `&item=<id>`) and initializes navigation state to that screen; whenever the user navigates in-app, the current screen is reflected back into the URL via `history.replaceState`. This reuses the app's **real** prop-building logic (no synthesized sample data), and the deep link works in a normal browser too.
  2. **Dev-only preview harness (fallback).** Only when deep-linking the app is impractical, add an `import.meta.env.DEV`-guarded branch in the entry that, when `?screen=<Name>` is present, renders that screen alone with representative sample props reused from the app's own data — otherwise renders the app unchanged. Production rendering must be identical with and without the harness.

**Register every state-navigated screen** in `.vortspec/screen-preview.json` so tooling can list and open them. Keep it in sync as screens are added:

```json
{
  "param": "screen",
  "screens": [
    { "name": "DestinationDetail", "file": "src/screens/DestinationDetail.tsx" }
  ]
}
```

`name` is the screen component's export name (the value used in `?screen=<Name>`); `file` is its project-relative source path.

Framework-specific deep-link and harness implementations: see `docs/framework-config.md` → **Preview-Addressable Screens**.

---

## Responsive Layout

All pages are **mobile-first**. The standard breakpoint system applies to every project regardless of framework or styling approach:

| Name    | Min Width | Purpose |
|---------|-----------|---------|
| Mobile  | 375px (default) | Baseline — all styles start here |
| Tablet  | 768px | Two-column layouts, sidebar patterns |
| Desktop | 1024px | Full navigation, multi-column grids |
| Wide    | 1440px | Max-width containers, expanded spacing |

**Max content width**: 1200px, centered, with horizontal padding:
- Mobile: `var(--spacing-4)` (16px)
- Tablet: `var(--spacing-6)` (24px)
- Desktop+: `var(--spacing-8)` (32px)

---

## Section Spacing

Use spacing tokens for vertical rhythm between page sections. Never hardcode pixel values.

| Breakpoint | Padding-Y (sections) | Gap (between sections) |
|---|---|---|
| Mobile | `var(--spacing-20)` | `var(--spacing-16)` |
| Desktop | `var(--spacing-24)` | `var(--spacing-20)` |

---

## Skip Link

Every page must have a skip link as the **first interactive element**, targeting `#main-content`.

```html
<a href="#main-content" class="sr-only focus-visible:not-sr-only ...">
  Skip to main content
</a>

<main id="main-content">
  <!-- page sections -->
</main>
```

Implement the visual style of the skip link using your project's token system. The pattern is universal regardless of framework.

---

## Landmark Structure

Every page must expose this ARIA landmark hierarchy:

```html
<header role="banner">      <!-- site navigation -->
  <nav>...</nav>
</header>

<main id="main-content">    <!-- primary content -->
  <section>...</section>
</main>

<footer role="contentinfo"> <!-- site footer -->
```

Use `<nav>` for navigation regions, `<aside>` for supplementary content, `<section>` for distinct content regions that have a heading.

---

## Heading Hierarchy

- One `<h1>` per page — the page's primary subject
- `<h2>` for major sections within the page
- `<h3>` for sub-sections within a section
- Never skip heading levels (e.g. `<h1>` → `<h3>` is invalid)

---

## Grid System

Use a 12-column grid for complex layouts. Implement using your framework's preferred grid system (CSS Grid, utility classes, etc.):

| Layout | Column Split |
|---|---|
| Sidebar + Content | 4 + 8 cols |
| Equal Split | 6 + 6 cols |
| Three Columns | 4 + 4 + 4 cols |
| Full Width | 12 cols |

Mobile default: single column (full width) for all patterns.

---

## SEO / Metadata

Every page defines at minimum:

| Field | Rule |
|---|---|
| `title` | `[Page Title] — [Brand]`, under 60 characters |
| `description` | 150 characters max, descriptive, includes primary keyword |
| `og:title` | Same as `title` or a social-optimized variant |
| `og:description` | Same as `description` |
| `og:image` | 1200×630px image representing the page |

Framework-specific metadata implementation is in `docs/framework-config.md`.
