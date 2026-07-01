# SDD-DE — Spec-Driven Development for Design Engineers

This project uses the SDD-DE toolkit. The toolkit lives in `.sdd-de/` and
provides skills, spec templates, and standards for a structured design-to-code workflow.

## Core Principles

- **Spec-first, always**: Never implement from a brief alone. The Component Spec,
  Interaction Spec, and Page Spec must exist before any Claude Code prompt is written.
- **One task at a time**: Execute one spec task per session. Mark it complete
  (`- [ ]` → `- [x]`) before moving to the next.
- **Token-referenced output**: Every color, spacing, radius, and font value in
  generated code must reference a CSS custom property. Hardcoded hex or pixel values fail review.
- **Pixel-accurate by default**: After every implementation, compare the live component
  to the Figma frame. Unresolved discrepancies block the Verify step.
- **Accessible by default**: Semantic HTML and ARIA attributes are not optional —
  they are part of the spec.

## Skills

Skills live in `.sdd-de/ai-specs/skills/`. When a user types a skill name, load
and follow the corresponding `SKILL.md` automatically before responding.

| Slash Command | SKILL.md Location | Purpose |
|---|---|---|
| `/enrich-brief` | `.sdd-de/ai-specs/skills/enrich-brief/SKILL.md` | Transform a vague brief into a spec-ready story |
| `/generate-artifacts` | `.sdd-de/ai-specs/skills/generate-artifacts/SKILL.md` | Generate all 3 spec files from the enriched story |
| `/visual-verify` | `.sdd-de/ai-specs/skills/visual-verify/SKILL.md` | Run structured visual QA against the spec |
| `/sync-tokens` | `.sdd-de/ai-specs/skills/sync-tokens/SKILL.md` | Sync Figma Variables and CSS custom properties |
| `/commit` | `.sdd-de/ai-specs/skills/commit/SKILL.md` | Commit with spec as PR description |

## Standards

Read these documents before implementing any component or page:

- [Component Standards](.sdd-de/docs/component-standards.md) — atomic design, variant rules, accessibility baseline
- [Page Standards](.sdd-de/docs/page-standards.md) — Next.js App Router conventions, responsive layout
- [Design Token Model](.sdd-de/docs/design-token-model.md) — color, spacing, typography, radius, shadow systems
- [Documentation Standards](.sdd-de/docs/documentation-standards.md) — spec format and maintenance rules
- [SDD Mandatory Steps](.sdd-de/docs/sdd-mandatory-steps.md) — required checklist for every SDD cycle

## Spec Templates

Fill these templates when writing specs manually:

- [Component Spec Template](.sdd-de/docs/component-spec-template.md)
- [Interaction Spec Template](.sdd-de/docs/interaction-spec-template.md)
- [Page Spec Template](.sdd-de/docs/page-spec-template.md)

## Workflow

1. `/enrich-brief` — brief → enriched story with acceptance criteria
2. `/generate-artifacts` — enriched story → Component Spec + Interaction Spec + Page Spec
3. `git checkout -b feature/[name]-spec` — branch before any implementation
4. Claude Code session — implement one spec task at a time
5. `/visual-verify` — compare live implementation to Figma, zero discrepancies required
6. `/sync-tokens` — sync Figma Variables and CSS custom properties
7. `/commit` — PR with Component Spec as description

## Spec Update Rule

When a change request arrives after Apply but before Commit:
1. Update the affected spec artifact first
2. Add the new task to the spec task list
3. Implement only after the spec reflects the change
4. Re-run `/visual-verify` before committing
