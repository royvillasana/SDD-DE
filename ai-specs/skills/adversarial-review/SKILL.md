# Skill: adversarial-review

Red-team the implementation before committing. Challenge every assumption: does the code actually match the spec?

## When to invoke

User says: "adversarial review", "red team this", "challenge my implementation", "/adversarial-review", or after `/visual-verify` passes.

## Purpose

Run an independent, critical review of the implementation before it reaches the PR. The goal is to find what `/visual-verify` misses: silent omissions, assumption-based shortcuts, and spec requirements that were noted but not implemented.

---

## Prerequisites

- Component Spec is complete and all tasks are checked
- Dev server is running and the component is visible in the browser
- `/visual-verify` has already passed

---

## Steps

### Step 1 — Load Spec and Implementation

1. Read `specs/[feature-name]/[component]-component-spec.md`
2. Read `specs/[feature-name]/[component]-interaction-spec.md`
3. Read the implementation files (component file, styles, token references)
4. Read `specs/[feature-name]/visual-verify-report.md`

### Step 2 — Challenge the Implementation

For every spec requirement, ask: **"Is this actually implemented, or just assumed?"**

Run every check below. Mark each pass ✓ or fail ✗:

#### Variant Coverage
- [ ] Every variant listed in the spec exists in code — not just the default
- [ ] Variants produce visually distinct output — not just "looks similar"
- [ ] Variant prop/attribute is typed and has no fallback that hides missing variants

#### State Coverage
- [ ] **Hover**: style change is applied via CSS, not inherited from parent
- [ ] **Focus**: visible focus ring exists — `outline: none` without a replacement is a blocker
- [ ] **Disabled**: element is `aria-disabled="true"` or has `disabled` attribute; cursor is `not-allowed`
- [ ] **Loading**: spinner or indicator is visible; element is non-interactive while loading
- [ ] **Error**: error message is programmatically associated with its input (`aria-describedby` or `aria-errormessage`)
- [ ] **Empty**: component renders a visible empty state, not a blank space

#### Token Audit — Zero Tolerance

```bash
# Find hardcoded hex values (should return empty)
grep -rn '#[0-9a-fA-F]\{3,8\}' [component-file]

# Find hardcoded pixel values outside token file (borders excepted)
grep -rn '[0-9]\+px' [component-file]
```

- [ ] Zero hardcoded hex color values
- [ ] Zero hardcoded pixel values except `1px` borders and `outline-width`
- [ ] Every spacing value references a design token variable
- [ ] Every color value references a design token variable

#### Accessibility — Adversarial Pass
- [ ] Interactive elements with only icons have `aria-label`
- [ ] Form inputs have visible `<label>` (not placeholder-only)
- [ ] Tab order is logical — keyboard-navigate the component from start to end
- [ ] Color contrast passes — verify with browser DevTools or axe
- [ ] Screen reader test: activate VoiceOver or NVDA and navigate to the component

#### Responsive — Edge Cases
- [ ] At 375px: no horizontal overflow, no text clipping, no broken layout
- [ ] At 768px: layout transition to tablet is correct per spec
- [ ] At 1440px: max-width constraint is respected; no full-bleed content errors

#### Interaction Spec Compliance
- [ ] Every animation trigger listed in the Interaction Spec fires correctly
- [ ] Timing values match the spec (duration, easing)
- [ ] Edge cases listed in the Interaction Spec are handled (double-click, offline, timeout)

---

### Step 3 — Produce Finding Report

Save to `specs/[feature-name]/reports/[YYYY-MM-DD]-adversarial-review.md`:

```markdown
# Adversarial Review — [ComponentName]
Date: [YYYY-MM-DD]

## Verdict: [PASS | FAIL | PASS-WITH-GAPS]

## Findings

| Severity | Area            | Issue                                           | Status |
|----------|-----------------|-------------------------------------------------|--------|
| Blocker  | Token Audit     | `#F4A500` hardcoded in `.btn--primary`          | Open   |
| Major    | State Coverage  | `error` state renders no accessible error text  | Open   |
| Minor    | Accessibility   | `aria-label` missing on close icon button       | Open   |

## Resolved During Review
[Issues found and fixed inline — list each with the fix applied]
```

### Step 4 — Gate

| Verdict | Condition | Next Step |
|---|---|---|
| **PASS** | All checks pass, zero Blocker/Major findings | Proceed to `/commit` |
| **FAIL** | One or more Blocker findings remain | Fix blockers, re-run review |
| **PASS-WITH-GAPS** | Minor findings only, all documented | Engineer decides: fix now or file follow-up ticket |

---

## Output

Announce: "Adversarial review complete. Verdict: [PASS / FAIL / PASS-WITH-GAPS]. Report saved to `specs/[feature-name]/reports/[date]-adversarial-review.md`."
