# Skill: sync-tokens

Sync design tokens between Figma Variables and CSS custom properties after implementation.

## When to invoke

User says: "sync tokens", "sync Figma tokens", "/sync-tokens", or after visual-verify passes but before commit.

## Steps

1. **Audit the implementation** for any new CSS custom properties added during Apply that don't exist in Figma Variables:
```bash
grep -r "var(--" src/components/ui/[component-name].tsx | sort -u
```

2. **Compare to Figma Variables** via the Figma MCP:
```
Using the Figma MCP, list all variables in the [collection-name] collection.
```

3. **For each CSS property without a Figma Variable counterpart**:
   - Create the variable in Figma Variables (correct collection, correct name)
   - Apply it to the relevant layers in the Figma frame
   - Document in `design.md`: "Added `--[token-name]` — no Figma Variable existed; created during implementation"

4. **For each Figma Variable without a CSS counterpart**:
   - Add it to `globals.css` under the correct category
   - Document in `design.md`

5. **Verify design.md is current**: All implementation decisions that deviate from the original spec must be documented.

6. **Update `docs/design-token-model.md`** if new token categories were introduced.

7. **Announce**: "Token sync complete. [N] tokens added to Figma. [N] tokens added to globals.css. design.md updated."
