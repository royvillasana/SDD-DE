import React from "react";
import { Title, Primary, Controls, Stories } from "@storybook/addon-docs/blocks";

/**
 * ComponentDocs — the ONE shared autodocs page for every design-system component.
 *
 * Storybook's Docs addon renders in React regardless of the project's framework, so this
 * single React component is the docs page for React, Vue, Svelte, and Angular Storybooks
 * alike. Each component's stories file wires it up and passes that component's metadata:
 *
 *   import { ComponentDocs } from "../../../.storybook/ComponentDocs";
 *   import { metadata } from "./Accordion.metadata";
 *   const meta = {
 *     title: "Design System/Accordion",
 *     component: Accordion,
 *     tags: ["autodocs"],
 *     parameters: { docs: { page: () => <ComponentDocs meta={metadata} /> } },
 *   };
 *
 * It renders (in order): live preview (Primary) + interactive Controls, then every section
 * the metadata carries — Component Identity, Props, Item Shape, Common Patterns,
 * Anti-Patterns, States & Behaviour, Accessibility, Design Tokens (with swatches), AI
 * Generation Hints, Keywords, Generation Rules — then all the named Stories.
 *
 * Presentational only: it reads from `meta` and never fetches or resolves tokens at
 * runtime (the /storybook skill resolves token values into the metadata at generation
 * time). Styles are inlined so the page needs no external CSS.
 */

export type TokenSwatch = { role: string; value: string };

export type ComponentMetadata = {
  identity: {
    name: string;
    /** atom | molecule | organism | template */
    category: string;
    /** interactive | display | input | container | navigation */
    type: string;
    description: string;
    importPath: string;
    figmaFile?: string;
    figmaNode?: string;
  };
  props?: { name: string; type: string; default?: string; description: string }[];
  /** For object/array props (e.g. an `items` array) — documents each field's shape. */
  itemShape?: { field: string; type: string; required: boolean; description: string }[];
  designTokens?: {
    colors?: TokenSwatch[];
    typography?: TokenSwatch[];
    spacing?: TokenSwatch[];
    shadows?: TokenSwatch[];
    radius?: TokenSwatch[];
  };
  states?: { state: string; description: string }[];
  accessibility?: {
    role?: string;
    keyboard?: string;
    screenReader?: string;
    wcag?: string;
    notes?: string[];
  };
  commonPatterns?: { name: string; description: string; code: string }[];
  antiPatterns?: { pattern: string; why: string; instead: string }[];
  aiHints?: { context?: string; keywords?: string[]; generationRules?: string[] };
};

// ── Inline presentational primitives (no external CSS) ──────────────────────
const c = {
  section: { margin: "2.5rem 0 0" } as React.CSSProperties,
  h2: { fontSize: "1.25rem", fontWeight: 600, margin: "0 0 0.75rem", color: "#1a1a1a" } as React.CSSProperties,
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: "0.875rem" },
  th: {
    textAlign: "left" as const,
    padding: "0.5rem 0.75rem",
    borderBottom: "1px solid #e6e6e6",
    color: "#6b7280",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    fontSize: "0.6875rem",
    letterSpacing: "0.04em",
  },
  td: { padding: "0.5rem 0.75rem", borderBottom: "1px solid #f0f0f0", verticalAlign: "top" as const },
  code: {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: "0.8125rem",
    background: "#f6f8fa",
    borderRadius: 4,
    padding: "0.1rem 0.35rem",
  } as React.CSSProperties,
  pre: {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: "0.8125rem",
    background: "#f6f8fa",
    borderRadius: 6,
    padding: "0.75rem 1rem",
    overflowX: "auto" as const,
    margin: "0.25rem 0 0",
  },
  tag: {
    display: "inline-block",
    background: "#eef2ff",
    color: "#4338ca",
    borderRadius: 999,
    padding: "0.15rem 0.6rem",
    fontSize: "0.75rem",
    margin: "0 0.35rem 0.35rem 0",
  } as React.CSSProperties,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={c.section}>
      <h2 style={c.h2}>{title}</h2>
      {children}
    </section>
  );
}

function Swatches({ items }: { items: TokenSwatch[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", margin: "0.25rem 0" }}>
      {items.map((t) => (
        <div key={t.role} style={{ width: 120, fontSize: "0.75rem" }}>
          <div
            style={{
              height: 44,
              borderRadius: 6,
              border: "1px solid #e6e6e6",
              background: t.value,
              boxShadow: t.role.includes("shadow") ? t.value : undefined,
            }}
          />
          <div style={{ marginTop: 4, fontWeight: 600, color: "#1a1a1a" }}>{t.role}</div>
          <div style={{ color: "#6b7280", fontFamily: "ui-monospace, monospace" }}>{t.value}</div>
        </div>
      ))}
    </div>
  );
}

export function ComponentDocs({ meta }: { meta: ComponentMetadata }): React.JSX.Element {
  const dt = meta.designTokens ?? {};
  return (
    <>
      <Title />
      {/* Live preview of the primary story + interactive controls (autodocs). */}
      <Primary />
      <Controls />

      <Section title="Component Identity">
        <table style={c.table}>
          <tbody>
            {(
              [
                ["Category", meta.identity.category],
                ["Type", meta.identity.type],
                ["Import", meta.identity.importPath],
                meta.identity.figmaFile ? ["Figma file", meta.identity.figmaFile] : null,
                meta.identity.figmaNode ? ["Figma node", meta.identity.figmaNode] : null,
              ].filter(Boolean) as [string, string][]
            ).map(([k, v]) => (
              <tr key={k}>
                <th style={{ ...c.th, width: 140, textTransform: "none", color: "#4338ca" }}>{k}</th>
                <td style={c.td}>
                  <code style={c.code}>{v}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {meta.props && meta.props.length > 0 && (
        <Section title="Props">
          <table style={c.table}>
            <thead>
              <tr>
                <th style={c.th}>Prop</th>
                <th style={c.th}>Type</th>
                <th style={c.th}>Default</th>
                <th style={c.th}>Description</th>
              </tr>
            </thead>
            <tbody>
              {meta.props.map((p) => (
                <tr key={p.name}>
                  <td style={c.td}>
                    <code style={c.code}>{p.name}</code>
                  </td>
                  <td style={c.td}>
                    <code style={c.code}>{p.type}</code>
                  </td>
                  <td style={c.td}>{p.default ? <code style={c.code}>{p.default}</code> : "—"}</td>
                  <td style={c.td}>{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      {meta.itemShape && meta.itemShape.length > 0 && (
        <Section title="Item Shape">
          <table style={c.table}>
            <thead>
              <tr>
                <th style={c.th}>Field</th>
                <th style={c.th}>Type</th>
                <th style={c.th}>Required</th>
                <th style={c.th}>Description</th>
              </tr>
            </thead>
            <tbody>
              {meta.itemShape.map((f) => (
                <tr key={f.field}>
                  <td style={c.td}>
                    <code style={c.code}>{f.field}</code>
                  </td>
                  <td style={c.td}>
                    <code style={c.code}>{f.type}</code>
                  </td>
                  <td style={c.td}>{f.required ? "Yes" : "No"}</td>
                  <td style={c.td}>{f.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      {meta.commonPatterns && meta.commonPatterns.length > 0 && (
        <Section title="Common Patterns">
          {meta.commonPatterns.map((p) => (
            <div key={p.name} style={{ margin: "0 0 1rem" }}>
              <div style={{ fontWeight: 600, color: "#1a1a1a" }}>{p.name}</div>
              <div style={{ color: "#4b5563", fontSize: "0.875rem", margin: "0.15rem 0" }}>{p.description}</div>
              <pre style={c.pre}>{p.code}</pre>
            </div>
          ))}
        </Section>
      )}

      {meta.antiPatterns && meta.antiPatterns.length > 0 && (
        <Section title="Anti-Patterns">
          {meta.antiPatterns.map((a) => (
            <div key={a.pattern} style={{ margin: "0 0 0.85rem" }}>
              <div style={{ fontWeight: 600, color: "#b91c1c" }}>✕ {a.pattern}</div>
              <div style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                <b>Why:</b> {a.why}
              </div>
              <div style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                <b>Instead:</b> {a.instead}
              </div>
            </div>
          ))}
        </Section>
      )}

      {meta.states && meta.states.length > 0 && (
        <Section title="States & Behaviour">
          <table style={c.table}>
            <thead>
              <tr>
                <th style={c.th}>State</th>
                <th style={c.th}>Description</th>
              </tr>
            </thead>
            <tbody>
              {meta.states.map((s) => (
                <tr key={s.state}>
                  <td style={c.td}>
                    <code style={c.code}>{s.state}</code>
                  </td>
                  <td style={c.td}>{s.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      {meta.accessibility && (
        <Section title="Accessibility">
          <table style={c.table}>
            <tbody>
              {(
                [
                  ["ARIA role", meta.accessibility.role],
                  ["Keyboard", meta.accessibility.keyboard],
                  ["Screen reader", meta.accessibility.screenReader],
                  ["WCAG level", meta.accessibility.wcag],
                ].filter(([, v]) => !!v) as [string, string][]
              ).map(([k, v]) => (
                <tr key={k}>
                  <th style={{ ...c.th, width: 140, textTransform: "none", color: "#4338ca" }}>{k}</th>
                  <td style={c.td}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {meta.accessibility.notes && meta.accessibility.notes.length > 0 && (
            <ul style={{ margin: "0.5rem 0 0", paddingLeft: "1.1rem", fontSize: "0.875rem", color: "#4b5563" }}>
              {meta.accessibility.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          )}
        </Section>
      )}

      {(dt.colors || dt.typography || dt.spacing || dt.shadows || dt.radius) && (
        <Section title="Design Tokens">
          {dt.colors && dt.colors.length > 0 && (
            <>
              <div style={{ fontWeight: 600, margin: "0.5rem 0 0.25rem", fontSize: "0.8125rem", color: "#6b7280" }}>
                Colors
              </div>
              <Swatches items={dt.colors} />
            </>
          )}
          {dt.shadows && dt.shadows.length > 0 && (
            <>
              <div style={{ fontWeight: 600, margin: "0.75rem 0 0.25rem", fontSize: "0.8125rem", color: "#6b7280" }}>
                Shadows
              </div>
              <Swatches items={dt.shadows} />
            </>
          )}
          {(dt.typography || dt.spacing || dt.radius) && (
            <table style={{ ...c.table, marginTop: "0.75rem" }}>
              <thead>
                <tr>
                  <th style={c.th}>Token</th>
                  <th style={c.th}>Value</th>
                </tr>
              </thead>
              <tbody>
                {[...(dt.typography ?? []), ...(dt.spacing ?? []), ...(dt.radius ?? [])].map((t) => (
                  <tr key={t.role}>
                    <td style={c.td}>
                      <code style={c.code}>{t.role}</code>
                    </td>
                    <td style={c.td}>
                      <code style={c.code}>{t.value}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>
      )}

      {meta.aiHints && (meta.aiHints.context || meta.aiHints.keywords || meta.aiHints.generationRules) && (
        <Section title="AI Generation Hints">
          {meta.aiHints.context && (
            <p style={{ fontSize: "0.875rem", color: "#4b5563", margin: "0 0 0.5rem" }}>{meta.aiHints.context}</p>
          )}
          {meta.aiHints.keywords && meta.aiHints.keywords.length > 0 && (
            <div style={{ margin: "0.25rem 0 0.75rem" }}>
              {meta.aiHints.keywords.map((k) => (
                <span key={k} style={c.tag}>
                  {k}
                </span>
              ))}
            </div>
          )}
          {meta.aiHints.generationRules && meta.aiHints.generationRules.length > 0 && (
            <>
              <div style={{ fontWeight: 600, fontSize: "0.8125rem", color: "#6b7280", margin: "0 0 0.25rem" }}>
                Generation Rules
              </div>
              <ol style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.875rem", color: "#4b5563" }}>
                {meta.aiHints.generationRules.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ol>
            </>
          )}
        </Section>
      )}

      {/* All named stories (Default, variants, states) render at the bottom. */}
      <Stories />
    </>
  );
}
