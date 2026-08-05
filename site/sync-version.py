#!/usr/bin/env python3
"""Keep the site's version badge in sync with package.json.

The homepage hero badge ("v1.20.1 · MIT · npm · MCP") is hardcoded in
index.html, so it silently drifts every time the package is released — it had
been reading v2.4.1 against a published 1.20.1. This rewrites it from
package.json, the same source npm publishes from.

Run from anywhere:  python3 site/sync-version.py [--check]
  --check  report drift and exit 1 instead of writing (use in CI)
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGE = ROOT / "site" / "index.html"

# The badge text as it appears in the bundle's plain-text template section.
BADGE = re.compile(r"v\d+\.\d+\.\d+(?= · MIT · npm · MCP)")


def main() -> int:
    check = "--check" in sys.argv
    version = json.loads((ROOT / "package.json").read_text())["version"]
    html = PAGE.read_text(encoding="utf-8")

    found = BADGE.findall(html)
    if not found:
        print("error: version badge not found in index.html — has the markup changed?")
        return 1
    if len(found) > 1:
        print(f"error: expected one badge, found {len(found)}: {found}")
        return 1

    if found[0] == f"v{version}":
        print(f"version badge up to date (v{version})")
        return 0

    print(f"  index.html: badge {found[0]} -> v{version}")
    if check:
        print("\nstale version badge. Run: python3 site/sync-version.py")
        return 1

    PAGE.write_text(BADGE.sub(f"v{version}", html), encoding="utf-8")
    print("  index.html: rewritten")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
