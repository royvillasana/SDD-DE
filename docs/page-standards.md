# Page Standards

## Next.js App Router Conventions

- All pages are Server Components by default
- Add `"use client"` only when the component needs: `useState`, `useEffect`, event handlers, or browser APIs
- Page metadata is defined with `export const metadata` in the page file (not in layout)
- Dynamic metadata uses `generateMetadata()` function

## Page File Structure

```tsx
// app/[page]/page.tsx

import type { Metadata } from "next";
import { SiteNav } from "@/components/sections/site-nav";
import { HeroSection } from "@/components/sections/hero-section";
import { Footer } from "@/components/sections/footer";

export const metadata: Metadata = {
  title: "Page Title — Brand",
  description: "150 chars max.",
};

export default function PageName() {
  return (
    <>
      <SiteNav />
      <main id="main-content">
        <HeroSection />
      </main>
      <Footer />
    </>
  );
}
```

## Responsive Layout

All pages are mobile-first. Breakpoints:

| Name | Width | Tailwind prefix |
|---|---|---|
| Mobile | 375px (default) | none |
| Tablet | 768px | `md:` |
| Desktop | 1024px | `lg:` |
| Wide | 1440px | `xl:` |

Max content width: `max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8`

## Section Spacing

Use the spacing token scale for vertical rhythm between sections:

```tsx
<section className="py-[var(--spacing-20)] md:py-[var(--spacing-24)]">
```

## Skip Link

Every page must have a skip link as the first interactive element:

```tsx
// app/layout.tsx
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 ...">
  Skip to main content
</a>
```

## Grid System

```tsx
// 12-column grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
  <div className="lg:col-span-4">...</div>
  <div className="lg:col-span-8">...</div>
</div>
```
