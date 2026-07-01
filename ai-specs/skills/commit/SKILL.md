# Skill: commit

Create a focused commit and open a pull request where the Component Spec is the PR description.

## When to invoke

User says: "commit", "create PR", "/commit", or after visual-verify passes.

## Prerequisites

- Visual Verify passed (zero unresolved discrepancies)
- `specs/[feature-name]/visual-verify-report.md` exists
- `design.md` is up to date

## Steps

1. **Stage changes**:
```bash
git add src/components/ui/[component-name].tsx
git add specs/[feature-name]/
git add docs/design-token-model.md   # if new tokens were added
git add src/app/globals.css           # if new tokens were added
```

2. **Create commit**:
```bash
git commit -m "feat([component]): implement [ComponentName] per SDD spec

- All variants: primary, secondary, ghost, destructive
- All states: default, hover, focus, active, disabled, loading, error
- Responsive: 375px / 768px / 1440px
- Visual QA: passed
- Accessibility: axe audit clean

Spec: specs/[feature-name]/[component]-component-spec.md"
```

3. **Push branch**:
```bash
git push -u origin feature/[component-name]-spec
```

4. **Create PR** using the Component Spec as the body:
```bash
gh pr create \
  --title "feat: [ComponentName] — SDD Implementation" \
  --body "$(cat specs/[feature-name]/[component]-component-spec.md)" \
  --label "design-engineering"
```

5. **Announce**: "PR created. Link: [PR URL]"

## PR Checklist (verify before creating)

- [ ] Branch is up to date with `main` (`git pull origin main`)
- [ ] All spec tasks are checked (`- [x]`)
- [ ] Visual QA report is attached (add screenshots as PR comments after creation)
- [ ] Figma frame URL is in the Component Spec (will appear in PR body)
- [ ] No hardcoded values in diff (`git diff origin/main | grep '#[0-9a-fA-F]\{3,6\}'` should return empty)
