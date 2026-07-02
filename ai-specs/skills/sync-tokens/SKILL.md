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

### Steps

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
