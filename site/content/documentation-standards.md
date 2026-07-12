# Documentation Standards

## Language

All documentation — spec files, design.md, comments, commit messages, and prompt logs — must be written in **English**.

---

## Spec File Rules

- All spec files are written in English
- File names: `[component-name]-component-spec.md`, `[component-name]-interaction-spec.md`, `[page-name]-page-spec.md`
- Stored in `specs/[feature-name]/` within the project
- Version field increments when spec changes post-implementation: `1.0` → `1.1`
- Status field must be accurate: `Draft` → `Ready` → `Implemented`

---

## When to Update Specs

Before modifying any spec, ask: "Does this change invalidate any completed tasks?" If yes, uncheck those tasks and re-implement.

| Event | Action |
|---|---|
| Implementation reveals a gap | Update spec before fixing the code |
| Designer changes a decision | Update spec, increment version, re-run affected tasks |
| Token added during Apply | Add to token file + sync to Figma Variables; document in design.md |
| Visual QA finds a discrepancy | Document in verify report; update spec if Figma is authoritative |
| Adversarial review finds a gap | Fix the gap, update spec if needed, re-run affected checklist items |
| PR merged | Mark spec Status as `Implemented` |

---

## When to Update Technical Docs

Before every commit, review which technical documents need updating:

| Change type | Documents to update |
|---|---|
| New design token added | `docs/design-token-model.md` + project token file |
| New component variant | Component Spec props table + variants table |
| API/prop change | Component Spec props table |
| Page layout change | Page Spec layout section + responsive breakpoints table |
| Framework or dependency change | `docs/framework-config.md` + `docs/design-engineering-standards.md` |
| New skill added | `docs/base-standards.md` skills table + run `/sync-agent-symlinks` |

---

## design.md Requirements

Every project must have a `design.md` at the project root documenting:

1. **Design system summary**: token naming conventions, font stack, color palette overview
2. **Component inventory**: all implemented components, spec file paths, status (`Draft` / `Ready` / `Implemented`)
3. **Intentional deviations**: where code differs from Figma, with explicit rationale
4. **Open decisions**: design questions not yet resolved — each with an owner and target resolution date

`design.md` is a living document. Update it during every SDD cycle.

---

## Prompt Log

`specs/[feature-name]/prompt-log.md` captures:
- Which Claude Code prompts produced pixel-accurate results on the first attempt
- Which prompts needed refinement and why
- Reusable prompt patterns for future cycles

This is optional but recommended for teams running multiple SDD cycles on the same project.

---

## Report Artifacts

Certain skills generate formal report files in `specs/[feature-name]/reports/`. Report files:
- Are named `[YYYY-MM-DD]-[step]-[name].md` (e.g. `2026-07-02-adversarial-review.md`)
- Are required before marking the corresponding step complete
- Are never deleted — they form the audit trail for the SDD cycle

---

## Never Document

- Implementation details obvious from reading the code
- Temporary debugging notes
- Anything already captured by git history (who changed what, when)
- Speculative future requirements not tied to an active spec
