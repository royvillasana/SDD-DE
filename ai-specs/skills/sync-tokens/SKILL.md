# Skill: sync-tokens

Sync design tokens between Figma Variables and the project token file after implementation.

## When to invoke

User says: "sync tokens", "sync Figma tokens", "/sync-tokens", or after visual-verify passes but before commit.

## Before starting

Read `.sdd-de/project.yaml` to determine:
- `design_source` — `figma` | `library` | `github` | `zip` | `stitch`
- `token_file` — path to the project's design token file
- `component_dir` — root component directory

---

## Branch A — Figma Flow  (design_source: figma)

Use this branch when `design_source: figma`.

### Step 0 — Token Completeness Validation (MANDATORY FIRST)

Before syncing individual tokens, validate that the Figma file provides a complete
design system. Read the Figma Variables collection (`figma_token_collection`) and
Figma Text Styles via the Figma MCP, then check every category below.

If tokens are missing, **do not proceed** — list what's missing and ask the user to
add the variables/styles in Figma before continuing.

#### Required Token Categories

**Colors** — Figma Variables in the token collection:

| Required Variable | Purpose | Example |
|---|---|---|
| `color/primary` | Primary brand / CTA | `#1A73E8` |
| `color/primary-hover` | Primary hover state | `#1557B0` |
| `color/primary-foreground` | Text on primary | `#FFFFFF` |
| `color/secondary` | Secondary actions | `#6C757D` |
| `color/secondary-hover` | Secondary hover | `#545B62` |
| `color/secondary-foreground` | Text on secondary | `#FFFFFF` |
| `color/background` | Page background | `#FFFFFF` |
| `color/foreground` | Primary text | `#171717` |
| `color/muted` | Subtle backgrounds | `#F5F5F5` |
| `color/muted-foreground` | Secondary text | `#737373` |
| `color/card` | Card surface | `#FFFFFF` |
| `color/card-foreground` | Card text | `#171717` |
| `color/border` | Borders, dividers | `#E5E5E5` |
| `color/input` | Input borders | `#D4D4D4` |
| `color/ring` | Focus ring | `#2563EB` |
| `color/destructive` | Error, delete | `#DC2626` |
| `color/destructive-foreground` | Text on destructive | `#FFFFFF` |
| `color/success` | Success states | `#16A34A` |
| `color/warning` | Warning states | `#D97706` |
| `color/info` | Informational | `#2563EB` |
| `color/accent` | Accent highlights | varies |
| `color/accent-foreground` | Text on accent | varies |

**Typography** — Figma Text Styles OR Variables:

| Required Token | Purpose | Example |
|---|---|---|
| `font-family/sans` | Body text, UI | `Inter, system-ui, sans-serif` |
| `font-family/mono` | Code, terminal | `JetBrains Mono, monospace` |
| `font-family/display` | Display headings (optional) | `Instrument Serif, serif` |
| `font-size/xs` | Captions, badges | `11px` / `0.6875rem` |
| `font-size/sm` | Small text, labels | `13px` / `0.8125rem` |
| `font-size/base` | Body text | `15px` / `0.9375rem` |
| `font-size/lg` | Large body, subheads | `18px` / `1.125rem` |
| `font-size/xl` | Section headings | `20px` / `1.25rem` |
| `font-size/2xl` | Page headings | `24px` / `1.5rem` |
| `font-size/3xl` | Hero subheads | `30px` / `1.875rem` |
| `font-size/4xl` | Hero headings | `36px` / `2.25rem` |
| `font-size/5xl` | Display text | `48px` / `3rem` |
| `font-weight/regular` | Body text | `400` |
| `font-weight/medium` | Emphasis, labels | `500` |
| `font-weight/semibold` | Subheadings | `600` |
| `font-weight/bold` | Headings, CTAs | `700` |
| `line-height/tight` | Headings | `1.2` |
| `line-height/snug` | Subheadings | `1.35` |
| `line-height/normal` | Body text | `1.5` |
| `line-height/relaxed` | Long-form text | `1.65` |
| `letter-spacing/tight` | Headings | `-0.025em` |
| `letter-spacing/normal` | Body | `0em` |
| `letter-spacing/wide` | Labels, caps | `0.05em` |

**Typography Compositions** — these map to HTML elements:

| Composition | Maps to | Font size | Weight | Line height |
|---|---|---|---|---|
| `heading/h1` | `<h1>` | `font-size/4xl` | `bold` | `tight` |
| `heading/h2` | `<h2>` | `font-size/3xl` | `bold` | `tight` |
| `heading/h3` | `<h3>` | `font-size/2xl` | `semibold` | `snug` |
| `heading/h4` | `<h4>` | `font-size/xl` | `semibold` | `snug` |
| `heading/h5` | `<h5>` | `font-size/lg` | `medium` | `normal` |
| `heading/h6` | `<h6>` | `font-size/base` | `medium` | `normal` |
| `body/default` | `<p>` | `font-size/base` | `regular` | `normal` |
| `body/small` | `<small>` | `font-size/sm` | `regular` | `normal` |
| `body/large` | lead paragraphs | `font-size/lg` | `regular` | `relaxed` |
| `link/default` | `<a>` | inherits | `medium` | inherits |
| `label/default` | `<label>`, form labels | `font-size/sm` | `medium` | `normal` |
| `caption/default` | captions, helper text | `font-size/xs` | `regular` | `normal` |
| `code/inline` | `<code>` | `font-size/sm` | `regular` (mono) | `normal` |
| `code/block` | `<pre>` | `font-size/sm` | `regular` (mono) | `relaxed` |

**Spacing** — Figma Variables (used in auto-layout padding and gap):

| Required Variable | Value | Purpose |
|---|---|---|
| `spacing/0` | `0px` | None |
| `spacing/1` | `4px` | Tight inner padding |
| `spacing/2` | `8px` | Small gap, icon padding |
| `spacing/3` | `12px` | Input padding, badge |
| `spacing/4` | `16px` | Default component padding |
| `spacing/5` | `20px` | Medium padding |
| `spacing/6` | `24px` | Card padding, section gap |
| `spacing/8` | `32px` | Large section gap |
| `spacing/10` | `40px` | Section padding |
| `spacing/12` | `48px` | Page section spacing |
| `spacing/16` | `64px` | Major section divider |
| `spacing/20` | `80px` | Hero padding |
| `spacing/24` | `96px` | Full section height spacing |

**Border Radius** — Figma Variables (applied to corner radius):

| Required Variable | Value | Purpose |
|---|---|---|
| `radius/none` | `0px` | Sharp corners |
| `radius/sm` | `4px` | Subtle rounding (badges, tags) |
| `radius/md` | `8px` | Buttons, inputs, cards |
| `radius/lg` | `12px` | Modals, large cards |
| `radius/xl` | `16px` | Hero sections, large panels |
| `radius/2xl` | `24px` | Pill-adjacent rounding |
| `radius/full` | `9999px` | Pills, avatars, circular |

**Shadow** — Figma Effect Styles:

| Required Style | Value | Purpose |
|---|---|---|
| `shadow/sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation (inputs) |
| `shadow/md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, dropdowns |
| `shadow/lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, popovers |
| `shadow/xl` | `0 20px 25px rgba(0,0,0,0.1)` | Floating panels |

#### Validation Output

After checking, output a completeness report:

```
🔵 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Token Completeness — Figma Variables Audit

  Colors:      [N]/22 ✅ or ⚠️ missing: [list]
  Typography:  [N]/14 tokens + [N]/14 compositions ✅ or ⚠️ missing: [list]
  Spacing:     [N]/13 ✅ or ⚠️ missing: [list]
  Radius:      [N]/7  ✅ or ⚠️ missing: [list]
  Shadows:     [N]/4  ✅ or ⚠️ missing: [list]

  Verdict: ✅ COMPLETE — all tokens present
           ⚠️ INCOMPLETE — missing tokens listed above
🔵 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Do NOT block the user if tokens are missing.** Instead:

1. List exactly which tokens are missing so they know what to add in Figma
2. Remind them that having a complete token set produces better, more consistent code
3. Continue with the sync steps using whatever tokens are available
4. Save the missing tokens list to `specs/token-gaps.md` so it persists across sessions

The missing tokens will be surfaced again at two checkpoints:
- **Before Epic 2 starts** (`/design-doc` will flag them when composing DESIGN.md)
- **Whenever tokens are updated** — if the user adds the missing tokens later,
  re-run `/sync-tokens` to pick them up, then update `DESIGN.md` and `CLAUDE.md`
  to reflect the new tokens

When tokens are added at any point:
1. Re-run `/sync-tokens` to sync the new tokens to the project token file
2. Re-run `npx @google/design.md lint DESIGN.md` to validate
3. Update `DESIGN.md` YAML frontmatter with the new token values
4. Update `design.md` if implementation decisions changed
5. Delete `specs/token-gaps.md` once all gaps are filled

### Steps (continue regardless of completeness)

1. **Read `.sdd-de/project.yaml`** — note the `token_file` path and `figma_token_collection`

2. **Audit the implementation** for any token variable references added during Apply:

```bash
# CSS custom properties
grep -rn "var(--" [component-dir]/[component-name] | sort -u

# SCSS variables
grep -rn "\$[a-z-]" [component-dir]/[component-name] | sort -u
```

3. **Compare to Figma Variables** via the Figma MCP:
```
Using the Figma MCP, list all variables in the [figma_token_collection] collection.
```

4. **For each token reference without a Figma Variable counterpart**:
   - Create the variable in Figma Variables (correct collection, correct name)
   - Apply it to the relevant layers in the Figma frame
   - Document in `design.md`: "Added `--[token-name]` — no Figma Variable existed; created during implementation"

5. **For each Figma Variable without a project token counterpart**:
   - Add it to the project token file (path from `project.yaml → token_file`)
   - Document in `design.md`

6. **Verify design.md is current**: All implementation decisions that deviate from the original spec must be documented.

7. **Update `docs/design-token-model.md`** if new token categories were introduced.

8. **Announce**:

```
──────────────────────────────────────────────
 ✓ Token sync complete
   [N] tokens added to Figma
   [N] tokens added to [token_file]
   design.md updated
──────────────────────────────────────────────
 What happens next
──────────────────────────────────────────────

 Next step → /commit

 Claude will stage the component files and spec artifacts,
 create a commit, and open a pull request with the Component
 Spec as the PR description. Make sure your branch is up to
 date with main before running.

 Run it now: /commit
──────────────────────────────────────────────
```

---

## Branch B — Component Library Flow  (design_source: library)

Use this branch when `design_source: library`.
There is no Figma Variable sync. The goal is to ensure all brand customizations use token variables rather than hardcoded values.

### Steps

1. **Read `.sdd-de/project.yaml`** — note the `token_file` path

2. **Audit the component's customization layer** for hardcoded values:

```bash
# Find hardcoded hex values (must return empty)
grep -rn '#[0-9a-fA-F]\{3,8\}' [component-dir]/[component-name]

# Find hardcoded pixel values
grep -rn '[0-9]\+px' [component-dir]/[component-name]
```

3. **For each hardcoded value found**:
   - Create a token variable in the project token file (path from `token_file`)
   - Replace the hardcoded value with the token reference
   - Document in `design.md`: "Added `--[token-name]` to replace hardcoded `[value]`"

4. **Verify the token file is organized**:
   - Group tokens by category (color, spacing, typography, radius, shadow)
   - Ensure all tokens follow the naming convention: `--[category]-[subcategory]-[variant]`

5. **Update design.md** with any tokens added or removed during this sync.

6. **Update `docs/design-token-model.md`** if new token categories were introduced.

7. **Announce**:

```
──────────────────────────────────────────────
 ✓ Token sync complete
   [N] tokens added to [token_file]
   No Figma sync required (library flow)
   design.md updated
──────────────────────────────────────────────
 What happens next
──────────────────────────────────────────────

 Next step → /commit

 Claude will stage the component files and spec artifacts,
 create a commit, and open a pull request with the Component
 Spec as the PR description. Make sure your branch is up to
 date with main before running.

 Run it now: /commit
──────────────────────────────────────────────
```

---

## Branch C — GitHub Repository Flow  (design_source: github)

Same process as Branch B (library). No Figma sync is needed.
The goal is to verify that all customizations applied to the GitHub repo's components use token variables, not hardcoded values.

### Steps

Follow all steps from Branch B exactly.
After the token audit, also check:

- Any values copied verbatim from the GitHub repo's source files that are hardcoded → replace with token variables
- Document in `design.md`: "Replaced hardcoded value `[value]` from source repo with `--[token-name]`"

**Announce**:

```
──────────────────────────────────────────────
 ✓ Token sync complete
   [N] tokens added to [token_file]
   Source: GitHub repo
   design.md updated
──────────────────────────────────────────────
 What happens next
──────────────────────────────────────────────

 Next step → /commit

 Claude will stage the component files and spec artifacts,
 create a commit, and open a pull request with the Component
 Spec as the PR description. Make sure your branch is up to
 date with main before running.

 Run it now: /commit
──────────────────────────────────────────────
```

---

## Branch D — ZIP File Flow  (design_source: zip)

Same process as Branch C (GitHub). Treat the ZIP source identically.

Follow all steps from Branch C exactly.

**Announce**:

```
──────────────────────────────────────────────
 ✓ Token sync complete
   [N] tokens added to [token_file]
   Source: ZIP archive
   design.md updated
──────────────────────────────────────────────
 What happens next
──────────────────────────────────────────────

 Next step → /commit

 Claude will stage the component files and spec artifacts,
 create a commit, and open a pull request with the Component
 Spec as the PR description. Make sure your branch is up to
 date with main before running.

 Run it now: /commit
──────────────────────────────────────────────
```

---

## Branch E — Google Stitch Flow  (design_source: stitch)

Stitch provides a `design.md` file with all design system values. The sync goal is to map every
value in `design.md` to a project token variable — no hardcoding.

### Steps

1. **Read `.sdd-de/project.yaml`** — note `stitch_connection`, `token_file`

2. **Get the Stitch design system**:
   - **MCP** (`stitch_connection: mcp`): call `extract_design_context` via the Stitch MCP to get the current design tokens
   - **ZIP** (`stitch_connection: zip`): read `design.md` from the extracted ZIP

3. **Map every Stitch design value to a project token variable**:

   | Stitch `design.md` field | Project token variable |
   |---|---|
   | `Colors → Primary: #1A73E8` | `--color-brand-primary: #1A73E8` |
   | `Typography → Body: 16px` | `--font-size-base: 16px` |
   | `Spacing → md: 16px` | `--spacing-4: 16px` |
   | `Components → Button border-radius: 8px` | `--radius-md: 8px` |

4. **Write unmapped values** to `token_file` as new token variables. Follow the project's naming convention (`--color-*`, `--font-*`, `--spacing-*`, `--radius-*`).

5. **Audit the implementation** for any hardcoded values that should use the mapped tokens:
   ```bash
   grep -rn '#[0-9a-fA-F]\{3,8\}' [component-file]
   grep -rn '[0-9]\+px' [component-file]
   ```

6. **Update `design.md`** with the complete mapping table: Stitch value → project token variable.

7. **Update `docs/design-token-model.md`** if new token categories were introduced.

8. **Announce**:

```
──────────────────────────────────────────────
 ✓ Token sync complete
   [N] Stitch values mapped to project tokens in [token_file]
   design.md updated
──────────────────────────────────────────────
 What happens next
──────────────────────────────────────────────

 Next step → /commit

 Claude will stage the component files and spec artifacts,
 create a commit, and open a pull request with the Component
 Spec as the PR description. Make sure your branch is up to
 date with main before running.

 Run it now: /commit
──────────────────────────────────────────────
```
