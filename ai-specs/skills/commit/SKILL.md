# Skill: commit

Create a focused commit and open a pull request where the Component Spec is the PR description.

## When to invoke

User says: "commit", "create PR", "/commit", or after adversarial-review passes.

## Prerequisites

- `/visual-verify` passed (zero unresolved discrepancies)
- `/adversarial-review` passed (PASS or PASS-WITH-GAPS verdict)
- `specs/[feature-name]/visual-verify-report.md` exists
- `specs/[feature-name]/reports/[date]-adversarial-review.md` exists
- `design.md` is up to date

## Steps

1. **Read `.sdd-de/project.yaml`** — note `component_dir` and `token_file` for staging paths

2. **Stage changes** (adapt paths to your framework):
```bash
# Stage the component file(s)
git add [component_dir]/[category]/[component-name].[ext]

# Stage all spec artifacts
git add specs/[feature-name]/

# Stage token file if new tokens were added
git add [token_file]

# Stage design token model if new categories were added
git add .sdd-de/docs/design-token-model.md
```

3. **Create commit**:
```bash
git commit -m "feat([component]): implement [ComponentName] per SDD spec

- All variants: primary, secondary, ghost, destructive
- All states: default, hover, focus, active, disabled, loading, error
- Responsive: 375px / 768px / 1440px
- Visual QA: passed
- Adversarial review: passed
- Accessibility: axe audit clean

Spec: specs/[feature-name]/[component]-component-spec.md"
```

4. **Push branch**:
```bash
git push -u origin feature/[component-name]-spec
```

5. **Create PR** using the Component Spec as the body:
```bash
gh pr create \
  --title "feat: [ComponentName] — SDD Implementation" \
  --body "$(cat specs/[feature-name]/[component]-component-spec.md)" \
  --label "design-engineering"
```

6. **Announce**: "PR created. Link: [PR URL]"

## PR Checklist (verify before creating)

- [ ] Branch is up to date with `main` (`git pull origin main`)
- [ ] All spec tasks are checked (`- [x]`)
- [ ] `/visual-verify` report exists and all items passed
- [ ] `/adversarial-review` report exists with PASS or PASS-WITH-GAPS verdict
- [ ] Design source reference is in the Component Spec header (will appear in PR body):
  - Figma: frame URL is present
  - Library: base component name and library are present
  - GitHub: repo URL, branch, and source file path are present
  - ZIP: archive path and source file path are present
  - Stitch: screen name and token mapping table are present
- [ ] No hardcoded values in diff:
```bash
git diff origin/main | grep '#[0-9a-fA-F]\{3,6\}'  # must return empty
```
