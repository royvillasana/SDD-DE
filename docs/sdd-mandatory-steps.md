# SDD Mandatory Steps

Every SDD cycle — regardless of component size or complexity — must execute all steps in this order. No shortcuts.

---

## Step 0 — Branch (MANDATORY FIRST STEP)

Create a feature branch before any file changes.

```bash
git checkout -b feature/[component-name]-spec
```

Branch naming: `feature/[component-name]-spec` or `feature/[page-name]-layout`.

**Gate**: No spec files, no code changes, and no Figma exports happen on `main`. If you are on `main`, stop and branch first.

---

## Step 1 — Enrich

Transform the design brief into an implementation-ready spec story.

- Input: design brief, Figma frame URL, or user story
- Output: enriched spec story with acceptance criteria, edge cases, and token requirements identified
- Tool: `/enrich-brief` skill

**Gate**: The enriched story must answer: What does it look like? What does it do? What tokens does it use? What are the failure states?

---

## Step 2 — Specify

Generate all three spec artifacts from the enriched story.

- **Component Spec** (`specs/[component]-component-spec.md`) — visual properties, variants, states, sizes, content rules, a11y
- **Interaction Spec** (`specs/[component]-interaction-spec.md`) — triggers, flows, timing, easing, edge cases
- **Page/Feature Spec** (`specs/[page]-page-spec.md`) — composition, layout, responsive breakpoints, data flow
- Tool: `/generate-artifacts` skill

**Gate**: All three files exist and are complete before any Claude Code session opens.

---

## Step 3 — Apply (AGENT EXECUTES)

Use Claude Code to implement the spec one task at a time.

```
claude "Read specs/[component]-component-spec.md and implement the [ComponentName] component.
Use only CSS custom properties from globals.css. No hardcoded values."
```

Rules:
- One task per prompt. Never ask Claude to implement the full spec in one shot.
- After each task: mark it complete in the spec (`- [ ]` → `- [x]`).
- After each task: run the dev server and visually inspect the change before continuing.

**Gate**: Every task checkbox is checked before moving to Verify.

---

## Step 4 — Visual Verify (AGENT EXECUTES)

Compare the live implementation to the Figma spec, side by side.

Checklist:
- [ ] Open the component in the browser at the correct viewport (375px, 768px, 1440px)
- [ ] Open the Figma frame in Dev Mode
- [ ] Compare: every color → matches design token
- [ ] Compare: every spacing value → matches design token
- [ ] Compare: font size, weight, line-height → matches design token
- [ ] Compare: border radius → matches design token
- [ ] Compare: all variants present and correct
- [ ] Compare: all states (hover, focus, disabled, loading, error) present and correct
- [ ] Run axe accessibility audit → zero errors
- [ ] Tool: `/visual-verify` skill

**Gate**: Zero unresolved discrepancies. Document any intentional deviations in `design.md`.

---

## Step 5 — Sync

Update design.md and token files to reflect implementation decisions.

- If a token was added during Apply: add it to Figma Variables and to `globals.css`
- If a spec decision changed during Apply: update the spec file to match
- If a component API changed: update the Component Spec props table
- Tool: `/sync-tokens` skill

**Gate**: `design.md` reflects current reality. No undocumented deviations.

---

## Step 6 — Commit

Push a PR where the spec IS the PR description.

```bash
git add .
git commit -m "feat([component]): implement [ComponentName] per spec"
gh pr create --title "feat: [ComponentName]" --body "$(cat specs/[component]-component-spec.md)"
```

PR checklist:
- [ ] Branch is up to date with `main`
- [ ] All tasks in spec are checked
- [ ] Visual QA passed (attach screenshots)
- [ ] Figma link included in PR description
- [ ] Tool: `/commit` skill

**Gate**: PR is opened. No direct pushes to `main`.

---

## Epic 1 Completion Gate — MANDATORY

After the last component is committed and before starting any Epic 2 work:

### Run `/storybook`

Generate stories for every component and launch the Storybook dev server. Verify all components render correctly with their variants and states.

### Run `/design-doc`

Generate `DESIGN.md` at the project root using the `@google/design.md` format.

1. The AI agent reads all components and the token file
2. The AI agent composes DESIGN.md with YAML frontmatter (`colors`, `typography`, `rounded`, `spacing`, `components`) and Markdown prose (design intent, component usage)
3. Run `npx @google/design.md lint DESIGN.md` — must pass with zero errors
4. Run `npx @google/design.md export DESIGN.md --format css-vars` — verify token consistency
5. CLAUDE.md is updated to reference DESIGN.md for Epic 2

**Gate**: DESIGN.md exists, passes lint, and CLAUDE.md references it. Do not start Epic 2 without this.
