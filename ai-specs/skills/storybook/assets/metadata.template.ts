/**
 * <ComponentName>.metadata.ts — structured, AI-consumable metadata for one component.
 *
 * This is the third file of the component's set (component · stories · metadata). The shared
 * `.storybook/ComponentDocs` renderer reads this object to build the rich autodocs page, and
 * downstream AI generation reads it to reuse the component correctly.
 *
 * SOURCING (do NOT re-derive — copy from existing artifacts):
 *   • identity.category/type/figma* .... .sdd-de/components.json entry (level, figmaNodeId, componentKey)
 *   • identity.importPath ............... the project alias import (e.g. "@/components/Accordion/Accordion")
 *   • props / itemShape ................. Component Spec "Props / API" table (+ the component's TS types)
 *   • designTokens ...................... Component Spec "Design Tokens Used" table, VALUES RESOLVED from token_file
 *   • states ............................ Component Spec "States" table + Interaction Spec
 *   • accessibility ..................... Component Spec "Accessibility" section
 *   • commonPatterns / antiPatterns ..... Component Spec "Common Patterns" / "Anti-Patterns" sections
 *   • aiHints ........................... Component Spec "AI Usage Hints" section
 *
 * Emit only sections the component actually has; omit empty ones. Keep values REAL (resolved
 * hex/rem, runnable code) — the /storybook skill resolves token values at generation time.
 *
 * The example below is filled for an Accordion so the shape is concrete; replace every value.
 */

import type { ComponentMetadata } from "../../../.storybook/ComponentDocs";
// ^ Depth assumes this file lives at `src/components/<Name>/<Name>.metadata.ts` (three levels
//   above `.storybook/`). Adjust it to your layout, OR use the project's path alias. The
//   `satisfies` check below is optional but catches shape drift; delete the import + `satisfies`
//   if you prefer an untyped object.

export const metadata = {
  identity: {
    name: "Accordion",
    category: "molecule", // atom | molecule | organism | template
    type: "interactive", // interactive | display | input | container | navigation
    description: "Vertically stacked, collapsible panels for progressive disclosure of grouped content.",
    importPath: "@/components/Accordion/Accordion",
    figmaFile: "ojko9pGfsDAvmUf2DA38d2",
    figmaNode: "1:4820",
  },

  props: [
    { name: "items", type: "AccordionItem[]", default: "[]", description: "Array of accordion item objects (see Item Shape)." },
    { name: "flush", type: "boolean", default: "false", description: "Removes the outer border and radius so it sits flush with its container." },
    { name: "alwaysOpen", type: "boolean", default: "false", description: "Allow multiple items open at once; otherwise opening one closes the others." },
  ],

  // Only for components with an object/array prop whose shape needs documenting.
  itemShape: [
    { field: "id", type: "string", required: true, description: "Unique id; used for aria-controls and state tracking." },
    { field: "title", type: "string", required: true, description: "Header text of the clickable toggle." },
    { field: "content", type: "ReactNode", required: true, description: "Content revealed when open. Any JSX." },
    { field: "defaultOpen", type: "boolean", required: false, description: "Start this item open on mount." },
  ],

  // Values RESOLVED from token_file at generation time (matches the reference's literal values).
  designTokens: {
    colors: [
      { role: "border", value: "#dee2e6" },
      { role: "background", value: "#ffffff" },
      { role: "headerHover", value: "#f8f9fa" },
      { role: "headerText", value: "#212529" },
    ],
    radius: [{ role: "radius-md", value: "0.375rem" }],
    // typography: [{ role: "font-size-body", value: "1rem" }],
    // spacing: [{ role: "spacing-3", value: "1rem" }],
    // shadows: [{ role: "shadow-sm", value: "0 .125rem .25rem rgba(0,0,0,.075)" }],
  },

  states: [
    { state: "closed", description: "Panel hidden, max-height 0, chevron down." },
    { state: "open", description: "Panel visible, chevron rotated 180°." },
    { state: "transitioning", description: "Animating open/close over 200ms via CSS transition." },
  ],

  accessibility: {
    role: "button (header), region (panel)",
    keyboard: "Enter/Space toggles an item; Tab moves focus between headers. Follows the WAI-ARIA Accordion pattern.",
    screenReader: "Each header has aria-expanded; each panel has role=region + aria-labelledby pointing to its header.",
    wcag: "AA",
    notes: [
      "aria-expanded is true/false on each header button.",
      "Panels pair aria-controls / aria-labelledby for assistive tech.",
      "Ensure item content meets contrast (text on background ≥ 4.5:1).",
    ],
  },

  commonPatterns: [
    {
      name: "Basic accordion",
      description: "Standard single-open accordion.",
      code: `<Accordion items={[\n  { id: "1", title: "Question 1", content: "Answer 1", defaultOpen: true },\n  { id: "2", title: "Question 2", content: "Answer 2" },\n]} />`,
    },
    { name: "Flush accordion", description: "No outer border or radius — ideal inside cards or sidebars.", code: `<Accordion flush items={items} />` },
    { name: "Multi-open accordion", description: "All items can be expanded simultaneously.", code: `<Accordion alwaysOpen items={items} />` },
  ],

  antiPatterns: [
    { pattern: "Using an accordion for a single item", why: "A lone expandable item adds needless interaction cost.", instead: "Use a collapsible div or <details>/<summary>." },
    { pattern: "Nesting accordions inside accordion items", why: "Deep interaction hierarchies are hard to navigate.", instead: "Use tabs or a flat list with clear headings." },
  ],

  aiHints: {
    context:
      "Use for progressive disclosure of grouped content. Default to single-open (alwaysOpen=false) for FAQs; flush=true inside a card; alwaysOpen=true for settings/comparison panels.",
    keywords: ["accordion", "collapse", "expand", "faq", "toggle", "disclosure", "panel", "flush"],
    generationRules: [
      "Always pass an items array with at least 2 items.",
      "Set defaultOpen: true on the first or most important item.",
      "Use flush=true when the parent already has a border (e.g. inside a Card).",
      "Use alwaysOpen=true for comparison or settings scenarios.",
    ],
  },
} as const satisfies ComponentMetadata;
