#!/usr/bin/env python3
"""
Fails with a non-zero exit code if an em dash (U+2014, "-") or en dash
(U+2013, "-") appears anywhere in project source. This is a strict,
permanent project requirement: those characters read as AI-generated
prose, and this repo's copy is written without them, full stop, not
just avoided where someone remembered to check.

Run directly (python3 scripts/check-no-dashes.py) or via the
"no-em-en-dashes" job in .github/workflows/ci.yml, which runs it on
every push and pull request and fails the build on any match.
"""

import os
import sys

ROOTS = ["apps/web", "apps/api", "scripts"]
EXCLUDE_DIRS = {
    "node_modules",
    ".next",
    ".git",
    "__pycache__",
    ".venv",
    "venv",
    "media_storage",
    "dist",
    "build",
}
TEXT_EXTENSIONS = {".ts", ".tsx", ".js", ".jsx", ".py", ".md", ".mdx", ".css", ".html"}
DASH_CHARS = ("\u2014", "\u2013")  # em dash, en dash, as escapes so this checker file does not itself contain them


def find_offending_lines(repo_root: str) -> list[tuple[str, int, str]]:
    hits: list[tuple[str, int, str]] = []
    for root_name in ROOTS:
        base = os.path.join(repo_root, root_name)
        if not os.path.isdir(base):
            continue
        for dirpath, dirnames, filenames in os.walk(base):
            dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]
            for filename in filenames:
                if os.path.splitext(filename)[1] not in TEXT_EXTENSIONS:
                    continue
                path = os.path.join(dirpath, filename)
                try:
                    with open(path, encoding="utf-8") as handle:
                        content = handle.read()
                except (UnicodeDecodeError, OSError):
                    continue
                for line_number, line in enumerate(content.splitlines(), start=1):
                    if any(char in line for char in DASH_CHARS):
                        hits.append((os.path.relpath(path, repo_root), line_number, line.strip()[:160]))
    return hits


def main() -> int:
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    hits = find_offending_lines(repo_root)
    if not hits:
        print("No em or en dashes found in project source.")
        return 0

    print(f"Found {len(hits)} em/en dash occurrence(s). Replace with a comma, period, or parentheses:\n")
    for path, line_number, snippet in hits:
        print(f"  {path}:{line_number}: {snippet}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
