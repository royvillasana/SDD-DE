# Skill: setup

Configure or reconfigure this project for SDD-DE. Run this first, before any other skill.

## When to invoke

- User says: "set up this project", "configure sdd", "/setup", "reconfigure"
- `.sdd-de/project.yaml` does not exist yet
- The framework, design system, or styling has changed

---

## Purpose

Collect the project's framework, language, styling, and design system settings through a guided
question flow — entirely inside Claude Code. Save everything to `.sdd-de/project.yaml` so all
other skills read consistent project context.

The two key outputs of this setup are:
1. **Implementation stack** — framework, language, styling, token file, component directory
2. **Design system source** — where components and specs come from (Figma or a component library)

This determines which workflow branch every other skill will use.

---

## How to Conduct the Setup

Ask each question below **one at a time** in a clean, boxed format.
Wait for the user's answer before moving to the next question.
Do not batch questions or skip ahead.

Format every question like this:

```
──────────────────────────────────────────────
 Question N of 8 — [Question Title]
──────────────────────────────────────────────

[Question text]

[Options or input prompt]
```

Record each answer. At the end, write `.sdd-de/project.yaml` using the Write tool.

---

## Question 1 — Framework

```
──────────────────────────────────────────────
 Question 1 of 8 — Framework
──────────────────────────────────────────────

Which framework is this project using?

  1  React          (Vite / CRA)
  2  Next.js        (App Router)
  3  Vue 3
  4  Nuxt 3
  5  Svelte
  6  SvelteKit
  7  Angular
  8  Astro
  9  Vanilla        (HTML / CSS / JS)

Reply with the number or name.
```

Record as `framework`:
`1` → `react` | `2` → `next` | `3` → `vue` | `4` → `nuxt` | `5` → `svelte` |
`6` → `sveltekit` | `7` → `angular` | `8` → `astro` | `9` → `vanilla`

---

## Question 2 — Language

```
──────────────────────────────────────────────
 Question 2 of 8 — Language
──────────────────────────────────────────────

Which language does this project use?

  1  TypeScript
  2  JavaScript

Reply with the number or name.
```

Record as `language`: `1` → `typescript` | `2` → `javascript`

---

## Question 3 — Design System Source  ⚡ KEY BIFURCATION

```
──────────────────────────────────────────────
 Question 3 of 8 — Design System Source
──────────────────────────────────────────────

Where do your components and design specs come from?

  A  Figma
     Components are designed in Figma.
     Claude will use the Figma MCP to read frames, extract tokens,
     and pull component specs directly from the source of truth.

  B  Component Library
     Components come from a pre-built library
     (shadcn/ui, Material UI, Ant Design, Chakra UI, etc.)
     Claude will help customize them to match your brand tokens.

  C  GitHub Repository
     A GitHub repo that contains your component library or design system.
     Claude will read the component source files directly from the repo
     to extract APIs, variants, and prop definitions.

  D  ZIP File
     A ZIP archive that contains your components.
     Claude will read the extracted component source files to understand
     the full API surface and available variants.

  E  Google Stitch
     Google's AI design tool (stitch.withgoogle.com).
     Claude connects via the official Stitch MCP server (live: screen code,
     images, and design tokens) or reads the exported ZIP (design.md +
     screen PNGs) if MCP is not configured.

Reply with A, B, C, D, or E.
```

Record as `design_source`:
`A` → `figma` | `B` → `library` | `C` → `github` | `D` → `zip` | `E` → `stitch`

---

## Branch A — Figma Questions (if design_source = figma)

### Question 4A — Figma File URL

```
──────────────────────────────────────────────
 Question 4 of 8 — Figma File URL
──────────────────────────────────────────────

Paste the full Figma file URL from your browser.

  Example: https://www.figma.com/design/ABC123/My-Project

❯
```

Record as `figma_file_url`. If user replies "skip" or "later", record as `""`.

### Question 5A — Figma Token Collection

```
──────────────────────────────────────────────
 Question 5 of 8 — Figma Variable Collection
──────────────────────────────────────────────

What is the name of the Figma Variable collection that holds
your design tokens?

  Default: Tokens
  (Press Enter to accept, or type the collection name)

❯
```

Record as `figma_token_collection`. Default: `Tokens`.

> **Tip — connect the Desktop Bridge for a complete, cheap extraction.** After setup,
> `/extract-design-system` can pull the *entire* token set and component inventory in two
> calls (any Figma plan) if the **Figma Console MCP – Desktop Bridge** plugin is running in
> the Figma **desktop app** with your file open (port 9223). Without it, extraction falls
> back to per-node sampling, which is slower and only sees the components it samples.

Skip to Question 6 (Styling).

---

## Branch B — Library Questions (if design_source = library)

### Question 4B — Component Library

```
──────────────────────────────────────────────
 Question 4 of 8 — Component Library
──────────────────────────────────────────────

Which component library are you using?

  1  shadcn/ui      (Radix UI + Tailwind CSS)
  2  Radix UI       (unstyled primitives)
  3  Material UI    (MUI — Emotion-based)
  4  Ant Design
  5  Chakra UI      (Emotion-based)
  6  Mantine
  7  Headless UI    (Tailwind Labs)
  8  Other          (you'll specify)

Reply with the number or name.
```

Record as `component_library`. If `8`, ask for the name as a follow-up.

**Record the provisioning kind** as `component_library_kind` — it decides how the real
components get into the project (see the `/provision-library` step):
- `shadcn`, `radix` → `copy-source` (the library's CLI copies component *source files* into the repo)
- `mui`, `chakra`, `antd`, `mantine`, `headlessui` → `package` (components are imported from an installed npm package)
- `other` → **ask** the user which applies ("Does its CLI copy component files into your repo, or do you `npm install` and import it?"); record their answer.

Auto-set styling suggestion based on library:
- `shadcn` or `headlessui` → suggest `tailwind`
- `radix` or `mantine` → suggest `css-modules`
- `mui` or `chakra` → suggest `emotion`
- `antd` → suggest `scss`
- `other` → no suggestion

### Question 5B — Library Styling

After recording the library, present the styling suggestion.
Skip to Question 6 (Styling) with the auto-suggestion pre-filled.

### After setup completes (library source)

A library source is NOT ready to build against until its components are **provisioned**
into `component_dir` — nothing else installs them. So when `/setup` finishes for a
`design_source: library` project, tell the user the real next step is provisioning, and
what it will do (so it's clear the library is pulled/installed, **not rebuilt from scratch**):

```
──────────────────────────────────────────────
 ✓ Project configured — component_library: [library] ([kind])

 Next step → provision the library's real components

   Run: /provision-library

 • copy-source (shadcn/radix): runs the library's own CLI so its ACTUAL
   component source files land in [component_dir] — nothing is re-created.
 • package (MUI/Chakra/…): installs the package and generates thin,
   token-mapped wrappers that import the real components.

 Do NOT hand-build components a library already ships. After provisioning,
 run /extract-design-system to inventory them, then the 7-step cycle
 adapts them (props/tokens/customization) instead of rebuilding.
──────────────────────────────────────────────
```

---

## Branch C — GitHub Repository Questions (if design_source = github)

### Question 4C — GitHub Repository URL

```
──────────────────────────────────────────────
 Question 4 of 8 — GitHub Repository URL
──────────────────────────────────────────────

Paste the full GitHub repository URL.

  Example: https://github.com/org/design-system

❯
```

Record as `github_repo_url`. Must start with `https://github.com/`.

### Question 5C — Branch Name

```
──────────────────────────────────────────────
 Question 5 of 8 — Branch Name
──────────────────────────────────────────────

Which branch contains the components?

  Default: main

❯
```

Record as `github_branch`. Default: `main`.

### Question 5C-2 — Component Directory in Repo

```
──────────────────────────────────────────────
 Question 5 of 8 (cont.) — Component Directory
──────────────────────────────────────────────

What is the path to the component directory inside the repository?

  Example: src/components   packages/ui/src   lib/components

  Default: src/components

❯
```

Record as `github_component_dir`. Default: `src/components`.
Skip to Question 6 (Styling) — suggest `css-modules` as a neutral default.

---

## Branch D — ZIP File Questions (if design_source = zip)

### Question 4D — ZIP File Path

```
──────────────────────────────────────────────
 Question 4 of 8 — ZIP File Path
──────────────────────────────────────────────

What is the path to the ZIP file?
(Absolute path or relative to the project root)

  Example: ./design-system.zip
           /Users/you/downloads/components.zip

❯
```

Record as `zip_file_path`. Must end with `.zip`.

### Question 5D — Component Directory in ZIP

```
──────────────────────────────────────────────
 Question 5 of 8 — Component Directory in ZIP
──────────────────────────────────────────────

What is the path to the components inside the ZIP?

  Example: src/components   packages/ui/src

  Default: src/components

❯
```

Record as `zip_component_dir`. Default: `src/components`.
Skip to Question 6 (Styling) — suggest `css-modules` as a neutral default.

---

## Branch E — Google Stitch Questions (if design_source = stitch)

Google Stitch is Google's AI-powered UI design tool (stitch.withgoogle.com).
It generates HTML + CSS and exports a `design.md` file with the full design system.

### Question 4E — Connection Method

```
──────────────────────────────────────────────
 Question 4 of 8 — Google Stitch Connection
──────────────────────────────────────────────

How do you want to connect to Google Stitch?

  1  Stitch MCP  (recommended)
     Live connection via the official Stitch MCP server.
     Gives Claude access to: screen code, screen images, design tokens,
     and project structure in real time.
     Requires: a Stitch API key from stitch.withgoogle.com → Settings.

  2  Exported ZIP
     Use the ZIP file downloaded from the Stitch dashboard
     (project menu → Download).
     The ZIP contains design.md (design system) + screen PNGs.
     No API key required.

Reply with 1 or 2.
```

Record as `stitch_connection`: `1` → `mcp` | `2` → `zip`

---

### If stitch_connection = mcp

**Question 5E-1 — Stitch API Key**

```
──────────────────────────────────────────────
 Question 5 of 8 — Stitch API Key
──────────────────────────────────────────────

Paste your Stitch API key.
Get it from: stitch.withgoogle.com → Settings → API Key

  Note: Claude Code will add the Stitch MCP server automatically.
  MCP command that will be run:
    claude mcp add stitch \
      --transport http https://stitch.googleapis.com/mcp \
      --header "X-Goog-Api-Key: YOUR_KEY" \
      -s user

❯
```

Record as `stitch_api_key`.
After recording, offer to run the `claude mcp add stitch` command automatically.

**Question 5E-2 — Stitch Project ID**

```
──────────────────────────────────────────────
 Question 5 of 8 (cont.) — Stitch Project ID
──────────────────────────────────────────────

What is your Stitch project ID?
(Optional — leave blank to list projects at runtime)

  Find it in the Stitch URL: stitch.withgoogle.com/project/[project-id]

❯
```

Record as `stitch_project_id`. Default: `""` (unset).
Skip to Question 6 (Styling).

---

### If stitch_connection = zip

**Question 5E-3 — Stitch ZIP Path**

```
──────────────────────────────────────────────
 Question 5 of 8 — Stitch ZIP File Path
──────────────────────────────────────────────

Path to the Stitch exported ZIP file.
(Download from Stitch dashboard: project menu → Download)

  The ZIP contains:
    design.md    — full design system spec
    screen.png   — screenshots of each screen

❯
```

Record as `stitch_zip_path`. Must end with `.zip`.
Skip to Question 6 (Styling).

---

## Question 6 — Styling Approach

Show any auto-suggested value in brackets `[suggested]`.

```
──────────────────────────────────────────────
 Question 6 of 8 — Styling Approach
──────────────────────────────────────────────

Which styling approach does this project use?

  1  Tailwind CSS
  2  CSS Modules
  3  SCSS / Sass
  4  Styled Components
  5  Emotion
  6  Vanilla CSS

[Suggested: N — suggested value based on your choices]

Reply with the number, name, or press Enter to accept the suggestion.
```

Record as `styling`.

---

## Question 7 — Token File Path

Auto-suggest the default path based on framework:

| Framework | Default path |
|---|---|
| next | `app/globals.css` |
| nuxt | `assets/css/tokens.css` |
| svelte / sveltekit | `src/app.css` |
| angular | `src/styles/tokens.css` |
| astro | `src/styles/tokens.css` |
| vanilla | `css/tokens.css` |
| all others | `src/styles/tokens.css` |

```
──────────────────────────────────────────────
 Question 7 of 8 — Design Token File
──────────────────────────────────────────────

Where is the file that defines your design tokens?
(CSS custom properties, SCSS variables, or JS token exports)

  Default: [auto-path]

❯
```

Record as `token_file`. Accept default if user presses Enter without typing.

---

## Question 8 — Test Runner

```
──────────────────────────────────────────────
 Question 8 of 8 — Test Runner
──────────────────────────────────────────────

Which test runner does this project use?

  1  Vitest
  2  Jest
  3  Playwright
  4  Cypress
  5  None

Reply with the number or name.
```

Record as `test_runner`.

---

## Save Configuration

After all 8 questions, write `.sdd-de/project.yaml`:

### For Figma flow:

```yaml
# SDD-DE Project Configuration
# Generated by /setup — update any time your stack changes.
# See .sdd-de/docs/framework-config.md for framework-specific guidance.

framework: [value]
language: [value]
styling: [value]

# Design system source
design_source: figma
figma_file_url: [url or ""]
figma_token_collection: [collection name]

token_file: [path]
component_dir: [auto-derived from framework or src/components]
test_runner: [value]
```

### For Library flow:

```yaml
design_source: library
component_library: [library name]
```

### For GitHub Repository flow:

```yaml
design_source: github
github_repo_url: "[https://github.com/org/repo]"
github_branch: [branch]
github_component_dir: [path inside repo]
```

### For ZIP File flow:

```yaml
design_source: zip
zip_file_path: "[path/to/archive.zip]"
zip_component_dir: [path inside zip]
```

### For Google Stitch — MCP connection:

```yaml
design_source: stitch
stitch_connection: mcp
stitch_api_key: "[AIza...]"
stitch_project_id: "[proj_abc123 or empty]"
```

### For Google Stitch — ZIP export:

```yaml
design_source: stitch
stitch_connection: zip
stitch_zip_path: "[path/to/stitch-export.zip]"
```

**Full YAML structure** (all five cases share these fields):

```yaml
# SDD-DE Project Configuration
# Generated by /setup — update any time your stack changes.
# See .sdd-de/docs/framework-config.md for framework-specific guidance.

framework: [value]
language: [value]
styling: [value]

# Design system source: figma | library | github | zip
design_source: [value]
[source-specific fields above]

token_file: [path]
component_dir: [auto-derived or user-provided]
test_runner: [value]
```

**Auto-derive `component_dir`** from framework:
| Framework | Path |
|---|---|
| nuxt | `components` |
| svelte / sveltekit | `src/lib/components` |
| astro | `src/components` |
| all others | `src/components` |

---

## Confirm and Announce

After writing the file, display this summary:

```
──────────────────────────────────────────────
 Setup complete — .sdd-de/project.yaml saved
──────────────────────────────────────────────

  Framework:       [value]
  Language:        [value]
  Styling:         [value]
  Design source:   [one of the following]
                   Figma → [url]
                   Library → [library name]
                   GitHub → [repo url] ([branch]/[dir])
                   ZIP → [zip path] ([component dir])
  Token file:      [path]
  Components:      [component_dir]
  Test runner:     [value]

──────────────────────────────────────────────
 Available skills
──────────────────────────────────────────────

  /setup              run again to reconfigure
  /extract-design-system  pull the full token set + component inventory (Figma)
  /enrich-brief       transform a brief into a spec-ready story
  /generate-artifacts generate Component, Interaction, and Page specs
  /visual-verify      compare live implementation to design spec
  /adversarial-review red-team implementation before committing
  /sync-tokens        sync design tokens
  /commit             push PR with spec as description

──────────────────────────────────────────────
 What happens next
──────────────────────────────────────────────

 [If design_source = figma]
 Next step → /extract-design-system

 Pull the complete token set and component inventory from your
 Figma file — once — before building. This writes your token file
 and .sdd-de/components.json, so the cycle builds on the real,
 complete design system instead of rediscovering it each run.

 Run it now: /extract-design-system

 [If design_source = library | github | zip | stitch]
 Next step → /enrich-brief

 You'll bring a brief, a URL, or a user story and Claude will
 transform it into a spec-ready enriched story — complete with
 acceptance criteria, all states, required design tokens, and
 edge cases. This is the input to the 7-step cycle.

 Run it now: /enrich-brief
──────────────────────────────────────────────
```
