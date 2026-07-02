---
description: Core SDD-DE principles for AI agents working in design engineering projects. Always apply.
alwaysApply: true
---

# Design Engineering Standards

## 1. Core Principles

- **Spec-first, always**: Write the complete specification before prompting the AI. Never implement from a brief alone.
- **One component at a time**: Build and verify each component in isolation before composing pages.
- **Token-referenced code**: All generated code must reference design tokens (CSS custom properties, SCSS variables, or framework equivalents), never hardcoded values.
- **Pixel-accurate by default**: Every generated component is measured against the Figma spec before the task is marked complete.
- **Accessible by default**: Every component ships with correct semantic HTML and ARIA attributes — not added later.
- **Incremental changes**: Prefer small, focused prompts over large "build the whole page" requests.

## 2. Language Standards

- All spec documents, comments, and commit messages must be in English.
- Component names follow PascalCase: `ButtonPrimary`, `HeroSection`, `PricingCard`.
- Design token variables follow kebab-case with semantic grouping: `--color-brand-primary`, `--spacing-4`, `--radius-lg`.
- File names follow kebab-case with framework-appropriate extension: `button-primary.tsx`, `hero-section.vue`, `price-card.svelte`.

## 3. Framework Configuration (Read Before Coding)

Before writing any code, read `.sdd-de/project.yaml` to determine:
- The project's framework (React, Vue, Angular, Svelte, Astro, Next.js, Nuxt, etc.)
- The language (TypeScript or JavaScript)
- The styling approach (CSS Modules, SCSS, Tailwind, etc.)
- The design token file path
- The component directory structure

All generated code must match the framework, language, and conventions defined in `project.yaml`.
See `docs/framework-config.md` for framework-specific file structure, component patterns, and code examples.

## 4. Spec Standards

Every implementation requires three spec artifacts before any code is written:

- **Component Spec** — visual properties, variants, states, sizes, content rules, accessibility
- **Interaction Spec** — triggers, animation flows, timing, easing, edge cases
- **Page/Feature Spec** — component composition, layout rules, responsive breakpoints, data flow

See `docs/component-spec-template.md`, `docs/interaction-spec-template.md`, `docs/page-spec-template.md`.

## 5. Design Token Requirements

All components must use design tokens. Before writing a Component Spec, verify:

- Color tokens exist in Figma Variables and map to the project's token variables (see `project.yaml → token_file`)
- Spacing tokens use the project's base-4 or base-8 scale
- Typography tokens reference the font stack defined in the project's base stylesheet
- Radius tokens use the project's `--radius-*` scale

If a token is missing, define it in Figma Variables first, then add it to the token file before writing the spec.

## 6. Skills

- Skills live in `.sdd-de/ai-specs/skills/`.
- When a request matches a skill name, load and follow the corresponding `SKILL.md` automatically.
- Key skills: `enrich-brief`, `generate-artifacts`, `visual-verify`, `sync-tokens`, `adversarial-review`, `commit`.

## 7. Specific Standards

- [Component Standards](./component-standards.md) — atomic design, variants, states, a11y
- [Page Standards](./page-standards.md) — layout composition, responsive, landmark structure
- [Framework Configuration](./framework-config.md) — framework-specific patterns and file conventions
- [Documentation Standards](./documentation-standards.md) — spec format and maintenance
- [SDD Mandatory Steps](./sdd-mandatory-steps.md) — required checklist for every SDD cycle

## 8. Mandatory Post-Implementation Steps

After every `apply` step:

1. **Visual QA**: Screenshot the live component; compare to Figma frame side by side
2. **Token audit**: Inspect computed styles in browser DevTools; verify every value references a design token variable, not a raw hex/px value
3. **Accessibility check**: Run axe or Lighthouse accessibility audit; zero errors before merging
4. **Spec update**: Mark completed tasks in the spec file (`- [ ]` → `- [x]`)
5. **Documentation update**: Update `design.md` with any implementation decisions that deviate from the Figma spec
6. **Adversarial review**: Run `/adversarial-review` before committing — challenge the implementation against the spec with a red-team lens
