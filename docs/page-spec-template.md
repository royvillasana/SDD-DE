# Page / Feature Spec Template

Copy this template for every page or feature you compose. Fill in every section before building.

---

## [PageName] Page — Spec

**Version**: 1.0  
**Status**: Draft / Ready / Implemented  
**Figma frame**: [paste Figma frame URL — desktop]  
**Figma frame (mobile)**: [paste Figma frame URL — mobile]

---

### Purpose

One sentence: what is the goal of this page or feature, and who uses it?

---

### Component Inventory

List every component that appears on this page.

| Component | Spec file | Status |
|---|---|---|
| `SiteNav` | `specs/site-nav-component-spec.md` | Implemented |
| `HeroSection` | `specs/hero-section-component-spec.md` | Draft |
| `FeatureGrid` | `specs/feature-grid-component-spec.md` | Not started |
| `PricingCard` | `specs/pricing-card-component-spec.md` | Not started |
| `Footer` | `specs/footer-component-spec.md` | Implemented |

---

### Layout Structure

```
<Page>
  <SiteNav />                    ← sticky, full-width
  <main>
    <HeroSection />              ← 100vh, centered content
    <FeatureGrid />              ← 3-column grid, max-width 1200px
    <PricingCard list={plans} /> ← 3 cards, centered
  </main>
  <Footer />                     ← full-width
</Page>
```

---

### Responsive Breakpoints

| Breakpoint | Layout change |
|---|---|
| 375px (mobile) | Single column. `FeatureGrid` stacks vertically. `PricingCard` full-width carousel. `SiteNav` collapses to hamburger. |
| 768px (tablet) | 2-column grid for `FeatureGrid`. `PricingCard` 2 per row. |
| 1024px (desktop) | 3-column grid. `PricingCard` 3 per row. |
| 1440px (wide) | Max-width container (1200px) centered. Grid unchanged. |

---

### Spacing System

All spacing uses the project's base-4 scale:

| Section gap | Value | Token |
|---|---|---|
| `SiteNav` bottom margin | 0 | — |
| `HeroSection` padding top | 80px | `--spacing-20` |
| `HeroSection` padding bottom | 80px | `--spacing-20` |
| Section gap | 96px | `--spacing-24` |
| `Footer` padding top | 64px | `--spacing-16` |

---

### Data Flow

| Component | Data source | Type |
|---|---|---|
| `SiteNav` | Static | Hardcoded nav links |
| `HeroSection` | Static | Hardcoded headline + CTA |
| `FeatureGrid` | Static | Array of feature objects |
| `PricingCard` | Props | `plans: Plan[]` passed from parent |

---

### SEO & Meta

```tsx
export const metadata = {
  title: "[Page Title] — [Brand]",
  description: "[150 chars max. Plain language. No jargon.]",
  openGraph: {
    title: "[Page Title]",
    description: "[Same as above]",
    image: "/og/[page-name].png",
  },
};
```

---

### Accessibility

- Page `<main>` has `id="main-content"` for skip link
- Heading hierarchy: `h1` in Hero, `h2` for section titles, `h3` for card titles
- Images: all decorative images `alt=""`; content images have descriptive `alt`
- Color contrast: all text ≥ 4.5:1 against background (WCAG AA)

---

### Implementation Tasks

**Phase 1 — Shell**
- [ ] Create `app/[page]/page.tsx` with metadata
- [ ] Import and render `SiteNav` and `Footer`
- [ ] Add skip link at top of `<body>`

**Phase 2 — Sections**
- [ ] Implement `HeroSection` per component spec
- [ ] Implement `FeatureGrid` per component spec
- [ ] Implement `PricingCard` per component spec

**Phase 3 — Composition**
- [ ] Wire all sections together in correct order
- [ ] Apply section spacing (`--spacing-24` gap)
- [ ] Verify heading hierarchy (h1 → h2 → h3)

**Phase 4 — Responsive**
- [ ] Mobile layout (375px): single column, collapsed nav
- [ ] Tablet layout (768px): 2-column grid
- [ ] Desktop layout (1024px+): 3-column grid

**Phase 5 — QA**
- [ ] Visual QA at 375px / 768px / 1440px vs. Figma frames
- [ ] Lighthouse accessibility score ≥ 95
- [ ] All tokens verified in computed styles (no hardcoded values)
