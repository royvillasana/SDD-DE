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
- **CVA + cn() for all components**: Every component uses Class Variance Authority (CVA)
  for variants in a separate `.variants.ts` file, a `cn()` utility for class merging, and
  `forwardRef` for ref forwarding. Consumers pass `className` last for layout overrides.
  No inline `style={{}}` for design-system values. See `docs/styling-best-practices.md`.
- **Always disclose the next step**: After completing any step or skill, tell the user
  what the next step is, what command to run, and what will happen. Never leave the user
  uncertain about where they are in the cycle or what to do next.
- **Track progress and self-correct**: At the end of every response, review what was just
  completed against the full workflow. If the work has derailed from the expected steps,
  flag it. Always show a progress summary with the current position in the cycle and
  the remaining steps. Never let the user lose context of where they are.

## Progress Tracking — MANDATORY

At the end of **every response** that completes a task, include a progress block.
This applies during implementation (step 4), after running any skill, and after
any work that advances the cycle.

### Visual format

The progress block MUST be visually distinct from all other output. Use this exact format
with colored divider lines so the user can instantly spot it:

```
🔵 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 [Design System Component Creation | Screen Creation] — [Name]

  ✅ 1. /enrich-brief
  ✅ 2. /generate-artifacts
  ✅ 3. Branch created
  👉 4. Implement (task 3 of 7)          ← you are here
  ⬜ 5. /visual-verify
  ⬜ 6. /adversarial-review
  ⬜ 7. /sync-tokens → /commit

  ➡️  Next step: [what to do next]
  💻 Run: [exact command]
🔵 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Symbols

| Symbol | Meaning |
|--------|---------|
| 🔵 ━━━ | Blue divider lines — top and bottom of the progress block |
| 📍 | Current phase and component/screen name |
| ✅ | Completed step |
| 👉 | Current step (with `← you are here`) |
| ⬜ | Pending step |
| ➡️ | Next action to take |
| 💻 | Exact command to run |
| ⚠️ | Derailment warning (if applicable) |

### Rules

1. Mark completed steps with ✅, pending steps with ⬜, and the current step with 👉 and `← you are here`
2. If inside step 4 (Implement), show which spec task you are on (e.g., "task 3 of 7")
3. If the work has gone off-track from the expected sequence, add a warning line:
   `⚠️ Derailed: [describe what happened]. To get back on track: [corrective action]`
4. When transitioning from component creation to screen creation, show the optional steps:
   `⬜ /storybook`, `⬜ /design-doc`
5. Never omit this block. Even if the user asks a question unrelated to the cycle,
   if there is an active cycle in progress, show the current position
6. The blue divider lines (🔵 ━━━) must always be present — they visually separate
   the progress block from the rest of the output so the user can find it instantly

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
| `/storybook` | `.sdd-de/ai-specs/skills/storybook/SKILL.md` | Install Storybook, generate stories for all components, launch dev server |
| `/design-doc` | `.sdd-de/ai-specs/skills/design-doc/SKILL.md` | Generate DESIGN.md from components, validate with @google/design.md |
| `/sync-agent-symlinks` | `.sdd-de/ai-specs/skills/sync-agent-symlinks/SKILL.md` | Repair broken symlinks across editor directories |

## Standards

Read these documents before implementing any component or page:

- [Component Standards](.sdd-de/docs/component-standards.md) — atomic design, variant rules, accessibility baseline
- [Page Standards](.sdd-de/docs/page-standards.md) — layout composition, responsive breakpoints, landmark structure
- [Framework Configuration](.sdd-de/docs/framework-config.md) — framework-specific patterns and file conventions
- [Design Token Model](.sdd-de/docs/design-token-model.md) — color, spacing, typography, radius, shadow systems
- [Styling Best Practices](.sdd-de/docs/styling-best-practices.md) — per-framework styling patterns and encapsulation rules
- [Documentation Standards](.sdd-de/docs/documentation-standards.md) — spec format and maintenance rules
- [SDD Mandatory Steps](.sdd-de/docs/sdd-mandatory-steps.md) — required checklist for every SDD cycle

## Spec Templates

Fill these templates when writing specs manually:

- [Component Spec Template](.sdd-de/docs/component-spec-template.md)
- [Interaction Spec Template](.sdd-de/docs/interaction-spec-template.md)
- [Page Spec Template](.sdd-de/docs/page-spec-template.md)

## Design System Document

After building components, run **`/design-doc`** to generate a `DESIGN.md` file at the project
root using the `@google/design.md` format (YAML frontmatter + Markdown prose). This file
captures the complete design system: all tokens, all components, design intent, and usage guidelines.

**Read `DESIGN.md` before starting Screen Creation.** It provides the full context of the
component library so you can compose screens accurately.

To validate: `npx @google/design.md lint DESIGN.md`
To export tokens: `npx @google/design.md export DESIGN.md --format css-vars`

## How the Workflow Is Organized

SDD-DE structures frontend work into **two phases**. Each phase applies the same
7-step cycle to every artifact it produces — whether that artifact is a single component
or a full screen. **You can switch between phases at any time.**

Run `/setup` once before anything else to configure the project.

---

### Design System Component Creation

Build the UI building blocks. Follow atomic design order: tokens first, then atoms,
then molecules, then organisms.

| Level | Examples |
|---|---|
| **Tokens** | Color, spacing, typography, radius, shadow |
| **Atoms** | Button, Input, Badge, Icon, Avatar |
| **Molecules** | SearchBar (Input + Button), Card (Image + Text + Button) |
| **Organisms** | Header (Nav + CTA), Form (fields + submit) |

Run the **7-step cycle** once per component.

When you have components ready to document:
1. Run **`/storybook`** to install Storybook, generate stories for every component, and launch a dev server at `http://localhost:6006`.
2. Run **`/design-doc`** to generate a `DESIGN.md` file that captures the design system in the `@google/design.md` format and validates it with `npx @google/design.md lint`.

You can run `/storybook` and `/design-doc` at any time to update documentation as you add more components.

---

### Screen Creation

Compose components into complete screens, layouts, and product features.

| Level | Examples |
|---|---|
| **Templates** | Two-column layout, full-bleed hero, dashboard shell |
| **Screens** | Homepage, Login, Dashboard, Settings |
| **Features** | Checkout flow, Onboarding wizard, Search results |

Run the **7-step cycle** once per screen or feature.

#### Prerequisites before starting Screen Creation

Before creating ANY screen, these must be completed:

1. **`/storybook` has been run** — all existing components have stories and are browsable
2. **`/design-doc` has been run** — DESIGN.md exists and passes `npx @google/design.md lint`

These are mandatory. Do not begin Screen Creation without them.

#### Component Gap Detection — MANDATORY

When the user requests a screen, **before starting the 7-step cycle**, scan the screen's
design (Figma frame, brief, or description) and inventory every distinct UI element it
contains. Compare this inventory against the components that already exist in `[component_dir]`.

If components are missing, **do not proceed with screen creation**. Instead:

```
🔵 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ Component Gap Detected

  You want to build: Landing Screen
  Components needed but NOT yet built:

  ⬜ NavBar         — top navigation with logo, links, CTA
  ⬜ HeroSection    — full-width hero with heading, subtext, CTA buttons
  ⬜ FeatureCard    — icon + title + description card
  ⬜ TestimonialCard — avatar + quote + name
  ⬜ FooterSection  — links, social icons, copyright

  Components you HAVE:
  ✅ Button
  ✅ Avatar
  ✅ Input

  → You need to build 5 more components before this screen.

  Would you like me to build these components for you?
  I'll create each one from your Figma file using the 7-step cycle,
  then update Storybook and DESIGN.md before starting the screen.
🔵 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

If the user confirms, build each missing component through the full 7-step cycle
(Design System Component Creation), then re-run `/storybook` and `/design-doc` to
update the documentation. Only then proceed to Screen Creation.

If the user says "build them for me", proceed component by component:
1. Run `/enrich-brief` for the first missing component
2. Complete the full 7-step cycle for it
3. Move to the next missing component
4. After all are built, run `/storybook` and `/design-doc`
5. Then start the screen's 7-step cycle

---

### The 7-Step Cycle

This cycle repeats for every component and every screen:

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
