#!/usr/bin/env python3
"""Syntax-highlight the fenced code blocks baked into site/docs-data.js.

Why this exists
---------------
docs-data.js ships pre-rendered HTML with inline styles (the pages have no
stylesheet of their own). The renderer that produced it dropped the fence's
language, so every `<pre><code>` came out as one flat colour — no tokens.

This script re-derives the language from the matching fence in site/content/*.md
(the blocks are 1:1 and in order), tokenises the code, and wraps each token in an
inline-styled <span>. It is idempotent: existing spans are stripped before
re-highlighting, so it can run on every build.

Run from anywhere:  python3 site/highlight.py [--check]
  --check  report that highlighting is missing/stale and exit 1 (use in CI)

Then run site/rebundle.py to push docs-data.js back into the page bundles.
"""
import html as H
import json
import pathlib
import re
import sys

SITE = pathlib.Path(__file__).resolve().parent
DATA = SITE / "docs-data.js"
CONTENT = SITE / "content"

# Slugs whose source file is not simply "<slug>.md".
SLUG_TO_FILE = {"setup": "setup-skill.md"}

# Palette — sampled from terminal.js so the docs blocks and the animated
# terminal read as one system on the #141413 block background.
COLOR = {
    "comment": "#787569",
    "string": "#9CC79C",
    "number": "#D9B36A",
    "keyword": "#E39A9A",
    "func": "#8FBFD9",
    "tag": "#E39A9A",
    "attr": "#D9B36A",
    "prop": "#8FBFD9",
    "var": "#56D4C8",
    "type": "#56D4C8",
    "builtin": "#C96442",
    "punct": "#8A8677",
}

ITALIC = {"comment"}


# --- tokeniser -------------------------------------------------------------

def compile_rules(rules):
    """rules: [(kind, pattern), ...] — first match wins, so order matters."""
    parts = []
    for i, (kind, pattern) in enumerate(rules):
        parts.append(f"(?P<{kind}_{i}>{pattern})")
    return re.compile("|".join(parts), re.S | re.M)


def render(code, regex):
    out = []
    pos = 0
    for m in regex.finditer(code):
        if m.start() > pos:
            out.append(H.escape(code[pos:m.start()], quote=False))
        kind = m.lastgroup.rsplit("_", 1)[0]
        style = f"color:{COLOR[kind]}"
        if kind in ITALIC:
            style += ";font-style:italic"
        out.append(
            f'<span style="{style}">{H.escape(m.group(), quote=False)}</span>'
        )
        pos = m.end()
    out.append(H.escape(code[pos:], quote=False))
    return "".join(out)


JS_KEYWORDS = (
    r"\b(?:const|let|var|function|return|import|export|from|default|type|"
    r"interface|extends|implements|class|new|async|await|if|else|for|while|"
    r"do|switch|case|break|continue|typeof|instanceof|as|in|of|this|void|"
    r"enum|public|private|protected|readonly|satisfies|keyof|null|undefined|"
    r"true|false|throw|try|catch|finally|yield|delete|super|static)\b"
)

JS_RULES = [
    ("comment", r"//[^\n]*|/\*.*?\*/"),
    ("string", r'"(?:\\.|[^"\\])*"' r"|'(?:\\.|[^'\\])*'" r"|`(?:\\.|[^`\\])*`"),
    ("tag", r"</?[A-Za-z][\w.-]*(?=[\s/>])|/>"),
    ("keyword", JS_KEYWORDS),
    ("func", r"\b[A-Za-z_$][\w$]*(?=\s*\()"),
    ("type", r"\b[A-Z][A-Za-z0-9_]*\b"),
    ("number", r"\b\d+(?:\.\d+)?(?:px|rem|em|%|s|ms)?\b"),
    ("punct", r"[{}()\[\];,.:<>=+\-*/!?&|]"),
]

CSS_RULES = [
    ("comment", r"/\*.*?\*/|//[^\n]*"),
    ("string", r'"(?:\\.|[^"\\])*"' r"|'(?:\\.|[^'\\])*'"),
    ("keyword", r"@[\w-]+|!important"),
    ("var", r"--[\w-]+|\$[\w-]+"),
    ("prop", r"[-a-zA-Z]+(?=\s*:)"),
    ("number", r"#[0-9a-fA-F]{3,8}\b|\b\d*\.?\d+(?:px|rem|em|%|s|ms|vh|vw|fr|deg|ch)?\b"),
    ("func", r"\b[\w-]+(?=\()"),
    ("type", r"::?[a-zA-Z-]+(?:\([^)]*\))?|[.#&][\w-]+|\[[^\]]+\]"),
    ("punct", r"[{}();,>~+*]"),
]

YAML_RULES = [
    ("comment", r"#[^\n]*"),
    ("string", r'"(?:\\.|[^"\\])*"' r"|'(?:[^'])*'"),
    ("prop", r"^[ \t]*-?[ \t]*[\w.\-/\[\]]+(?=\s*:)"),
    ("keyword", r"\b(?:true|false|null|yes|no|on|off)\b"),
    ("number", r"\b\d+(?:\.\d+)?\b"),
    ("punct", r"^[ \t]*-(?=\s)|[:{}\[\],]"),
]

BASH_RULES = [
    ("comment", r"#[^\n]*"),
    ("string", r'"(?:\\.|[^"\\])*"' r"|'(?:[^'])*'"),
    ("var", r"\$\w+|\$\{[^}]*\}"),
    ("keyword", r"\b(?:if|then|else|fi|for|in|do|done|while|case|esac|function|export|return|cd|source)\b"),
    ("func", r"^[ \t]*[\w./-]+"),
    ("attr", r"(?<=\s)--?[\w-]+"),
    ("number", r"\b\d+(?:\.\d+)?\b"),
    ("punct", r"[|&;()<>]"),
]

MARKUP_RULES = [
    ("comment", r"<!--.*?-->"),
    ("keyword", r"<!DOCTYPE[^>]*>"),
    ("tag", r"</?[\w.:-]+|/?>"),
    ("string", r'"(?:\\.|[^"\\])*"' r"|'(?:[^'])*'"),
    ("attr", r"[\w:@.\-\[\]]+(?==)"),
    ("var", r"\{[^}\n]*\}"),
    ("punct", r"="),
]

JSON_RULES = [
    ("prop", r'"(?:\\.|[^"\\])*"(?=\s*:)'),
    ("string", r'"(?:\\.|[^"\\])*"'),
    ("keyword", r"\b(?:true|false|null)\b"),
    ("number", r"-?\b\d+(?:\.\d+)?\b"),
    ("punct", r"[{}\[\],:]"),
]

GRAMMARS = {
    "js": compile_rules(JS_RULES),
    "css": compile_rules(CSS_RULES),
    "yaml": compile_rules(YAML_RULES),
    "bash": compile_rules(BASH_RULES),
    "markup": compile_rules(MARKUP_RULES),
    "json": compile_rules(JSON_RULES),
}

ALIASES = {
    "js": "js", "jsx": "js", "ts": "js", "tsx": "js",
    "typescript": "js", "javascript": "js",
    "css": "css", "scss": "css", "sass": "css", "less": "css",
    "yaml": "yaml", "yml": "yaml",
    "bash": "bash", "sh": "bash", "shell": "bash", "zsh": "bash", "console": "bash",
    "html": "markup", "xml": "markup", "svg": "markup",
    "json": "json",
}

# Single-file component formats: markup shell with <script>/<style> islands.
COMPONENT_LANGS = {"vue", "svelte", "astro"}

ISLAND = re.compile(
    r"(<(script|style)\b[^>]*>)(.*?)(</\2>)", re.S | re.I
)


def highlight(code, lang):
    lang = (lang or "").lower()

    if lang in COMPONENT_LANGS:
        out = []
        pos = 0
        for m in ISLAND.finditer(code):
            out.append(render(code[pos:m.start()], GRAMMARS["markup"]))
            inner = GRAMMARS["css" if m.group(2).lower() == "style" else "js"]
            out.append(render(m.group(1), GRAMMARS["markup"]))
            out.append(render(m.group(3), inner))
            out.append(render(m.group(4), GRAMMARS["markup"]))
            pos = m.end()
        out.append(render(code[pos:], GRAMMARS["markup"]))
        return "".join(out)

    grammar = GRAMMARS.get(ALIASES.get(lang))
    if grammar is None:  # unlabelled fence (trees, terminal output) — leave plain
        return H.escape(code, quote=False)
    return render(code, grammar)


# --- docs-data.js rewriting ------------------------------------------------

BLOCK = re.compile(r"(<pre[^>]*><code)([^>]*)(>)(.*?)(</code></pre>)", re.S)
TAGS = re.compile(r"<[^>]+>")


def plain_text(inner):
    """Recover the raw source from a code block, highlighted or not."""
    return H.unescape(TAGS.sub("", inner))


def fence_langs(slug):
    path = CONTENT / SLUG_TO_FILE.get(slug, f"{slug}.md")
    if not path.exists():
        return None
    md = path.read_text(encoding="utf-8")
    return [m.group(1) for m in re.finditer(r"^```([a-zA-Z0-9+-]*)$", md, re.M)][::2]


def main() -> int:
    check = "--check" in sys.argv
    src = DATA.read_text(encoding="utf-8")
    start, end = src.index("["), src.rindex("]") + 1
    docs = json.loads(src[start:end])

    changed = 0
    for doc in docs:
        langs = fence_langs(doc["slug"])
        blocks = list(BLOCK.finditer(doc["html"]))
        if langs is None:
            print(f"  {doc['slug']}: no source markdown — skipped")
            continue
        if len(langs) != len(blocks):
            print(
                f"  {doc['slug']}: {len(blocks)} code block(s) but {len(langs)} fence(s)"
                " — skipped (source drifted)"
            )
            continue

        out, pos, i = [], 0, 0
        for m in blocks:
            lang = langs[i]
            i += 1
            code = plain_text(m.group(4))
            attrs = f' class="language-{lang}"' if lang else ""
            rebuilt = m.group(1) + attrs + m.group(3) + highlight(code, lang) + m.group(5)
            out.append(doc["html"][pos:m.start()])
            out.append(rebuilt)
            pos = m.end()
        out.append(doc["html"][pos:])
        rendered = "".join(out)

        if rendered != doc["html"]:
            changed += 1
            print(f"  {doc['slug']}: {len(blocks)} block(s) highlighted")
            doc["html"] = rendered

    if not changed:
        print("code blocks already highlighted")
        return 0
    if check:
        print(f"\n{changed} doc(s) with unhighlighted code. Run: python3 site/highlight.py")
        return 1

    body = json.dumps(docs, ensure_ascii=False, separators=(",", ":"))
    DATA.write_text(f"{src[:start]}{body}{src[end:]}", encoding="utf-8")
    print(f"\nhighlighted {changed} doc(s) — now run: python3 site/rebundle.py")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
