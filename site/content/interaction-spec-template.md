# Interaction Spec Template

Copy this template for every interactive behavior you specify. Fill in every section before prompting Claude Code.

---

## [ComponentName] — Interaction Spec

**Version**: 1.0  
**Status**: Draft / Ready / Implemented  
**Figma prototype**: [paste Figma prototype URL]  
**Related Component Spec**: [link to component spec]

---

### Interaction Overview

One sentence: what is the user doing, and what does the UI do in response?

---

### Trigger

| Trigger | Element | Condition |
|---|---|---|
| Click | Primary CTA button | Button is not disabled or loading |
| Keyboard | `Enter` or `Space` | Focus is on the button |
| Hover | Button | None |

---

### Flow

Describe each step in sequence. Be precise — name the element, describe the change, give the duration.

```
Step 1: User clicks the Submit button
Step 2: Button enters "loading" state — label hides, spinner appears (100ms ease-out)
Step 3: Form fields become disabled (pointer-events: none)
Step 4: [Success] Button transitions to "success" state — green fill, checkmark icon (200ms ease-in-out)
        OR
        [Error] Button returns to "default" state — error message appears below form (200ms ease-in)
Step 5: [Success] Page transitions to confirmation view after 800ms delay
        [Error] Form fields re-enable. Error message persists until next submission attempt.
```

---

### Timing

| Transition | Duration | Easing | CSS |
|---|---|---|---|
| Button → loading | 100ms | ease-out | `transition: all 100ms ease-out` |
| Loading → success | 200ms | ease-in-out | `transition: all 200ms ease-in-out` |
| Loading → error | 200ms | ease-in | `transition: all 200ms ease-in` |
| Page transition | 300ms | ease-in-out | `transition: opacity 300ms ease-in-out` |

---

### Animation Details

**Spinner**:
- SVG circle, stroke-dasharray animation
- Duration: 800ms infinite
- Easing: linear
- Size: matches icon slot (14px / 16px / 18px per button size)

**Success checkmark**:
- SVG path, stroke-dashoffset animation (draw-in effect)
- Duration: 300ms ease-in-out
- Starts immediately after loading state resolves

---

### Edge Cases

| Scenario | Behavior |
|---|---|
| Double-click | Second click is ignored — button is in loading state, pointer-events: none |
| Network timeout (>10s) | Error state triggers automatically. Error message: "Something went wrong. Please try again." |
| Offline | Error state triggers immediately on click. Error message: "You appear to be offline." |
| Slow connection | Loading state persists with no timeout until response or error |
| Success but navigating away | Transition cancels; no visual artifact on the new page |

---

### Responsive Behavior

| Viewport | Change |
|---|---|
| 375px | Button is full-width (`width: 100%`) |
| 768px | Button is auto-width, left-aligned |
| 1440px | Button is auto-width, left-aligned |

---

### Implementation Tasks

- [ ] Implement loading state transition (100ms ease-out)
- [ ] Implement success state transition (200ms ease-in-out)
- [ ] Implement error state transition (200ms ease-in)
- [ ] Implement spinner animation (800ms infinite)
- [ ] Implement success checkmark draw-in animation
- [ ] Handle double-click edge case (pointer-events: none during loading)
- [ ] Handle network timeout (10s) → auto error state
- [ ] Handle offline detection → immediate error state
- [ ] Implement responsive full-width at 375px
- [ ] Visual QA: verify all transitions match timing spec
