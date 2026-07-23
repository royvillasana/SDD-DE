import React from "react";

/**
 * FoundationBlocks — presentational primitives for the Foundations MDX pages.
 *
 * The Foundations pages (Colors, Typography, Spacing, Radius, Shadows) are MDX so they render
 * in any framework's Storybook. Each page imports these blocks and passes the project's tokens
 * (arrays the /storybook skill fills from `token_file`). No runtime CSS-var lookup: values are
 * embedded at generation time, so a page always shows the tokens it was generated from.
 *
 * Types are intentionally loose (plain arrays of {name, value, …}) so the MDX stays simple.
 */

type Swatch = { name: string; value: string };
type Shade = { name: string; shades: { step: string; value: string }[] };
type TypeSample = { name: string; size: string; weight?: string; sample?: string };
type Space = { name: string; value: string; px?: string };

const base: React.CSSProperties = { fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" };
const label: React.CSSProperties = { fontSize: "0.75rem", color: "#6b7280", fontFamily: "ui-monospace, monospace" };
const heading: React.CSSProperties = {
  fontSize: "0.6875rem",
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "#9ca3af",
  margin: "1.75rem 0 0.75rem",
};

/** A flat grid of color/semantic swatches. */
export function ColorGrid({ title, tokens }: { title?: string; tokens: Swatch[] }): React.JSX.Element {
  return (
    <div style={base}>
      {title && <div style={heading}>{title}</div>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {tokens.map((t) => (
          <div key={t.name} style={{ width: 130 }}>
            <div style={{ height: 56, borderRadius: 8, border: "1px solid #e6e6e6", background: t.value }} />
            <div style={{ fontWeight: 600, fontSize: "0.8125rem", marginTop: 6 }}>{t.name}</div>
            <div style={label}>{t.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Numbered shade ramps (100–900) for each color family. */
export function ShadeScales({ title, families }: { title?: string; families: Shade[] }): React.JSX.Element {
  return (
    <div style={base}>
      {title && <div style={heading}>{title}</div>}
      {families.map((f) => (
        <div key={f.name} style={{ marginBottom: "1rem" }}>
          <div style={{ fontWeight: 600, fontSize: "0.8125rem", marginBottom: 4 }}>{f.name}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
            {f.shades.map((s) => (
              <div key={s.step} style={{ width: 72 }}>
                <div style={{ height: 40, borderRadius: 4, border: "1px solid #e6e6e6", background: s.value }} />
                <div style={{ ...label, textAlign: "center" }}>{s.step}</div>
                <div style={{ ...label, textAlign: "center", fontSize: "0.6875rem" }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** The type scale — each row renders live at its own size/weight. */
export function TypeScale({ title, samples }: { title?: string; samples: TypeSample[] }): React.JSX.Element {
  return (
    <div style={base}>
      {title && <div style={heading}>{title}</div>}
      {samples.map((s) => (
        <div
          key={s.name}
          style={{ display: "flex", alignItems: "baseline", gap: "1.5rem", padding: "0.5rem 0", borderBottom: "1px solid #f0f0f0" }}
        >
          <div style={{ width: 150, flexShrink: 0 }}>
            <div style={{ fontWeight: 600, fontSize: "0.8125rem" }}>{s.name}</div>
            <div style={label}>
              {s.size}
              {s.weight ? ` / ${s.weight}` : ""}
            </div>
          </div>
          <div style={{ fontSize: s.size, fontWeight: s.weight ? Number(s.weight) : undefined, lineHeight: 1.2 }}>
            {s.sample ?? "The quick brown fox jumps over the lazy dog"}
          </div>
        </div>
      ))}
    </div>
  );
}

/** The spacing scale — each step rendered as a bar of its width, with padding/margin utility names. */
export function SpacingScale({ title, steps }: { title?: string; steps: Space[] }): React.JSX.Element {
  return (
    <div style={base}>
      {title && <div style={heading}>{title}</div>}
      {steps.map((s) => (
        <div key={s.name} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.35rem 0" }}>
          <div style={{ width: 120, flexShrink: 0 }}>
            <div style={{ fontWeight: 600, fontSize: "0.8125rem" }}>{s.name}</div>
            <div style={label}>
              {s.value}
              {s.px ? ` · ${s.px}` : ""}
            </div>
          </div>
          <div style={{ height: 16, width: s.value, background: "#c7d2fe", borderRadius: 3 }} />
        </div>
      ))}
    </div>
  );
}

/** Radius ramp — a rounded box per token. */
export function RadiusGrid({ title, tokens }: { title?: string; tokens: Swatch[] }): React.JSX.Element {
  return (
    <div style={base}>
      {title && <div style={heading}>{title}</div>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem" }}>
        {tokens.map((t) => (
          <div key={t.name} style={{ width: 120, textAlign: "center" }}>
            <div style={{ height: 72, background: "#eef2ff", border: "2px solid #6366f1", borderRadius: t.value }} />
            <div style={{ fontWeight: 600, fontSize: "0.8125rem", marginTop: 6 }}>{t.name}</div>
            <div style={label}>{t.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Elevation ramp — a surface per shadow token. */
export function ShadowGrid({ title, tokens }: { title?: string; tokens: Swatch[] }): React.JSX.Element {
  return (
    <div style={base}>
      {title && <div style={heading}>{title}</div>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", padding: "1rem 0" }}>
        {tokens.map((t) => (
          <div key={t.name} style={{ width: 160, textAlign: "center" }}>
            <div style={{ height: 80, background: "#ffffff", borderRadius: 8, boxShadow: t.value }} />
            <div style={{ fontWeight: 600, fontSize: "0.8125rem", marginTop: 12 }}>{t.name}</div>
            <div style={{ ...label, fontSize: "0.6875rem" }}>{t.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
