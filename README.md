<div align="center">

```
  ░███████ ██████  ██████        ██████  ███████
  ░██      ██   ██ ██   ██       ██   ██ ██
  ░███████ ██   ██ ██   ██ ═══   ██   ██ █████
  ░     ██ ██   ██ ██   ██       ██   ██ ██
  ░███████ ██████  ██████  ═══   ██████  ███████
  ░░░░░░░░░░░░░░░░░░░░░░░░
  Spec-Driven Development for Design Engineers
```

**A portable, AI-ready methodology toolkit that teaches AI coding agents to ship production-quality UI through disciplined specification before implementation.**

Works with **Claude Code** | **Cursor** | **GitHub Copilot** | any AI agent that reads Markdown

[![npm version](https://img.shields.io/npm/v/@royvillasana/sdd-de.svg)](https://www.npmjs.com/package/@royvillasana/sdd-de)
[![license](https://img.shields.io/npm/l/@royvillasana/sdd-de.svg)](https://github.com/royvillasana/SDD-DE/blob/main/LICENSE)
[![node](https://img.shields.io/node/v/@royvillasana/sdd-de.svg)](https://nodejs.org)

</div>

---

## Quick Start

### 1. Install

```bash
cd your-project
npx @royvillasana/sdd-de
```

https://github.com/user-attachments/assets/demo-setup.mp4

The CLI asks about your stack (framework, language, design source, styling), then installs the full toolkit into `.sdd-de/` and writes `CLAUDE.md` to your project root.

### 2. Open your AI agent

Open **Claude Code**, **Cursor**, or any AI agent in the same directory. It reads `CLAUDE.md` automatically and gains access to all SDD-DE skills.

### 3. Start building

```
/enrich-brief
```

Describe what you want to build. The agent walks you through the full 7-step cycle.

https://github.com/user-attachments/assets/demo-workflow.mp4

### Already installed? Update to latest

```bash
npx @royvillasana/sdd-de@latest update
```

Updates skills, docs, and agent config while **preserving your project.yaml**.

---

## How It Works

SDD-DE structures work into **two sequential epics**, each running the same 7-step cycle.

### Epic 1 — Component Library

Build UI building blocks before composing pages. Follow atomic design order:

| Level | Examples |
|---|---|
| **Tokens** | Color, spacing, typography, radius, shadow |
| **Atoms** | Button, Input, Badge, Icon, Avatar |
| **Molecules** | SearchBar, Card, FormField |
| **Organisms** | Header, Sidebar, DataTable |

When all components are built, run `/storybook` to generate stories and launch a dev server, then `/design-doc` to generate a validated `DESIGN.md` using `@google/design.md`.

### Epic 2 — Page Composition

Compose components into complete pages and features:

| Level | Examples |
|---|---|
| **Templates** | Two-column layout, dashboard shell |
| **Pages** | Homepage, Login, Dashboard, Settings |
| **Features** | Checkout flow, Onboarding wizard |

### The 7-Step Cycle

Runs once per component (Epic 1) and once per page (Epic 2):

| Step | Command | What happens |
|---|---|---|
| 1 | `/enrich-brief` | Brief → enriched story with acceptance criteria |
| 2 | `/generate-artifacts` | Story → Component Spec + Interaction Spec + Page Spec |
| 3 | `git checkout -b` | Branch before implementation |
| 4 | Implement | One spec task at a time — mark `[ ]` → `[x]` |
| 5 | `/visual-verify` | Compare live to spec — zero discrepancies |
| 6 | `/adversarial-review` | Red-team before committing |
| 7 | `/sync-tokens` → `/commit` | Sync tokens, open PR with spec as description |

https://github.com/user-attachments/assets/demo-verify.mp4

---

## Design Sources

| Source | How it works |
|---|---|
| **Figma** | Reads frames, variables, and component specs via Figma MCP |
| **Component Library** | shadcn/ui, Material UI, Radix, Ant Design, Chakra, Mantine, Headless UI |
| **GitHub Repo** | Reads component source directly from a repository |
| **ZIP File** | Reads components from a local archive |
| **Google Stitch** | Connects via Stitch MCP or reads exported ZIP |

## Frameworks

```
react · next · vue · nuxt · svelte · sveltekit · angular · astro · vanilla
```

---

## Skills Reference

| Command | Purpose |
|---|---|
| `/setup` | Configure project — framework, language, design source |
| `/enrich-brief` | Transform brief into spec-ready enriched story |
| `/generate-artifacts` | Generate Component + Interaction + Page specs |
| `/visual-verify` | Visual QA against design spec |
| `/adversarial-review` | Red-team implementation before commit |
| `/sync-tokens` | Sync design tokens between source and code |
| `/commit` | PR with Component Spec as description |
| `/storybook` | Generate Storybook stories, launch dev server |
| `/design-doc` | Generate DESIGN.md, validate with @google/design.md lint |
| `/sync-agent-symlinks` | Repair editor symlinks |

---

## What Gets Installed

```
your-project/
├── CLAUDE.md                         ← AI agent instructions
├── .claude/skills/                   ← symlinks to skills
└── .sdd-de/
    ├── project.yaml                  ← your project config
    ├── ai-specs/skills/              ← 9 slash commands
    │   ├── setup/
    │   ├── enrich-brief/
    │   ├── generate-artifacts/
    │   ├── visual-verify/
    │   ├── adversarial-review/
    │   ├── sync-tokens/
    │   ├── commit/
    │   ├── storybook/
    │   ├── design-doc/
    │   └── sync-agent-symlinks/
    └── docs/                         ← standards & templates
        ├── component-standards.md
        ├── styling-best-practices.md
        ├── framework-config.md
        ├── design-token-model.md
        └── ...
```

---

## Core Principles

- **Spec-first** — all three spec artifacts must exist before code
- **One task at a time** — mark complete before moving on
- **Token-referenced** — every value references a design token, no hardcoded hex
- **Style-encapsulated (Epic 1)** — Epic 1 components use CSS base classes with max 2 classes per element. Epic 2 pages can use Tailwind or any CSS approach freely
- **Pixel-accurate** — compare live to spec after every implementation
- **Accessible** — semantic HTML and ARIA are part of the spec
- **Always-on progress tracking** — after every response, the AI shows your position in the cycle, completed steps, and the exact next action. Derailments are flagged with corrective steps

---

## Usage Examples

**Build a Button from Figma:**
```
/enrich-brief
Build a primary Button from this Figma frame: https://figma.com/design/...
```

**Build a Login page from shadcn/ui:**
```
/enrich-brief
Build a Login page: email input, password input, submit button, "forgot password" link
```

**Update existing installation:**
```bash
npx @royvillasana/sdd-de@latest update
```

---

## Publishing (maintainers)

```bash
npm version patch && npm publish
```

---

## License

MIT
