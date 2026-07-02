# Skill: enrich-brief

Transform a vague design brief, Figma frame URL, or user story into an implementation-ready spec story.

## When to invoke

User says: "enrich this brief", "make this spec-ready", "/enrich-brief", or provides a Figma URL with a vague description.

## Before starting

Read `.sdd-de/project.yaml` to determine `design_source`:
`figma` | `library` | `github` | `zip` | `stitch`

The enrichment process branches based on where design specs come from.

---

## Branch A — Figma Flow  (design_source: figma)

Use this branch when `design_source: figma`.

### Steps

1. **Receive input** — brief, Figma frame URL, or user story
2. **Read the Figma frame** via the Figma MCP:
   - Extract layer names, component properties, and Figma Variable references
   - List all variants, states, and responsive behaviors
   - Note the Figma Variable collection from `project.yaml → figma_token_collection`
3. **Identify gaps**: What states are missing? What tokens are undefined? What edge cases are unstated?
4. **Ask targeted questions** (max 3): only ask what blocks spec creation
5. **Write the enriched story**:

```markdown
## [Feature Name] — Enriched Spec Story
Source: Figma — [frame URL]

### What It Is
[One sentence description]

### User Story
As a [user type], I want to [action] so that [outcome].

### Acceptance Criteria
- [ ] At 375px: [visual description]
- [ ] At 768px: [visual description]
- [ ] At 1440px: [visual description]
- [ ] Hover state: [description]
- [ ] Focus state: [description]
- [ ] Disabled state: [description]
- [ ] Loading state: [description]
- [ ] Error state: [description]
- [ ] Screen reader announces: [text]

### Design Tokens Required
| Token | Figma Variable | Status |
|---|---|---|
| `--color-brand-primary` | `color/brand/primary` | Exists |
| `--spacing-new` | — | MISSING — must create |

### Edge Cases
- [Case 1]
- [Case 2]

### Out of Scope (MVP)
- [Excluded item 1]
```

6. **Save** to `specs/[feature-name]/enriched-story.md`
7. **Announce**: "Enriched story saved. Source: Figma. Ready to run /generate-artifacts."

---

## Branch B — Component Library Flow  (design_source: library)

Use this branch when `design_source: library`.

### Steps

1. **Receive input** — brief, component name, or description of needed UI
2. **Identify the base component** from the library (from `project.yaml → component_library`):
   - What component from the library is closest to the requested UI?
   - What variants/props does the base component expose?
   - What needs to be customized (tokens, extra variants, composition)?
3. **Identify gaps**: What does the library component not cover? What brand-specific changes are needed?
4. **Ask targeted questions** (max 3): only ask what blocks spec creation
5. **Write the enriched story**:

```markdown
## [Feature Name] — Enriched Spec Story
Source: [library name] — [base component name]

### What It Is
[One sentence description]

### Base Component
Library: [library name]
Component: [LibraryComponentName]
Customization needed: [brief summary]

### User Story
As a [user type], I want to [action] so that [outcome].

### Acceptance Criteria
- [ ] Base library component renders correctly
- [ ] Brand tokens applied (color, spacing, radius, typography)
- [ ] Extra variants added: [list]
- [ ] At 375px: [visual description]
- [ ] At 768px: [visual description]
- [ ] At 1440px: [visual description]
- [ ] All library-native states work: hover, focus, disabled, loading, error
- [ ] Screen reader announces: [text]

### Design Tokens Required
| Token | Current Value | Status |
|---|---|---|
| `--color-brand-primary` | `#F4A500` | Exists |
| `--radius-component` | — | MISSING — must add |

### Customization Plan
[What to override in the library component and how]

### Edge Cases
- [Case 1]

### Out of Scope (MVP)
- [Excluded item 1]
```

6. **Save** to `specs/[feature-name]/enriched-story.md`
7. **Announce**: "Enriched story saved. Source: [library]. Ready to run /generate-artifacts."

---

## Branch C — GitHub Repository Flow  (design_source: github)

Use this branch when `design_source: github`.

### Steps

1. **Receive input** — brief, component name, or description of needed UI
2. **Read project config** — note `github_repo_url`, `github_branch`, `github_component_dir`
3. **Fetch component source files** from the GitHub repository:
   - Construct raw file URLs: `https://raw.githubusercontent.com/[org]/[repo]/[branch]/[path]`
   - Use WebFetch to read individual component files from `github_component_dir`
   - Browse the directory listing via GitHub API: `https://api.github.com/repos/[org]/[repo]/contents/[path]?ref=[branch]`
   - Read each relevant component file to extract: props/variants/states/types
4. **Identify the closest component** to the requested UI from what the repo provides
5. **Identify gaps**: What props exist? What variants are defined? What states are implemented? What's missing?
6. **Ask targeted questions** (max 3): only ask what blocks spec creation
7. **Write the enriched story**:

```markdown
## [Feature Name] — Enriched Spec Story
Source: GitHub — [github_repo_url] ([github_branch]/[github_component_dir])

### What It Is
[One sentence description]

### Source Component
Repo: [github_repo_url]
File: [github_component_dir]/[component-file]
Available variants/props: [list extracted from source]
Customization needed: [brief summary]

### User Story
As a [user type], I want to [action] so that [outcome].

### Acceptance Criteria
- [ ] Source component renders correctly in this project
- [ ] Brand tokens applied (color, spacing, radius, typography)
- [ ] All relevant props/variants from the source are exposed
- [ ] At 375px: [visual description]
- [ ] At 768px: [visual description]
- [ ] At 1440px: [visual description]
- [ ] All states work: hover, focus, disabled, loading, error
- [ ] Screen reader announces: [text]

### Design Tokens Required
| Token | Current Value | Status |
|---|---|---|
| `--color-brand-primary` | `#F4A500` | Exists |

### Customization Plan
[What to adapt from the source component and how]

### Edge Cases
- [Case 1]

### Out of Scope (MVP)
- [Excluded item 1]
```

8. **Save** to `specs/[feature-name]/enriched-story.md`
9. **Announce**: "Enriched story saved. Source: GitHub (`[repo]`). Ready to run /generate-artifacts."

---

## Branch D — ZIP File Flow  (design_source: zip)

Use this branch when `design_source: zip`.

### Steps

1. **Receive input** — brief, component name, or description of needed UI
2. **Read project config** — note `zip_file_path` and `zip_component_dir`
3. **Read component source files** from the extracted ZIP:
   - Read files from `zip_component_dir` using the Read tool
   - If the ZIP has not been extracted yet, ask the user to extract it first and provide the extraction path
   - Extract props, variants, states, and types from the source files
4. **Identify the closest component** to the requested UI
5. **Identify gaps**: What's available? What needs customizing?
6. **Ask targeted questions** (max 3)
7. **Write the enriched story**:

```markdown
## [Feature Name] — Enriched Spec Story
Source: ZIP — [zip_file_path] ([zip_component_dir])

### What It Is
[One sentence description]

### Source Component
Archive: [zip_file_path]
Component path: [zip_component_dir]/[component-file]
Available variants/props: [list extracted from source]
Customization needed: [brief summary]

### User Story
As a [user type], I want to [action] so that [outcome].

### Acceptance Criteria
- [ ] Source component from ZIP renders correctly in this project
- [ ] Brand tokens applied (color, spacing, radius, typography)
- [ ] All relevant props/variants from the source are exposed
- [ ] At 375px: [visual description]
- [ ] At 768px: [visual description]
- [ ] At 1440px: [visual description]
- [ ] All states work: hover, focus, disabled, loading, error
- [ ] Screen reader announces: [text]

### Design Tokens Required
| Token | Current Value | Status |
|---|---|---|
| `--color-brand-primary` | `#F4A500` | Exists |

### Customization Plan
[What to adapt from the ZIP component and how]

### Edge Cases
- [Case 1]

### Out of Scope (MVP)
- [Excluded item 1]
```

8. **Save** to `specs/[feature-name]/enriched-story.md`
9. **Announce**: "Enriched story saved. Source: ZIP (`[zip_file_path]`). Ready to run /generate-artifacts."

---

## Branch E — Google Stitch Flow  (design_source: stitch)

Use this branch when `design_source: stitch`.

Google Stitch is Google's AI design tool. It generates HTML+CSS and exports a `design.md`
file containing the full design system. There are two sub-flows based on `stitch_connection`.

### Sub-flow E1 — Stitch MCP  (stitch_connection: mcp)

1. **Read project config** — note `stitch_api_key` and `stitch_project_id`
2. **Connect to Stitch MCP** — the MCP server must be registered in Claude Code:
   ```
   claude mcp add stitch --transport http https://stitch.googleapis.com/mcp \
     --header "X-Goog-Api-Key: [stitch_api_key]" -s user
   ```
   If not yet registered, ask the user to run the command above first.
3. **List and select the project** via MCP:
   - `list_projects` — find the target project (use `stitch_project_id` if set)
   - `list_screens` — enumerate all screens in the project
4. **Extract design context** for the relevant screen(s):
   - `fetch_screen_image` → visual reference (base64 screenshot)
   - `fetch_screen_code` → raw HTML + Tailwind CSS generated by Stitch
   - `extract_design_context` → design tokens: colors, typography, spacing, component rules
5. **Identify the component** from the screen code and design context
6. **Ask targeted questions** (max 3): only ask what blocks spec creation
7. **Write the enriched story**:

```markdown
## [Feature Name] — Enriched Spec Story
Source: Google Stitch MCP — project: [project id], screen: [screen name]

### What It Is
[One sentence description]

### Design System (from Stitch extract_design_context)
Colors: [list]
Typography: [list]
Spacing: [list]
Component rules: [list]

### User Story
As a [user type], I want to [action] so that [outcome].

### Acceptance Criteria
- [ ] Stitch screen code is the implementation baseline
- [ ] All variants visible in the screen are implemented
- [ ] All Stitch design tokens mapped to project token variables
- [ ] At 375px: [visual description from screen image]
- [ ] At 768px: [visual description]
- [ ] At 1440px: [visual description]
- [ ] All states: hover, focus, disabled, loading, error
- [ ] Screen reader announces: [text]

### Design Tokens Required
| Token | Stitch Value | Status |
|---|---|---|
| `--color-brand-primary` | `#1A73E8` (from Stitch) | Map to project |

### Stitch HTML Reference
[Key structural excerpt from fetch_screen_code output]

### Edge Cases
- [Case 1]

### Out of Scope (MVP)
- [Excluded item 1]
```

8. **Save** to `specs/[feature-name]/enriched-story.md`
9. **Announce**: "Enriched story saved. Source: Google Stitch MCP (screen: [screen name]). Ready to run /generate-artifacts."

---

### Sub-flow E2 — Stitch ZIP Export  (stitch_connection: zip)

1. **Read project config** — note `stitch_zip_path`
2. **Read the Stitch ZIP contents**:
   - The ZIP contains `design.md` (design system) and `screen.png` screenshots
   - Ask the user to extract the ZIP if not already extracted
   - Read `design.md` for: colors, typography, spacing, and component rules
   - Read `screen.png` as a visual reference image
3. **Parse `design.md`** — extract all design tokens:
   - Colors → map to `--color-*` token variables
   - Typography → map to `--font-*` token variables
   - Spacing → map to `--spacing-*` token variables
   - Component rules → inform variant and state definitions
4. **Identify the component** from the screen screenshot and design.md rules
5. **Ask targeted questions** (max 3)
6. **Write the enriched story** (same template as Sub-flow E1, but reference `design.md` instead of MCP output)
7. **Save** to `specs/[feature-name]/enriched-story.md`
8. **Announce**: "Enriched story saved. Source: Google Stitch ZIP (`[stitch_zip_path]`). Ready to run /generate-artifacts."
