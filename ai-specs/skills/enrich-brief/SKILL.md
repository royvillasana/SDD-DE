# Skill: enrich-brief

Transform a vague design brief, Figma frame URL, or user story into an implementation-ready spec story.

## When to invoke

User says: "enrich this brief", "make this spec-ready", "/enrich-brief", or provides a Figma URL with a vague description.

## Steps

1. **Receive input** — brief, Figma URL, or user story
2. **If Figma URL provided**: read the frame via the Figma MCP; extract layer names, component properties, variables
3. **Identify gaps**: What states are missing? What tokens are undefined? What edge cases are unstated?
4. **Ask targeted questions** (max 3): only ask what blocks spec creation
5. **Write the enriched story** using this structure:

```markdown
## [Feature Name] — Enriched Spec Story

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
- [ ] Tokens used: [list]

### Design Tokens Required
| Token | Value | Status |
|---|---|---|
| `--color-brand-primary` | `#F4A500` | Exists |
| `--spacing-new` | `20px` | MISSING — must create |

### Edge Cases
- [Case 1]
- [Case 2]

### Out of Scope (MVP)
- [Excluded item 1]
```

6. **Save** to `specs/[feature-name]/enriched-story.md`
7. **Announce**: "Enriched story saved. Ready to run /generate-artifacts."
