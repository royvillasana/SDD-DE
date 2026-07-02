# SDD-DE — Spec-Driven Development for Design Engineers

A portable, AI-ready methodology toolkit that installs into any frontend project and teaches AI coding agents to ship production-quality UI through disciplined specification before implementation.

Works with **Claude Code**, **Cursor**, **GitHub Copilot**, and any AI agent that reads Markdown instructions.

---

## Quick Start

### 1. Install into your project

```bash
cd your-project
npx @royvillasana/sdd-de
```

The CLI asks a few questions about your stack (framework, language, design source, styling), then installs the full toolkit into `.sdd-de/` and writes `CLAUDE.md` to your project root. No global install required.

### 2. Open your AI coding agent

Open **Claude Code**, **Cursor**, or any AI agent in the same project directory. The agent reads `CLAUDE.md` automatically and gains access to all SDD-DE skills.

### 3. Start the workflow

Type the first skill command in your agent:

```
/enrich-brief
```

Describe what you want to build. The agent will walk you through the full 7-step cycle.

---

## How It Works — Two Epics, One 7-Step Cycle

SDD-DE organizes frontend work into two sequential epics. Each epic runs the same 7-step cycle for every artifact it produces.

### Epic 1 — Component Library

Build the UI building blocks before composing any page. Follow atomic design order.

| Level | Examples |
|---|---|
| **Tokens** | Color, spacing, typography, radius, shadow |
| **Atoms** | Button, Input, Badge, Icon, Avatar |
| **Molecules** | SearchBar, Card, FormField |
| **Organisms** | Header, Sidebar, DataTable |

When all components are built, run `/storybook` to install Storybook, generate stories for every component, and launch a local dev server at `http://localhost:6006`.

### Epic 2 — Page Composition

Compose Epic 1 components into complete pages and product features.

| Level | Examples |
|---|---|
| **Templates** | Two-column layout, dashboard shell |
| **Pages** | Homepage, Login, Dashboard, Settings |
| **Features** | Checkout flow, Onboarding wizard |

### The 7-Step Cycle

Run this cycle once per component (Epic 1) and once per page (Epic 2):

| Step | Command | What happens |
|---|---|---|
| 1 | `/enrich-brief` | Brief → enriched story with acceptance criteria |
| 2 | `/generate-artifacts` | Story → Component Spec + Interaction Spec + Page Spec |
| 3 | `git checkout -b` | Branch before any implementation |
| 4 | Implement | One spec task at a time — mark `[ ]` → `[x]` when done |
| 5 | `/visual-verify` | Compare live implementation to spec — zero discrepancies required |
| 6 | `/adversarial-review` | Red-team: resolve all Blocker findings before committing |
| 7 | `/sync-tokens` → `/commit` | Sync design tokens, then open PR with Component Spec as description |

---

## Design System Sources

During setup, choose where your components and design specs come from. Every skill in the toolkit branches to the correct workflow for your source.

| Source | How it works |
|---|---|
| **Figma** | Claude reads frames, variables, and component specs via the Figma MCP |
| **Component Library** | shadcn/ui, Material UI, Radix UI, Ant Design, Chakra UI, Mantine, Headless UI |
| **GitHub Repository** | Claude reads component source files directly from a GitHub repo |
| **ZIP File** | Claude reads component source files from a local ZIP archive |
| **Google Stitch** | Google's AI design tool — connects via the Stitch MCP or reads an exported ZIP |

---

## Frameworks Supported

```
react · next · vue · nuxt · svelte · sveltekit · angular · astro · vanilla
```

---

## What Gets Installed

```
your-project/
├── CLAUDE.md                        ← AI agent instructions (also writes AGENTS.md, GEMINI.md, codex.md)
├── .claude/
│   └── skills/                      ← symlinks → .sdd-de/ai-specs/skills/
│       ├── setup → ...
│       ├── enrich-brief → ...
│       ├── generate-artifacts → ...
│       ├── visual-verify → ...
│       ├── adversarial-review → ...
│       ├── sync-tokens → ...
│       ├── commit → ...
│       └── storybook → ...
└── .sdd-de/
    ├── project.yaml                 ← framework + design system configuration
    ├── ai-specs/
    │   └── skills/
    │       ├── setup/               ← configure or reconfigure the project
    │       ├── enrich-brief/        ← brief → enriched spec story
    │       ├── generate-artifacts/  ← spec story → 3 spec artifacts
    │       ├── visual-verify/       ← visual QA against design spec
    │       ├── adversarial-review/  ← red-team before committing
    │       ├── sync-tokens/         ← sync design tokens
    │       ├── commit/              ← PR with spec as description
    │       ├── storybook/           ← generate Storybook stories for all components
    │       └── sync-agent-symlinks/ ← repair broken symlinks
    └── docs/
        ├── component-standards.md
        ├── page-standards.md
        ├── framework-config.md      ← code examples for all 9 frameworks
        ├── design-token-model.md
        ├── documentation-standards.md
        ├── sdd-mandatory-steps.md
        ├── component-spec-template.md
        ├── interaction-spec-template.md
        └── page-spec-template.md
```

---

## Skills Reference

Type any skill command inside Claude Code (or your AI agent) to execute it:

| Command | Purpose |
|---|---|
| `/setup` | Configure the project — framework, language, design source. Run first. |
| `/enrich-brief` | Transform a brief, Figma URL, or user story into a spec-ready enriched story |
| `/generate-artifacts` | Generate Component Spec, Interaction Spec, and Page Spec from the enriched story |
| `/visual-verify` | Compare the live implementation to the design spec — zero discrepancies required |
| `/adversarial-review` | Red-team the implementation before committing — finds what visual QA misses |
| `/sync-tokens` | Sync design tokens between your design source and the project token file |
| `/commit` | Stage, commit, and open a PR with the Component Spec as the PR description |
| `/storybook` | Install Storybook, generate stories for all Epic 1 components, launch dev server |
| `/sync-agent-symlinks` | Audit and repair broken symlinks in `.claude/skills/` and `.cursor/skills/` |

---

## Usage Examples

### Build a Button component from a Figma design

```
/enrich-brief
> Build a primary Button component from this Figma frame: https://figma.com/design/...
```

The agent enriches your brief, generates specs, and walks you through implementation with visual verification at every step.

### Build a Login page from a component library

```
/enrich-brief
> Build a Login page using shadcn/ui components: email input, password input, submit button, "forgot password" link
```

### Re-run setup to change your stack

```
/setup
```

---

## Requirements

- **Node.js 18+** (for the CLI installer)
- **An AI coding agent** that reads Markdown instructions (Claude Code, Cursor, Copilot, etc.)

---

## Publishing (for maintainers)

```bash
# Bump version
npm version patch   # or minor / major

# Publish to npm
npm publish

# Users install with
npx @royvillasana/sdd-de
```

---

## Core Principles

- **Spec-first, always** — never implement from a brief alone. All three spec artifacts must exist before any code is written.
- **One task at a time** — execute one spec task per session. Mark it complete before moving to the next.
- **Token-referenced output** — every color, spacing, radius, and font value must reference a design token variable. Hardcoded values fail review.
- **Pixel-accurate by default** — compare the live component to the design spec after every implementation. Unresolved discrepancies block the Verify step.
- **Accessible by default** — semantic HTML and ARIA attributes are part of the spec, not optional.

---

## Who This Is For

- **Design Engineers** who want a repeatable, auditable design-to-code workflow
- **UX Designers** learning to ship production code with AI assistance
- **Frontend teams** that want AI agents to produce consistent, spec-grounded output

---

## Philosophy

> "Write the spec. Then write the code. Never the other way around."

The spec is not a deliverable -- it is the input to the AI. When your spec is complete, implementation becomes mechanical. Visual QA becomes pass/fail. The PR description writes itself.

---

## License

MIT
