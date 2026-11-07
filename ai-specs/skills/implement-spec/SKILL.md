---
name: implement-spec
description: Implement one task of a Component, Interaction or Page Spec with the cheaper px-screen-builder agent and tick it. Use for step 3 (Apply) of the SDD cycle, once per task, instead of implementing in the planning session.
context: fork
agent: px-screen-builder
background: false
---

# Skill: implement-spec

Arguments: `$ARGUMENTS` = `<feature-name> [task number or task text]`. The feature is the folder name under `specs/`. With no task, implement the first unchecked task (`- [ ]`): component spec, then interaction spec, then page spec.

**Delegation.** This step is meant to run in the `px-screen-builder` subagent. Claude Code does that itself (`context: fork`). In any other tool, unless you already are `px-screen-builder`: if the tool has custom subagents, hand this whole step to `px-screen-builder` with the feature name (and task) and wait for its summary; if it has none, run the step here.

As `px-screen-builder` you have a fresh context: no conversation history and no way to ask the user. Everything needed is in files; where this skill says to ask or confirm, return `SPEC INCOMPLETE: <what is needed>` instead. End with the short summary your agent file defines.

## When to invoke

Step 3 of the SDD cycle, after `/generate-artifacts` and the branch exist: "implement the next task", "/implement-spec button", "implement task 3 of the button spec".

## Rules of the cycle this keeps

- **One task per call.** Never the whole spec in one shot. Run `/implement-spec <feature>` again for the next task.
- **The gate stays with you.** After each task, run the dev server and inspect the change before the next one; the subagent cannot see the screen and reports `visual check: not performed`.
- All tasks ticked before `/visual-verify`.

## Steps

1. Read `.sdd-de/project.yaml`. If it does not exist, return `SPEC INCOMPLETE: run /setup first`.
2. List `specs/<feature>/*-spec.md`. If there are none, return `SPEC INCOMPLETE: run /generate-artifacts first`. If no `- [ ]` task is left, return `NO OPEN TASKS: next /visual-verify`.
3. Pick the task (the given one, else the first unchecked). Read only the spec sections it refers to and the `.sdd-de/docs/` standards it touches.
4. Implement that task alone, following your agent rules (tokens only, CVA + `cn()` + `forwardRef`, semantic HTML and ARIA from the spec; adapt, never rebuild, library components).
5. Run the project's build, typecheck or lint if present, and grep the touched files for hex colours and raw pixel values.
6. Tick the task in the spec and return the summary block from your agent file.

## Output

```
TASK: <task>  DONE
files: …
checks: …
visual check: not performed
NEXT: /implement-spec <feature>   (or /visual-verify when every task is ticked)
```
