---
description: Core SDD-DE principles for AI agents working in design engineering projects. Always apply.
alwaysApply: true
---

# Design Engineering Standards

## 1. Core Principles

- **Spec-first, always**: Write the complete specification before prompting the AI. Never implement from a brief alone.
- **One component at a time**: Build and verify each component in isolation before composing pages.
- **Token-referenced code**: All generated code must reference design tokens (CSS custom properties), never hardcoded values.
- **Pixel-accurate by default**: Every generated component is measured against the Figma spec before the task is marked complete.
- **Accessible by default**: Every component ships with correct semantic HTML and ARIA attributes — not added later.
- **Incremental changes**: Prefer small, focused prompts over large "build the whole page" requests.

## 2. Language Standards

- All spec documents, comments, and commit messages must be in English.
- Component names follow PascalCase: `ButtonPrimary`, `HeroSection`, `PricingCard`.
- CSS custom properties follow kebab-case with semantic grouping: `--color-brand-primary`, `--spacing-4`, `--radius-lg`.
- File names follow kebab-case: `button-primary.tsx`, `hero-section.tsx`.

## 3. Spec Standards

Every implementation requires three spec artifacts before Claude Code is prompted:

- **Component Spec** — visual properties, variants, states, sizes, content rules, accessibility
- **Interaction Spec** — triggers, animation flows, timing, easing, edge cases
- **Page/Feature Spec** — component composition, layout rules, responsive breakpoints, data flow

See `docs/component-spec-template.md`, `docs/interaction-spec-template.md`, `docs/page-spec-template.md`.

## 4. Design Token Requirements

All components must use design tokens. Before writing a Component Spec, verify:

- Color tokens exist in Figma Variables and map to CSS custom properties in `globals.css`
- Spacing tokens use the project's base-4 or base-8 scale
- Typography tokens reference the font stack defined in `layout.tsx`
- Radius tokens use the project's `--radius-*` scale

If a token is missing, define it in Figma Variables first, then export it to CSS before writing the spec.

## 5. Skills

- Skills live in `ai-specs/skills/`.
- When a request matches a skill name, load and follow the corresponding `SKILL.md` automatically.
- Key skills: `enrich-brief`, `generate-artifacts`, `visual-verify`, `sync-tokens`, `commit`.

## 6. Specific Standards

- [Component Standards](./component-standards.md) — atomic design, variants, states, a11y
- [Page Standards](./page-standards.md) — Next.js patterns, responsive layout, composition
- [Documentation Standards](./documentation-standards.md) — spec format and maintenance
- [SDD Mandatory Steps](./sdd-mandatory-steps.md) — required checklist for every SDD cycle

## 7. Mandatory Post-Implementation Steps

After every `apply` step:

1. **Visual QA**: Screenshot the live component; compare to Figma frame side by side
2. **Token audit**: Open browser DevTools → computed styles; verify every value references a CSS custom property, not a raw hex/px value
3. **Accessibility check**: Run axe or Lighthouse accessibility audit; zero errors before merging
4. **Spec update**: Mark completed tasks in the spec file (`- [ ]` → `- [x]`)
5. **Documentation update**: Update `design.md` with any implementation decisions that deviate from the Figma spec
