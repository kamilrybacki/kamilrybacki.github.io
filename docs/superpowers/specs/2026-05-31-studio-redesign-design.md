# Design — Studio UX redesign (mobile-first, on-brand)

Date: 2026-05-31
Status: Approved
Repo: kamilrybacki.github.io (studio page only)

## Goal

Restyle `/studio/` to match the blog's brutalist-mono identity and be comfortable on
mobile (large tap targets, sticky primary action). **No behavior change** — same
dashboard / workspace / record / transcribe / synthesize / save flow and element ids.

## Decisions (approved)

1. Match the blog: tokens (palette, heavy borders, gold accent) + fonts **Space Grotesk**
   (headings) / **Space Mono** (body), via the same Google Fonts `<link>` the site uses
   (`src/_layouts/base.njk:10`).
2. **Sticky bottom action bar** on mobile for the current primary action.
3. Google-Fonts link OK (not self-hosting).

## Visual system (inline in studio `<style>`)

- Palette: `--bg:hsl(0 0% 95%)`, `--card:hsl(0 0% 100%)`, `--ink:hsl(0 0% 5%)`,
  `--muted:hsl(0 0% 40%)`, `--accent:hsl(43 50% 55%)` (gold), `--accent-ink:hsl(0 0% 5%)`.
- Borders: `2px` default, `3px` for primary/cards; square corners. Fonts as above; base 16px.
- Buttons: min-height 48px, `border:2px solid ink`, mono, uppercase-ish; primary = gold bg.
  Hover/active: 2px offset "pressed" shadow (brutalist).
- Layout: single column, `max-width:640px`, centered; padding scales; inputs `font-size:16px`
  (no iOS zoom). Status chip colors by save-state.

## Components (markup keeps all existing ids)

- **Header:** `Audio Studio` (Grotesk) + `#status` line.
- **Dashboard (`#view-dashboard`):** `#cards` — each `li` a large bordered tappable card
  (title link, square-bullet status `.badge`, `.meta` = "N notes · rel time", Delete button
  ≥44px). `#new-ws` = full-width gold bar. Empty state styled.
- **Workspace (`#view-workspace`):** back link + `#w-title` big input + `#savestate` chip +
  `#save-progress`. `#drop` large dashed zone with `#file` browse + `#rec` (gold + pulsing
  while recording). `#pending` / `#notes` bordered cards; action buttons (`data-act`) become
  44px icon buttons. `#preview` form: big inputs + tall mono `#f-body`; `#save` prominent;
  `#cms-link` styled.
- **Sticky bar (`#sticky`, new):** fixed bottom on mobile, holds one `#primary` button whose
  label/action/enabled is set by `renderWorkspace()`:
  - pending > 0 → "Transcribe all (N)" → transcribeAll
  - else article → "Save draft" → saveDraft
  - else notes > 0 → "Synthesize" → synthesize
  - else disabled "Record or drop a note"
  Hidden on desktop (`@media (min-width:700px)`), where the existing inline buttons show.

## studio.js change (minimal)

- Add `#primary` handling: in `renderWorkspace()`, compute `{label, action, enabled}` and set
  the sticky button; a single click handler dispatches by stored `dataset.action`
  (`transcribe|synthesize|save`). Inline `#transcribe-all`/`#synth`/`#save` stay (desktop).
- Add a `recording` class toggle on `#rec`/body for the pulsing state (in start/stopRec/onstop).
- No logic/flow change; ids preserved.

## Testing

- `node --test` (pure helpers) still green; `node --check studio.js`; `npm run build` emits
  `_site/studio/*`. Manual: mobile viewport — targets ≥48px, sticky bar reachable, fonts/colors
  on-brand, full flow works (record/transcribe/synthesize/save), desktop inline buttons show.

## Out of scope

- Behavior/flow changes, new features, dark mode, animations beyond the record pulse + button press.
