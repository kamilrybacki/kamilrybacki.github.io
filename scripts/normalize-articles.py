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
  6. Convert unordered list items using * or + markers to - markers.
     Remark serialises all list items with -, so other markers cause diffs.
  7. Convert _italic_ (single underscore) to *italic* (asterisk) in prose.
     Remark serialises emphasis with *, so underscore italic causes diffs.
  8. Convert reference-style links [text][label] / [text][] / [text] to
     inline links [text](url) and remove the link-reference definitions.
     Decap's remark serialiser inlines all reference links on round-trip.
  9. Convert typographic/curly quotes to plain ASCII equivalents in prose
     (not inside code fences).  Decap's Slate normalises them on load.
       U+201C " → "   U+201D " → "
       U+2018 ' → '   U+2019 ' → '
 10. Escape bare [text] bracket spans that have no matching link-reference
     definition (remark-stringify escapes them as \\[text] on round-trip).
     Applied after transformation 8 removes all known definitions, so any
     remaining [text] patterns are genuinely unresolved.  Code spans and
     already-escaped bracket-text spans are left untouched.

Exit code 0 always.  Prints a summary of which files changed.
"""

import re
from pathlib import Path

ARTICLES_DIR = Path(__file__).parent.parent / "src" / "content" / "articles"

RAW_LINE    = re.compile(r"^\{%-?\s*raw\s*-?%\}\s*$")
ENDRAW_LINE = re.compile(r"^\{%-?\s*endraw\s*-?%\}\s*$")

# Matches a standalone <img> that has only src and alt (order-independent).
_SRC = r'src\s*=\s*"([^"]*)"'
_ALT = r'alt\s*=\s*"([^"]*)"'
IMG_SRC_FIRST = re.compile(r'<img\s+' + _SRC + r'\s+' + _ALT + r'\s*/?>', re.I)
IMG_ALT_FIRST = re.compile(r'<img\s+' + _ALT + r'\s+' + _SRC + r'\s*/?>', re.I)

# Link reference definition: [label]: URL optional-title
LINK_DEF_RE = re.compile(
    r'^[ ]{0,3}\[([^\]]+)\]:\s*<?([^\s>]+)>?'
    r'(?:[ \t]+"[^"]*"|[ \t]+\'[^\']*\'|[ \t]+\([^)]*\))?[ \t]*$',
    re.MULTILINE,
)

_CURLY_QUOTES = {
    "\u201c": '"',   # LEFT DOUBLE QUOTATION MARK
    "\u201d": '"',   # RIGHT DOUBLE QUOTATION MARK
    "\u2018": "'",   # LEFT SINGLE QUOTATION MARK
    "\u2019": "'",   # RIGHT SINGLE QUOTATION MARK
}


def _img_to_md(match: re.Match, src_group: int, alt_group: int) -> str:
    return f"![{match.group(alt_group)}]({match.group(src_group)})"


def _convert_reference_links(text: str) -> str:
    """Inline all reference-style links and strip their definitions."""
    defs: dict[str, tuple[str, str]] = {}
    for m in LINK_DEF_RE.finditer(text):
        key = m.group(1).lower()
        if key not in defs:
            defs[key] = (m.group(1), m.group(2))

    if not defs:
        return text

    # 1. Replace full / collapsed references: ![alt][label], [text][label], [text][]
    #    Images (preceded by !) are left unchanged to avoid breaking image syntax.
    def repl_full(m: re.Match) -> str:
        display = m.group(1)
        label_raw = m.group(2).strip()
        key = (label_raw or display).lower()
        url = defs.get(key, (None, None))[1]
        return f"[{display}]({url})" if url else m.group(0)

    text = re.sub(r"(?<!!)\[([^\]]+)\]\[((?:[^\]]*)?)\]", repl_full, text)

    # 2. Replace shortcut references: [text] not followed by (, [, or :
    def repl_shortcut(m: re.Match) -> str:
        key = m.group(1).lower()
        url = defs.get(key, (None, None))[1]
        return f"[{m.group(1)}]({url})" if url else m.group(0)

    text = re.sub(r"(?<!!)\[([^\]]+)\](?![\[(:=])", repl_shortcut, text)

    # 3. Remove definition lines (after usages have been inlined)
    text = LINK_DEF_RE.sub("", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text


def _escape_bare_brackets(text: str) -> str:
    """Escape bare [text] spans that have no link definition.

    remark-stringify adds a backslash before unresolved shortcut references
    (e.g. [foo] with no [foo]: url line) to prevent ambiguity on re-parse.
    Pre-escaping them keeps the source identical to what remark would produce.

    Rules:
    - Skip code fences entirely.
    - Skip text inside backtick code spans on the same line.
    - Skip already-escaped bracket (backslash before the open bracket).
    - Skip image syntax (exclamation before the open bracket).
    - Skip inline links [text]( and full refs [text][.
    """
    # Pattern: unescaped [text] NOT followed by ( or [ or :
    # Negative lookbehind for \ and ! to skip already-escaped and image refs.
    _BARE = re.compile(r"(?<!\\)(?<!!)\[([^\]\n]+)\](?![\[(:=])")

    lines = text.splitlines(keepends=True)
    in_fence = False
    result = []
    for line in lines:
        stripped = line.rstrip("\n")
        if stripped.startswith("```"):
            in_fence = not in_fence
        if in_fence:
            result.append(line)
            continue

        # Split the line into alternating non-code / code-span segments.
        # Only apply escaping in non-code segments.
        parts = re.split(r"(`[^`]+`)", line)
        new_parts = []
        for j, part in enumerate(parts):
            if j % 2 == 1:  # code span — leave as-is
                new_parts.append(part)
            else:
                new_parts.append(_BARE.sub(r"\\[\1]", part))
        result.append("".join(new_parts))
    return "".join(result)


def _normalize_curly_quotes(text: str) -> str:
    """Replace typographic curly quotes with straight ASCII quotes in prose.

    Code fences are left untouched; only prose lines are affected.
    """
    lines = text.splitlines(keepends=True)
    in_fence = False
    result = []
    for line in lines:
        if line.rstrip("\n").startswith("```"):
            in_fence = not in_fence
        if not in_fence:
            for src, dst in _CURLY_QUOTES.items():
                line = line.replace(src, dst)
        result.append(line)
    return "".join(result)


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
    text = re.sub(r"\n{3,}", "\n\n", text)

    # 5. Convert <img src="..." alt="..."> to ![alt](src)
    text = IMG_SRC_FIRST.sub(lambda m: _img_to_md(m, 1, 2), text)
    text = IMG_ALT_FIRST.sub(lambda m: _img_to_md(m, 2, 1), text)

    # 6. Convert unordered list markers * and + to -
    text = re.sub(r"^( *)([*+])( +)", r"\1-\3", text, flags=re.MULTILINE)

    # 7. Convert _italic_ (single underscore) to *italic* (asterisk)
    text = re.sub(r"(?<!\w)_([^_\n]+?)_(?!\w)", r"*\1*", text)

    # 8. Inline all reference-style links / remove definitions
    text = _convert_reference_links(text)

    # 9. Normalise typographic curly quotes to plain ASCII
    text = _normalize_curly_quotes(text)

    # 10. Escape bare [text] spans that have no definition
    text = _escape_bare_brackets(text)

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
