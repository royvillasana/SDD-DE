# SDD-DE Agent Configuration

## Core Principles

- **Spec-first, always**: Never implement from a brief alone. The Component Spec, Interaction Spec, and Page Spec must exist before any Claude Code prompt is written.
- **One task at a time**: Execute one spec task per session. Mark it complete (`- [ ]` → `- [x]`) before moving to the next.
- **Token-referenced output**: Every color, spacing, radius, and font value in generated code must reference a CSS custom property. Hardcoded hex or pixel values fail review.
- **Pixel-accurate by default**: After every implementation, compare the live component to the Figma frame. Unresolved discrepancies block the Verify step.
- **Accessible by default**: Semantic HTML and ARIA attributes are not optional — they are part of the spec.

## Skills

- Skills live in `ai-specs/skills/`.
- When a user request matches a skill name, load and follow `SKILL.md` automatically before responding.
- Skills: `enrich-brief`, `generate-artifacts`, `visual-verify`, `sync-tokens`, `commit`.

## Standards

- [Design Engineering Standards](./docs/design-engineering-standards.md) — core SDD-DE principles
- [Component Standards](./docs/component-standards.md) — atomic design, variants, accessibility
- [Page Standards](./docs/page-standards.md) — Next.js patterns, responsive layout
- [Documentation Standards](./docs/documentation-standards.md) — spec format and maintenance
- [SDD Mandatory Steps](./docs/sdd-mandatory-steps.md) — required checklist for every cycle

## Spec Update Rule

When a change request arrives after Apply but before Commit, treat it as a **spec update first**:
1. Update the affected spec artifact
2. Add the new task to the spec task list
3. Implement only after the spec reflects the change
4. Re-run Verify before committing
