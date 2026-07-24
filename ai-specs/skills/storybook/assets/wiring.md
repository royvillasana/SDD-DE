# Wiring the shared docs page into a component's stories (per framework)

The metadata object + `ComponentDocs` renderer are framework-agnostic (Storybook's Docs addon
is React everywhere). Only the **stories file** differs per framework. In every case:

1. Import `metadata` from `./<Name>.metadata`.
2. Import `ComponentDocs` from the project's `.storybook/ComponentDocs`.
3. Set `parameters.docs.page = () => <ComponentDocs meta={metadata} />` and keep `tags: ['autodocs']`.

Adjust the relative path to `.storybook/ComponentDocs` (or use the project's path alias).

---

## React / Next.js — `<Name>.stories.tsx`

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Accordion } from "./Accordion";
import { metadata } from "./Accordion.metadata";
import { ComponentDocs } from "../../../.storybook/ComponentDocs";

const meta: Meta<typeof Accordion> = {
  title: "Design System/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  parameters: { docs: { page: () => <ComponentDocs meta={metadata} /> } },
  argTypes: { flush: { control: "boolean" }, alwaysOpen: { control: "boolean" } },
};
export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = { args: { items: SAMPLE_ITEMS } };
```

## Vue 3 / Nuxt — `<Name>.stories.ts`

```ts
import type { Meta, StoryObj } from "@storybook/vue3";
import Accordion from "./Accordion.vue";
import { metadata } from "./Accordion.metadata";
import { ComponentDocs } from "../../../.storybook/ComponentDocs";

const meta: Meta<typeof Accordion> = {
  title: "Design System/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  // ComponentDocs is a React component; the Docs addon renders it regardless of framework.
  parameters: { docs: { page: () => ComponentDocs({ meta: metadata }) } },
};
export default meta;
```

## Svelte / SvelteKit — `<Name>.stories.ts`

```ts
import type { Meta, StoryObj } from "@storybook/svelte";
import Accordion from "./Accordion.svelte";
import { metadata } from "./Accordion.metadata";
import { ComponentDocs } from "../../../.storybook/ComponentDocs";

const meta: Meta<typeof Accordion> = {
  title: "Design System/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  parameters: { docs: { page: () => ComponentDocs({ meta: metadata }) } },
};
export default meta;
```

## Angular — `<Name>.stories.ts`

```ts
import type { Meta, StoryObj } from "@storybook/angular";
import { AccordionComponent } from "./accordion.component";
import { metadata } from "./accordion.metadata";
import { ComponentDocs } from "../../../.storybook/ComponentDocs";

const meta: Meta<AccordionComponent> = {
  title: "Design System/Accordion",
  component: AccordionComponent,
  tags: ["autodocs"],
  parameters: { docs: { page: () => ComponentDocs({ meta: metadata }) } },
};
export default meta;
```

---

### Non-React note

`ComponentDocs` and the Foundations `.mdx` are React/MDX, which the Docs addon renders in every
Storybook. Keep the `.storybook/ComponentDocs.(tsx|jsx)` and `.storybook/foundations/*.mdx` files
as React/MDX even in a Vue/Svelte/Angular project — only your component **stories** use the native
framework format. Ensure `@storybook/addon-docs` (and `@storybook/addon-docs/blocks`) are installed; `storybook
init` includes them via `@storybook/addon-essentials`.
