# Documentation Standards

## Spec File Rules

- All spec files are written in English
- File names: `[component-name]-component-spec.md`, `[component-name]-interaction-spec.md`, `[page-name]-page-spec.md`
- Stored in `specs/[feature-name]/` within the project
- Version field increments when spec changes post-implementation: `1.0` → `1.1`
- Status field must be accurate: `Draft` → `Ready` → `Implemented`

## When to Update Specs

| Event | Action |
|---|---|
| Implementation reveals a gap | Update spec before fixing the code |
| Designer changes a decision | Update spec, increment version, re-run affected tasks |
| Token added during Apply | Update Design Token Model + sync to Figma |
| Visual QA finds a discrepancy | Document in verify report; update spec if Figma is authoritative |
| PR merged | Mark spec Status as `Implemented` |

## design.md Requirements

Every project must have a `design.md` at the root documenting:
1. Design system summary: token naming, font stack, color palette
2. Component inventory: all implemented components, spec file paths, status
3. Intentional deviations: where code differs from Figma, with rationale
4. Open decisions: design questions not yet resolved

## Prompt Log

`specs/[feature-name]/prompt-log.md` captures which Claude Code prompts worked, which needed refinement, and reusable patterns for future cycles.

## Never Document

- Implementation details obvious from reading the code
- Temporary debugging notes
- Anything git history already captures
