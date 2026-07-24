# Skill: provision-library

Provision a component library's **real components** into the project — run the library's
own CLI for copy-source libraries (shadcn, radix), or install the package and generate
thin token-mapped wrappers for package libraries (MUI, Chakra, Ant Design, Mantine,
Headless UI). This is the missing step that makes `design_source: library` build on the
actual library instead of hand-rebuilding generic look-alikes.

## When to invoke

- User says: "provision library", "install the components", "pull shadcn", "/provision-library"
- Right after `/setup` completes for a **`design_source: library`** project, before `/extract-design-system`
- `component_dir` is empty (or missing the library's components) for a library project

> **Why this exists.** Selecting a library at setup only records `component_library`; nothing
> installs it. Without this step `/extract-design-system` reads an empty directory and the
> 7-step cycle rebuilds every component from scratch — generic components that merely resemble
> the library. A library already ships its components; provision them, don't re-create them.

## Prerequisites

Read `.sdd-de/project.yaml`:
- `design_source: library` (if not, this skill does not apply — stop)
- `component_library` — the library id (e.g. `shadcn`, `mui`)
- `component_library_kind` — `copy-source` | `package`. If missing, derive it (shadcn/radix →
  copy-source; mui/chakra/antd/mantine/headlessui → package) or **ask** for `other`.
- `framework`, `language`, `styling`, `token_file`, `component_dir`.

The user's local toolchain (node/npm/npx) must be available — the same base tools the
project already uses. This skill runs the library's tooling through that toolchain; it never
vendors, bundles, or proxies the library.

## Steps

### 0. Idempotency scan (always first)

List what already exists in `component_dir`. Provisioning is **resumable**: skip components
that are already present (or refresh them in place on an explicit re-run), never duplicate.
Keep a short list of what you add so the final report is honest ("added 6, skipped 4").

### Branch A — copy-source libraries (shadcn, radix)

The library's CLI copies component **source files** into the repo. Those files ARE the design
system — read/spec/verify them like any owned component. **Do not reimplement** a component
the CLI can produce.

#### shadcn/ui

1. **Init once** (idempotent — skip if `components.json` / the shadcn config already exists).
   Run non-interactively, honoring the project's stack so it wires to the real token file:
   ```bash
   npx shadcn@latest init --yes --defaults
   ```
   If the CLI needs values it can't infer (style, base color, CSS var vs. Tailwind, the
   `token_file` path, the `component_dir` alias), pre-answer them from `project.yaml` via flags
   or a written `components.json` config rather than leaving prompts open.
2. **Add a default component set** into `component_dir` (extend later as the briefs demand):
   ```bash
   npx shadcn@latest add --yes button input textarea card dialog badge select checkbox tabs dropdown-menu
   ```
   Only add what isn't already present (Step 0).
3. The copied `.tsx` files now live under `component_dir` (e.g. `components/ui/*`). Leave them
   as the source of truth. Reconcile their token usage with `token_file` during the cycle —
   don't rewrite them from scratch.

#### radix (styled wrappers the user owns)

Radix ships **unstyled primitives**, so "copy-source" here means *you own the styled file*:
1. Install the primitives you need: `npm install @radix-ui/react-<primitive> …`
2. Scaffold one styled wrapper per primitive into `component_dir` that composes the Radix
   primitive and styles it via the project's `styling` + `token_file`. This wrapper is owned
   source (spec/verify it), but it **delegates behavior** to Radix — never re-implement the
   primitive's interaction logic.

### Branch B — package libraries (MUI, Chakra, Ant Design, Mantine, Headless UI)

Components are imported from an installed package; you don't own their source. Provision by
installing the package and generating **thin wrappers** that import the real component and map
the project's design tokens onto it.

1. **Install the package** through the user's toolchain, e.g.:
   - `mui` → `npm install @mui/material @emotion/react @emotion/styled`
   - `chakra` → `npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion`
   - `antd` → `npm install antd`
   - `mantine` → `npm install @mantine/core @mantine/hooks`
   - `headlessui` → `npm install @headlessui/react`
2. **Generate one wrapper per default primitive** in `component_dir` (button, input, card,
   dialog, badge, select, …). Each wrapper:
   - imports the component from the library (`import { Button as MuiButton } from "@mui/material"`),
   - re-exports it composed with the project's props/defaults,
   - applies design values **through the library's own theming** (MUI/Chakra theme, Mantine CSS
     vars, antd ConfigProvider) or `className`, and every color/spacing/radius/typography value
     it sets **references a design token** from `token_file` — never a hardcoded hex/px.
   - **delegates behavior** to the library; it does not re-create the component.
3. If the library needs a provider at the app root (MUI `ThemeProvider`, Chakra `ChakraProvider`,
   Mantine `MantineProvider`, antd `ConfigProvider`), note it and wire a token-fed theme object
   (map `token_file` values into the provider's theme). Record this in the wrapper's spec.

### 3. Failure handling (both branches)

- Run CLIs **non-interactively** (`--yes`/`--defaults`). Capture the command + its output so a
  failure is legible.
- If a CLI genuinely can't run head-less (needs a TTY prompt), STOP and surface the **exact
  command** for the user to run in the in-app terminal, then re-check — do not fake or partially
  apply it.
- Never `sudo`. Never install globally. Use the project's local package manager.

### 4. Verify (do not build a component the library provides)

```bash
# Copy-source: real component files landed.
find [component_dir] -type f \( -name "*.tsx" -o -name "*.jsx" \) | head
# Package: the package is installed and wrappers import from it.
grep -RL "from \"@[a-z]" [component_dir] --include="*.tsx"   # wrappers with no library import → suspicious
```
Confirm: (a) the expected components exist in `component_dir`, (b) for package libraries each
wrapper imports the real library component, (c) nothing was reimplemented that the library ships.

### 5. Announce

```
──────────────────────────────────────────────
 ✓ Library provisioned — [library] ([kind])
   Added:   [N components]   Skipped (already present): [M]
   Location: [component_dir]
──────────────────────────────────────────────
 What happens next
──────────────────────────────────────────────
 Next step → /extract-design-system
 It inventories the provisioned components into
 .sdd-de/components.json. Then the 7-step cycle
 ADAPTS them (props · tokens · customization) —
 it does not rebuild what the library ships.
──────────────────────────────────────────────
```

## Checklist

- [ ] `design_source: library` and `component_library` / `component_library_kind` read from `project.yaml`
- [ ] Idempotency scan ran; already-present components skipped, not duplicated
- [ ] copy-source: the library CLI wrote real component files into `component_dir` (no reimplementation)
- [ ] package: the package is installed AND each wrapper imports the real library component
- [ ] All design values in generated wrappers reference `token_file`, never hardcoded
- [ ] CLIs ran non-interactively; any un-runnable command was surfaced for the terminal, not faked
- [ ] Final report lists added vs. skipped; next step points at `/extract-design-system`
