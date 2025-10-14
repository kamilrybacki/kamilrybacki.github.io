# CSS Architecture & Conventions

This project uses a lightweight layered CSS approach aimed at clarity and minimal maintenance.

## Layer Order (Current)

1. `tokens/` – Primitive design decisions (colors, spacing scale, font stacks, transitions, highlight gradients).
2. `base/` – Global element normalization + default typographic rhythm.
3. `layouts/` – Page/layout scoped styling (split by page role: `base-layout.css`, `article-layout.css`). Holds responsive rules relevant to that layout only.
4. (Future optional) `utilities/` – Tiny single‑purpose classes if a pattern repeats across >3 layouts.

`main.css` imports strictly in this order to keep the cascade predictable.

## Naming

- Components: `.component-name` (kebab-case). Sub-elements rely on descendant selectors (`.article-header h1`).
- Avoid deep nesting > 3 levels.
- Use semantic, not presentational, names (`.article-navigation` vs `.bottom-buttons`).

## Responsive Strategy

- Mobile-first. Media queries grouped inside each component file at the bottom using max-width breakpoints (currently `768px` and `420/480px` as needed).
- Only introduce a new breakpoint when a layout *breaks*, not preemptively.

## Typography

- Global heading sizes in `typography.css` – component overrides only when necessary (e.g., article internal heading borders).
- Keep paragraph line-height between 1.55–1.8 for readability.

## Spacing

- Use spacing scale variables (`--space-*`). Avoid hard-coded pixel values except for 1px borders.
- Keep vertical rhythm by ending component blocks with a consistent bottom margin (prefer `var(--space-xl)` or `--space-lg`).

## Borders & Aesthetic

- Dotted lines unify visual separation. Use border thickness tokens where possible.
- Avoid mixing solid/dotted unless highlighting a distinct semantic meaning.

## Layout Guidelines

- Homepage & shared preview styles: `layouts/base-layout.css` (includes filters, article preview list, site header).
- Article detail view: `layouts/article-layout.css` (header bar + `.article-content` rich typography, code, tables, emphasis).
- Headings:
  - Homepage visual h1: `.site-title` (base layout)
  - Article page header h1: `.article-header h1`
  - In‑content h1 inside Markdown: `.article-content h1`
  Keep page‑specific heading overrides inside the relevant layout file.

## Removed / Deprecated (Historical)

Legacy component era replaced by layout split. Removed files:
`homepage.css`, `articles.css`, `filters.css`, `header.css`, `hero.css`, `section-headers.css`, `tables.css`, `responsive.css`.

Do not re‑add these wholesale. Introduce new structure under `layouts/` or a narrow utility if broadly shared.

## Lists

- Mobile list indentation reduced using `ch` units for predictable character-based indent.

## When Adding New Styles

1. Check if a token exists before inventing a new value.
2. Ask: is this global (base/layout) or component‑specific? Keep it local if possible.
3. Keep selectors shallow; prefer a single class on the root element.
4. Add responsive rules only where the element actually breaks.
5. Update this document if you add a new major component pattern.

## Refactoring Checklist

- Are there duplicate selectors across files? Consolidate.
- Are media queries consistent and minimal?
- Can an element style be expressed with an existing token?
- Remove dead code promptly when UI sections are deleted.

## Highlight Tokens

Reusable gradients live as custom properties in `tokens/variables.css`:

```css
--hl-yellow
--hl-pink
--hl-green
```

Usage example:
```css
.article-content strong { background: var(--hl-yellow); }
```

Add more by defining `--hl-*` tokens; avoid hardcoding gradients in layout files.

## Future Opportunities

- Convert highlight variants into utility classes (`.hl-yellow`, etc.).
- Add CSS size regression check in CI.
- Dark theme via alternate token layer (prefix variables with `--dark-*` and toggle root scope).
- Visual regression tests for homepage + article canonical examples.

---
This guide keeps the CSS intentional and lean—refer back before introducing new global rules.
