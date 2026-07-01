# SDD-DE — Spec-Driven Development for Design Engineers

A portable, AI-ready methodology toolkit that teaches designers to ship production-quality UI through disciplined specification before implementation.

Adapted from [LIDR Specboot](https://github.com/LIDR-academy/lidr-specboot) for the design engineering workflow.

---

## What Is SDD-DE?

Spec-Driven Development for Design Engineers (SDD-DE) treats your **design specification as the single source of truth**. You write the spec before you prompt the AI. The spec drives the implementation, the visual QA, and the pull request description.

This approach enables Claude Code (or any AI coding agent) to produce production-ready components reliably — because the AI is executing a precise document, not interpreting a vague brief.

---

## The 7-Step SDD Cycle

```
1. Enrich    → Transform a design brief into an implementation-ready spec story
2. Specify   → Generate all 3 artifacts: Component Spec + Interaction Spec + Page Spec
3. Branch    → Create a Git feature branch for this spec
4. Apply     → Use Claude Code to implement the spec (one task at a time)
5. Verify    → Visual QA: live implementation vs. Figma design, side by side
6. Sync      → Update design.md and token files to match implementation
7. Commit    → Push a PR where the spec IS the PR description
```

---

## Repository Structure

```
SDD-DE/
├── README.md                             # This file
├── CLAUDE.md                             # AI agent configuration
├── docs/
│   ├── design-engineering-standards.md  # Core SDD-DE principles
│   ├── component-standards.md           # Atomic design, variants, a11y
│   ├── page-standards.md                # Next.js/React, responsive patterns
│   ├── documentation-standards.md       # Spec format and maintenance rules
│   ├── sdd-mandatory-steps.md           # Required steps for every SDD cycle
│   ├── component-spec-template.md       # Component Spec fill-in template
│   ├── interaction-spec-template.md     # Interaction Spec fill-in template
│   ├── page-spec-template.md            # Page/Feature Spec fill-in template
│   └── design-token-model.md            # Design token system reference
├── ai-specs/
│   ├── agents/
│   │   ├── design-engineer.md           # Figma → code agent definition
│   │   ├── ui-implementer.md            # Claude Code prompting specialist
│   │   └── design-strategist.md        # Design brief → spec pipeline
│   └── skills/
│       ├── enrich-brief/SKILL.md        # Enrich a design brief into a spec story
│       ├── generate-artifacts/SKILL.md  # Generate all 3 spec artifacts
│       ├── visual-verify/SKILL.md       # Visual QA against spec
│       ├── sync-tokens/SKILL.md         # Sync Figma tokens to CSS variables
│       └── commit/SKILL.md              # Commit with spec as PR description
└── examples/
    ├── button-component-spec.md         # Worked example: Button
    ├── modal-interaction-spec.md        # Worked example: Modal animation
    └── pricing-page-spec.md             # Worked example: Pricing page
```

---

## Quick Start

### 1. Clone this toolkit into your project

```bash
git clone https://github.com/royvillasana/SDD-DE .sdd-de
```

### 2. Copy the CLAUDE.md to your project root

```bash
cp .sdd-de/CLAUDE.md ./CLAUDE.md
```

### 3. Run your first SDD cycle

```
/enrich-brief       → enrich a design brief into a spec story
/generate-artifacts → create all 3 spec files
/visual-verify      → QA the implementation against the spec
/commit             → push with spec as PR description
```

---

## Who This Is For

- **UX Designers** learning to ship code with AI assistance
- **Design Engineers** who want a repeatable, auditable workflow
- **Product Designers** tired of losing design intent in the handoff

---

## Philosophy

> "Write the spec. Then write the code. Never the other way around."

The spec is not a deliverable — it is the input to the AI. When your spec is complete, implementation becomes mechanical. Visual QA becomes pass/fail. The PR description writes itself.

---

## License

MIT — adapted from [LIDR-academy/lidr-specboot](https://github.com/LIDR-academy/lidr-specboot)
