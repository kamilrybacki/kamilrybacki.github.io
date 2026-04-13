#!/usr/bin/env python3
"""
Normalize markdown article source files so they round-trip through the
Decap CMS Slate editor without producing phantom diffs.

Transformations applied (all idempotent):
  1. Replace non-breaking spaces (U+00A0) with regular spaces.
  2. Strip trailing whitespace from every line.
  3. Collapse two or more consecutive blank lines into one.
  4. Remove standalone {% raw %} / {% endraw %} lines — the Eleventy
     preprocessor (addPreprocessor in .eleventy.js) re-adds them at build
     time around any code fence containing Nunjucks syntax.
  5. Convert bare <img src="..." alt="..."> HTML tags to markdown image
     syntax ![alt](src).  Slate normalises the self-closing slash and
     attribute quoting, so HTML img tags always produce phantom diffs.
     Only tags with exactly src + alt are converted; any other attributes
     are left alone to avoid data loss.

Exit code 0 always.  Prints a summary of which files changed.
"""

import re
from pathlib import Path

ARTICLES_DIR = Path(__file__).parent.parent / "src" / "content" / "articles"

RAW_LINE    = re.compile(r"^\{%-?\s*raw\s*-?%\}\s*$")
ENDRAW_LINE = re.compile(r"^\{%-?\s*endraw\s*-?%\}\s*$")

# Matches a standalone <img> that has only src and alt (order-independent).
# Captures src and alt values; rejects tags that have extra attributes.
_SRC = r'src\s*=\s*"([^"]*)"'
_ALT = r'alt\s*=\s*"([^"]*)"'
IMG_SRC_FIRST = re.compile(
    r'<img\s+' + _SRC + r'\s+' + _ALT + r'\s*/?>',
    re.I,
)
IMG_ALT_FIRST = re.compile(
    r'<img\s+' + _ALT + r'\s+' + _SRC + r'\s*/?>',
    re.I,
)


def _img_to_md(match: re.Match, src_group: int, alt_group: int) -> str:
    src = match.group(src_group)
    alt = match.group(alt_group)
    return f"![{alt}]({src})"


def normalize(text: str) -> str:
    # 1. Non-breaking spaces → regular spaces
    text = text.replace("\xa0", " ")

    # 2. Strip trailing whitespace per line
    text = re.sub(r"[ \t]+$", "", text, flags=re.MULTILINE)

    # 3. Collapse 3+ consecutive newlines (= 2+ blank lines) into 2 newlines
    text = re.sub(r"\n{3,}", "\n\n", text)

    # 4. Remove standalone {% raw %} / {% endraw %} lines
    lines = text.splitlines(keepends=True)
    kept = []
    for line in lines:
        stripped = line.rstrip("\n")
        if RAW_LINE.match(stripped) or ENDRAW_LINE.match(stripped):
            continue
        kept.append(line)
    text = "".join(kept)

    # Re-collapse blanks that may have appeared after raw-line removal
    text = re.sub(r"\n{3,}", "\n\n", text)

    # 5. Convert <img src="..." alt="..."> / <img alt="..." src="..."> to ![alt](src)
    #    Only when the tag has exactly those two attributes (no width, class, etc.)
    text = IMG_SRC_FIRST.sub(lambda m: _img_to_md(m, 1, 2), text)
    text = IMG_ALT_FIRST.sub(lambda m: _img_to_md(m, 2, 1), text)

    return text


def main() -> None:
    changed = []
    for md_file in sorted(ARTICLES_DIR.glob("*.md")):
        original = md_file.read_text(encoding="utf-8")
        normalized = normalize(original)
        if normalized != original:
            md_file.write_text(normalized, encoding="utf-8")
            changed.append(md_file.name)

    if changed:
        print(f"Normalized {len(changed)} file(s):")
        for name in changed:
            print(f"  - {name}")
    else:
        print("All article files already clean.")


if __name__ == "__main__":
    main()
