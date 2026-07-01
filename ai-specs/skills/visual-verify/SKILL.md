# Skill: visual-verify

Run a structured visual QA comparing the live implementation to the Figma spec.

## When to invoke

User says: "verify", "visual QA", "/visual-verify", or after all Apply tasks are checked.

## Prerequisites

- All tasks in the Component Spec are checked (`- [x]`)
- Dev server is running (`npm run dev`)
- Figma frame URL is in the Component Spec

## Steps

1. **Read** `specs/[feature-name]/[component]-component-spec.md`
2. **Open the live component** at the correct URL and viewport
3. **Run the visual checklist** (report pass/fail for each):

```
VIEWPORT: 375px
[ ] All variants present: primary, secondary, ghost, destructive
[ ] All states present: default, hover, focus, active, disabled, loading, error
[ ] Colors match tokens (check computed styles in DevTools)
[ ] Spacing matches tokens
[ ] Font size / weight / line-height match tokens
[ ] Border radius matches tokens

VIEWPORT: 768px
[ ] Layout changes are correct per responsive spec

VIEWPORT: 1440px
[ ] Layout changes are correct per responsive spec

ACCESSIBILITY
[ ] Correct element (button, a, div with role)
[ ] aria-disabled on disabled state
[ ] aria-busy on loading state
[ ] Focus ring visible at 2:1+ contrast
[ ] Axe audit: zero errors

TOKEN AUDIT (DevTools → Computed)
[ ] Zero hardcoded hex values
[ ] Zero hardcoded pixel values (except border-width, outline-width)
[ ] Every color is a CSS custom property reference
[ ] Every spacing value is a CSS custom property reference
```

4. **Document results** in `specs/[feature-name]/visual-verify-report.md`:
   - List every discrepancy
   - For each: state whether Figma or code is authoritative, and the fix applied
5. **Gate**: If zero unresolved discrepancies → proceed to /sync-tokens
6. **If discrepancies exist**: fix each one, re-run the checklist item, mark resolved
