# Skill: generate-artifacts

Generate all three spec artifacts from an enriched story. Run after /enrich-brief.

## When to invoke

User says: "generate artifacts", "create specs", "/generate-artifacts", or after enriched story is confirmed.

## Prerequisites

- `specs/[feature-name]/enriched-story.md` must exist and be confirmed by the designer
- Design tokens must be defined (add missing ones to Figma Variables and `globals.css` first)

## Steps

1. **Read** `specs/[feature-name]/enriched-story.md`
2. **Generate Component Spec** using `docs/component-spec-template.md`:
   - Fill every section from the enriched story
   - Save to `specs/[feature-name]/[component]-component-spec.md`
3. **Generate Interaction Spec** using `docs/interaction-spec-template.md`:
   - Cover every state transition and animation
   - Save to `specs/[feature-name]/[component]-interaction-spec.md`
4. **Generate Page/Feature Spec** using `docs/page-spec-template.md`:
   - Cover layout, breakpoints, component composition, data flow
   - Save to `specs/[feature-name]/[page]-page-spec.md`
5. **Announce**: "3 artifacts generated:
   - specs/[feature-name]/[component]-component-spec.md
   - specs/[feature-name]/[component]-interaction-spec.md
   - specs/[feature-name]/[page]-page-spec.md
   Ready to run /apply."

## Output structure

```
specs/
└── [feature-name]/
    ├── enriched-story.md
    ├── [component]-component-spec.md
    ├── [component]-interaction-spec.md
    └── [page]-page-spec.md
```
