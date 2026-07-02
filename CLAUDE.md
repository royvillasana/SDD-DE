# SDD-DE — Spec-Driven Development for Design Engineers

This project uses the SDD-DE toolkit. The toolkit lives in `.sdd-de/` and
provides skills, spec templates, and standards for a structured design-to-code workflow.

## Core Principles

- **Spec-first, always**: Never implement from a brief alone. The Component Spec,
  Interaction Spec, and Page Spec must exist before any code is written.
- **One task at a time**: Execute one spec task per session. Mark it complete
  (`- [ ]` → `- [x]`) before moving to the next.
- **Token-referenced output**: Every color, spacing, radius, and font value in
  generated code must reference a design token variable. Hardcoded hex or pixel values fail review.
- **Pixel-accurate by default**: After every implementation, compare the live component
  to the design spec. Unresolved discrepancies block the Verify step.
- **Accessible by default**: Semantic HTML and ARIA attributes are not optional —
  they are part of the spec.
- **Always disclose the next step**: After completing any step or skill, tell the user
  what the next step is, what command to run, and what will happen. Never leave the user
  uncertain about where they are in the cycle or what to do next.

## Project Configuration

**Always read `.sdd-de/project.yaml` before writing any code.** This file defines:
- `framework` — the UI framework (react, next, vue, nuxt, svelte, sveltekit, angular, astro, vanilla)
- `language` — typescript or javascript
- `styling` — CSS approach (css, css-modules, scss, tailwind, styled-components, emotion)
- `design_source` — where components come from: `figma` | `library` | `github` | `zip`
- `token_file` — path to the design token file
- `component_dir` — root component directory

If `.sdd-de/project.yaml` does not exist, run **/setup** first.

## Skills

Skills live in `.sdd-de/ai-specs/skills/`. When a user types a skill name, load
and follow the corresponding `SKILL.md` automatically before responding.

| Slash Command | SKILL.md Location | Purpose |
|---|---|---|
| `/setup` | `.sdd-de/ai-specs/skills/setup/SKILL.md` | Configure the project (framework, language, design source) |
| `/enrich-brief` | `.sdd-de/ai-specs/skills/enrich-brief/SKILL.md` | Transform a vague brief into a spec-ready story |
| `/generate-artifacts` | `.sdd-de/ai-specs/skills/generate-artifacts/SKILL.md` | Generate all 3 spec files from the enriched story |
| `/visual-verify` | `.sdd-de/ai-specs/skills/visual-verify/SKILL.md` | Run structured visual QA against the spec |
| `/adversarial-review` | `.sdd-de/ai-specs/skills/adversarial-review/SKILL.md` | Red-team implementation before committing |
| `/sync-tokens` | `.sdd-de/ai-specs/skills/sync-tokens/SKILL.md` | Sync design tokens between Figma and code |
| `/commit` | `.sdd-de/ai-specs/skills/commit/SKILL.md` | Commit with spec as PR description |
| `/sync-agent-symlinks` | `.sdd-de/ai-specs/skills/sync-agent-symlinks/SKILL.md` | Repair broken symlinks across editor directories |

## Standards

Read these documents before implementing any component or page:

- [Component Standards](.sdd-de/docs/component-standards.md) — atomic design, variant rules, accessibility baseline
- [Page Standards](.sdd-de/docs/page-standards.md) — layout composition, responsive breakpoints, landmark structure
- [Framework Configuration](.sdd-de/docs/framework-config.md) — framework-specific patterns and file conventions
- [Design Token Model](.sdd-de/docs/design-token-model.md) — color, spacing, typography, radius, shadow systems
- [Documentation Standards](.sdd-de/docs/documentation-standards.md) — spec format and maintenance rules
- [SDD Mandatory Steps](.sdd-de/docs/sdd-mandatory-steps.md) — required checklist for every SDD cycle

## Spec Templates

Fill these templates when writing specs manually:

- [Component Spec Template](.sdd-de/docs/component-spec-template.md)
- [Interaction Spec Template](.sdd-de/docs/interaction-spec-template.md)
- [Page Spec Template](.sdd-de/docs/page-spec-template.md)

## How the Workflow Is Organized

SDD-DE structures frontend work into **two sequential epics**. Each epic applies the same
7-step cycle to every artifact it produces — whether that artifact is a single component
or a full page.

Run `/setup` once before anything else to configure the project.

---

### Epic 1 — Component Library

Build the UI building blocks before composing any page.
Follow atomic design order: tokens first, then atoms, then molecules, then organisms.

| Level | Examples |
|---|---|
| **Tokens** | Color, spacing, typography, radius, shadow |
| **Atoms** | Button, Input, Badge, Icon, Avatar |
| **Molecules** | SearchBar (Input + Button), Card (Image + Text + Button) |
| **Organisms** | Header (Nav + CTA), Form (fields + submit) |

Run the **7-step cycle** once per component. Do not start Epic 2 until the atoms your pages depend on are built.

---

### Epic 2 — Page Composition

Compose Epic 1 components into complete pages, layouts, and product features.
Only start a page once the components it needs exist in the component library.

| Level | Examples |
|---|---|
| **Templates** | Two-column layout, full-bleed hero, dashboard shell |
| **Pages** | Homepage, Login, Dashboard, Settings |
| **Features** | Checkout flow, Onboarding wizard, Search results |

Run the **7-step cycle** once per page or feature.

---

### The 7-Step Cycle

This cycle repeats for every component (Epic 1) and every page (Epic 2):

| Step | Command / Action | What happens |
|---|---|---|
| 1 | `/enrich-brief` | Brief → enriched story with acceptance criteria |
| 2 | `/generate-artifacts` | Story → Component Spec + Interaction Spec + Page Spec |
| 3 | `git checkout -b feature/[name]-spec` | Branch before any implementation |
| 4 | Implement | One spec task at a time — mark `[ ]` → `[x]` when done |
| 5 | `/visual-verify` | Compare live implementation to spec — zero discrepancies required |
| 6 | `/adversarial-review` | Red-team: resolve all Blocker findings before committing |
| 7 | `/sync-tokens` → `/commit` | Sync tokens, then open PR with Component Spec as description |

**Step 7 always runs `/sync-tokens` before `/commit`.**

---

## Spec Update Rule

When a change request arrives after Apply but before Commit:
1. Update the affected spec artifact first
2. Add the new task to the spec task list
3. Implement only after the spec reflects the change
4. Re-run `/visual-verify` and `/adversarial-review` before committing
