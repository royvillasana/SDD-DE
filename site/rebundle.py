#!/usr/bin/env python3
"""Re-embed site/*.js into the self-contained page bundles.

Why this exists
---------------
index.html / guide.html / docs.html are single-file bundles produced by the
design-composer export. Each carries an asset table of gzip+base64 virtual
files, and the page loads its JS from THAT table — never from the sibling
docs-data.js / terminal.js on disk. Editing the sibling file changes nothing
on the rendered page, and the stale bundle deploys looking perfectly fine.

This script re-gzips the on-disk file into the matching bundle entry, so the
sibling .js files are the real source of truth.

Run from anywhere:  python3 site/rebundle.py [--check]
  --check  report drift and exit 1 instead of writing (use in CI)
"""
import base64
import gzip
import pathlib
import re
import sys

SITE = pathlib.Path(__file__).resolve().parent
PAGES = ["index.html", "guide.html", "docs.html"]

# Match an embedded asset by a signature in its decoded content, so we never
# depend on the UUIDs — the exporter regenerates those on every re-export.
SOURCES = [
    ("docs-data.js", "window.SDD_DOCS"),
    ("terminal.js", "SDD-DE animated terminal"),
    ("support.js", "GENERATED from dc-runtime"),
]

ENTRY = re.compile(
    r'"(?P<uid>[0-9a-f-]{36})":\{"mime":"(?P<mime>[^"]+)",'
    r'"compressed":(?P<comp>true|false),"data":"(?P<data>[^"]*)"'
)


def encode(raw: bytes) -> str:
    # mtime=0 so the output is byte-stable across runs (no spurious diffs).
    return base64.b64encode(gzip.compress(raw, mtime=0)).decode("ascii")


def main() -> int:
    check = "--check" in sys.argv
    drift = 0

    for page in PAGES:
        path = SITE / page
        html = path.read_text(encoding="utf-8")
        original = html

        for match in list(ENTRY.finditer(html)):
            if "javascript" not in match.group("mime"):
                continue
            blob = base64.b64decode(match.group("data"))
            if match.group("comp") == "true":
                blob = gzip.decompress(blob)

            text = blob[:200].decode("utf-8", errors="replace")
            source = next((f for f, sig in SOURCES if sig in text), None)
            if source is None:
                continue

            current = (SITE / source).read_bytes()
            if current == blob:
                continue

            drift += 1
            print(f"  {page}: {source} stale ({len(blob)}b -> {len(current)}b)")
            if not check:
                html = html.replace(
                    f'"data":"{match.group("data")}"', f'"data":"{encode(current)}"'
                )

        if not check and html != original:
            path.write_text(html, encoding="utf-8")
            print(f"  {page}: rewritten")

    if not drift:
        print("bundles up to date")
        return 0
    if check:
        print(f"\n{drift} stale embedded asset(s). Run: python3 site/rebundle.py")
        return 1
    print(f"\nre-embedded {drift} asset(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
