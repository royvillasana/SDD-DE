# Component Spec Template

Copy this template for every component you build. Fill in every section before opening a Claude Code session.

---

## [ComponentName] — Component Spec

**Version**: 1.0  
**Status**: Draft / Ready / Implemented  
**Figma frame**: [paste Figma frame URL]  
**Owner**: [designer name]

---

### Purpose

One sentence: what does this component do, and where does it appear?

---

### Design Tokens Used

List every token this component references. Add to `globals.css` if missing.

| Token | Value | CSS Property |
|---|---|---|
| `--color-brand-primary` | `#F4A500` | `background-color` |
| `--spacing-4` | `16px` | `padding` |
| `--radius-md` | `8px` | `border-radius` |
| `--font-size-sm` | `14px` | `font-size` |

---

### Variants

| Variant | Description |
|---|---|
| `primary` | Filled background, white label |
| `secondary` | Outlined, transparent background |
| `ghost` | No border, no background |
| `destructive` | Red fill, white label |

---

### States

| State | Visual Change | Trigger |
|---|---|---|
| `default` | Base appearance | — |
| `hover` | Background lightens 10% | Mouse enter |
| `focus` | 2px ring, offset 2px | Keyboard focus |
| `active` | Background darkens 10% | Mouse down |
| `disabled` | 40% opacity, no pointer | `disabled` prop = true |
| `loading` | Spinner replaces label | `loading` prop = true |
| `error` | Red border + error token | `error` prop = true |

---

### Sizes

| Size | Height | Padding H | Font size | Icon size |
|---|---|---|---|---|
| `sm` | 32px | 12px | 13px | 14px |
| `md` | 40px | 16px | 14px | 16px |
| `lg` | 48px | 20px | 16px | 18px |

---

### Props / API

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `"primary" \| "secondary" \| "ghost" \| "destructive"` | `"primary"` | Visual style |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Component size |
| `disabled` | `boolean` | `false` | Disables interaction |
| `loading` | `boolean` | `false` | Shows spinner |
| `onClick` | `() => void` | — | Click handler |
| `children` | `ReactNode` | — | Button label |

---

### Content Rules

- Label: 1–4 words. Sentence case. No periods.
- Icon: optional, left of label, 4px gap.
- Never: all-caps labels, icon-only without `aria-label`.

---

### Accessibility

- Element: `<button type="button">` (or `type="submit"` in forms)
- `aria-disabled="true"` when disabled (do not use `disabled` attribute alone)
- `aria-busy="true"` when loading
- Loading spinner: `aria-label="Loading"`, `role="status"`
- Focus ring: visible at 2:1 contrast minimum against all backgrounds

---

### Do Not

- Do not hardcode colors — use tokens
- Do not nest interactive elements inside the button
- Do not remove the focus ring
- Do not add a loading state without an `aria-busy` attribute

---

### Implementation Tasks

- [ ] Create `components/ui/[component-name].tsx`
- [ ] Implement `primary` variant with all states
- [ ] Implement `secondary`, `ghost`, `destructive` variants
- [ ] Implement `sm`, `md`, `lg` sizes
- [ ] Implement `loading` state with spinner
- [ ] Add all ARIA attributes
- [ ] Write unit test for render, states, and click handler
- [ ] Visual QA at 375px / 768px / 1440px
