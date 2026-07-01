# Design Token Model

This document defines the design token system for SDD-DE projects. All tokens are defined in Figma Variables and mirrored as CSS custom properties in `globals.css`.

---

## Token Categories

### Color Tokens

```css
/* Brand */
--color-brand-primary: #F4A500;       /* Primary CTA, active states */
--color-brand-secondary: #1A1A1A;     /* Dark backgrounds, headings */

/* Neutral */
--color-neutral-50:  #FAFAFA;
--color-neutral-100: #F5F5F5;
--color-neutral-200: #E5E5E5;
--color-neutral-300: #D4D4D4;
--color-neutral-400: #A3A3A3;
--color-neutral-500: #737373;
--color-neutral-600: #525252;
--color-neutral-700: #404040;
--color-neutral-800: #262626;
--color-neutral-900: #171717;

/* Semantic */
--color-background:         var(--color-neutral-50);   /* Page background */
--color-foreground:         var(--color-neutral-900);  /* Primary text */
--color-muted:              var(--color-neutral-100);  /* Subtle backgrounds */
--color-muted-foreground:   var(--color-neutral-500);  /* Secondary text */
--color-border:             var(--color-neutral-200);  /* Borders, dividers */
--color-card:               #FFFFFF;                   /* Card surfaces */
--color-card-foreground:    var(--color-neutral-900);  /* Card text */

/* Status */
--color-success:     #16A34A;
--color-warning:     #D97706;
--color-destructive: #DC2626;
--color-info:        #2563EB;
```

### Spacing Tokens

Base unit: 4px

```css
--spacing-0:  0px;
--spacing-1:  4px;
--spacing-2:  8px;
--spacing-3:  12px;
--spacing-4:  16px;
--spacing-5:  20px;
--spacing-6:  24px;
--spacing-8:  32px;
--spacing-10: 40px;
--spacing-12: 48px;
--spacing-16: 64px;
--spacing-20: 80px;
--spacing-24: 96px;
--spacing-32: 128px;
```

### Typography Tokens

```css
/* Font families */
--font-sans:  "Geist", ui-sans-serif, system-ui, sans-serif;
--font-mono:  "Geist Mono", ui-monospace, monospace;
--font-display: "Instrument Serif", Georgia, serif;

/* Font sizes */
--font-size-xs:   11px;
--font-size-sm:   13px;
--font-size-base: 15px;
--font-size-md:   16px;
--font-size-lg:   18px;
--font-size-xl:   20px;
--font-size-2xl:  24px;
--font-size-3xl:  30px;
--font-size-4xl:  36px;
--font-size-5xl:  48px;

/* Line heights */
--line-height-tight:   1.2;
--line-height-snug:    1.35;
--line-height-normal:  1.5;
--line-height-relaxed: 1.65;

/* Font weights */
--font-weight-regular:   400;
--font-weight-medium:    500;
--font-weight-semibold:  600;
--font-weight-bold:      700;
```

### Radius Tokens

```css
--radius-none: 0px;
--radius-sm:   4px;
--radius-md:   8px;
--radius-lg:   12px;
--radius-xl:   16px;
--radius-2xl:  24px;
--radius-full: 9999px;
```

### Shadow Tokens

```css
--shadow-sm:  0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md:  0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl:  0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
```

---

## Token Naming Convention

```
--[category]-[subcategory]-[variant]
```

Examples:
- `--color-brand-primary` → category: color, subcategory: brand, variant: primary
- `--spacing-4` → category: spacing, value: 4 base units (16px)
- `--font-size-lg` → category: font-size, variant: large
- `--radius-md` → category: radius, variant: medium

---

## Figma Variables → CSS Mapping

| Figma Variable | CSS Custom Property |
|---|---|
| `color/brand/primary` | `--color-brand-primary` |
| `color/neutral/900` | `--color-neutral-900` |
| `color/semantic/background` | `--color-background` |
| `spacing/4` | `--spacing-4` |
| `typography/size/lg` | `--font-size-lg` |
| `radius/md` | `--radius-md` |

When the Figma MCP reads a frame and finds a Figma Variable, Claude Code will use the corresponding CSS custom property automatically — as long as the variable naming follows this convention.
