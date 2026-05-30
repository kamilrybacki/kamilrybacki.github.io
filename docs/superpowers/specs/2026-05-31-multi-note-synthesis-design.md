# Design — Audio-notes Studio (multi-note synthesis → draft article)

Date: 2026-05-31
Status: Approved (pending spec review)
Repo: kamilrybacki/kamilrybacki.github.io (+ stt-polish-svc service)

## Goal

A standalone "studio" page where the author collects **several** spoken audio notes
under one prospective article, transcribes each as it is added, then runs a single
**synthesis + stylization** step that fuses the notes into one coherent draft article
written in the author's voice — and commits it as a `draft: true` Markdown file for
later refinement in the CMS.

This supersedes the single-note Decap widget (which is removed).

## Decisions (locked during brainstorming)

1. **Collection:** accumulate-then-synthesize. Drop one or many notes at a time; each
   transcribes immediately and stacks into a visible, reorderable/removable list that
   persists across sittings. Synthesize on demand.
2. **Style source:** the notes themselves **plus** the author's recent published
   articles (fetched as a style reference).
3. **Synthesis shape:** **free** — merge overlapping ideas, drop repetition, reorganize
   into the most coherent structure regardless of drop order.
4. **Home:** a **standalone studio page**, NOT a Decap widget. Avoids Decap's
   single-field widget limits (no `preSave`/cross-field hacks, no `window.h` gymnastics).
5. **Auth:** reuse the existing `cms-auth` GitHub OAuth provider (same popup handshake
   Decap uses) to obtain a GitHub token in the browser.
6. **Remove** the Decap audio widget (`src/admin/audio-widget.js`, its `<script>` tag,
   the eleventy passthrough line, and the `audio` field in `src/admin/config.yml`).

## Architecture

Three units:

### 1. Studio page — `kamilrybacki.github.io` (static, client-side)

- **Location:** `src/studio/` → built to `/studio/` (Eleventy). Plain HTML + a focused
  JS module (or a couple of small modules). No framework required; keep it small.
- **Auth:** on "Sign in", open a popup to
  `https://cms-auth.kamilandrzejrybacki.dpdns.org/auth?provider=github&scope=repo&site_id=kamilrybacki.github.io`
  and listen for the `authorization:github:success:<token-json>` `postMessage`
  (the Netlify/Decap OAuth handshake the provider implements). Hold the token in memory;
  optionally cache the *login state* (not the token) for UX. The token has `repo` scope.
- **Accumulate:** a drop zone + file input (accept `audio/*`, multiple). For each file:
  `POST {STT}/transcribe` with `Authorization: Bearer <token>` → `{transcript}` →
  append `{id, name, transcript}` to a notes array. Render the list: name, transcript
  preview, **remove** and **reorder** (up/down) controls. Persist the notes array in
  `localStorage` (keyed per draft session) so the collection survives reloads.
- **Synthesize:** "Synthesize N notes" → `POST {STT}/synthesize` with
  `{ notes: [transcript, …] }` + Bearer token → `{title, description, category, tags,
  body}`. Render an editable preview (title, description, category, tags editable;
  body shown as Markdown source + rendered preview).
- **Commit:** "Save draft" → build front-matter (sanitized: newline-flatten + quote
  scalars, `draft: true`, `layout: article.njk`, `date: today`) + body, slugify the
  title, and `PUT` the GitHub Contents API
  (`/repos/kamilrybacki/kamilrybacki.github.io/contents/src/content/articles/<slug>.md`,
  branch `main`) with the token. On 422/slug-exists, offer a renamed slug. On success,
  clear the studio's `localStorage` notes and show a link
  `https://kamilrybacki.github.io/admin/#/collections/articles/entries/<slug>` to refine
  in the CMS.
- **STT base URL** is a constant: `https://stt.kamilandrzejrybacki.dpdns.org`.

### 2. Service — `stt-polish-svc` (existing, on k3s)

Two endpoints (replacing the single `/transcribe`-that-polished):

- `POST /transcribe` (multipart `audio`, Bearer token) → `{ "transcript": "<raw text>" }`.
  Same audio prep (ffmpeg compress/chunk), same `transcribe()` STT call, **no polish**.
  Same auth (`verify_token` allowlist), Content-Length guard, `MAX_CHUNKS` cap,
  threadpool offload, generic errors.
- `POST /synthesize` (`application/json`: `{ "notes": ["transcript", …] }`, Bearer token)
  → `{ title, description, category, tags, body }`.
  - Verify the token (allowlist) as today.
  - **Style reference:** use the *same* Bearer token to call the GitHub API and fetch
    the N (default 3) most-recent **non-draft** articles under `src/content/articles/`
    (list dir → sort → fetch bodies → strip front-matter → truncate to a char budget).
    Cache briefly in-memory. On any failure, proceed **without** style samples.
  - **Synthesis prompt (new):** the transcripts are raw spoken notes for ONE article.
    Fuse them — merge overlapping ideas, drop repetition, reorganize freely into the
    clearest structure. **Preserve the author's spoken voice, idioms and rhythm** from
    the notes; additionally **match the written style** of the provided sample articles.
    Fix grammar/filler, no invented facts. Emit the existing JSON shape. Reuse the
    front-matter-safe scalar handling.
  - Reuse `_with_retry`, the OpenAI/Anthropic polish backends (rename conceptually to
    "synthesize"), and the JSON extraction.

The `backends`/`audio`/`auth` modules are reused; `main.py` gains the split endpoints.
`MAX_NOTES` cap (e.g. 20) and a total-transcript char cap guard the synthesize call.

### 3. Decap CMS — unchanged for editing

Stays the GitHub-backed editor for the resulting Markdown. The audio widget is removed
(decision 6). No new Decap config beyond that removal.

## Data flow

```
Studio: Sign in (cms-auth popup → GitHub token)
  → drop note(s) → POST /transcribe (Bearer) → {transcript} → notes[] (localStorage)
  → (repeat, across sittings; reorder/remove)
  → "Synthesize" → POST /synthesize {notes} (Bearer)
        service: verify token → fetch recent articles (style) → synthesize+stylize
     → {title,description,category,tags,body} → editable preview
  → "Save draft" → GitHub Contents PUT src/content/articles/<slug>.md (draft:true)
  → link to Decap to refine
```

## Security

- Same Bearer-GitHub-token auth on both endpoints (allowlisted login, fail-closed).
- Token lives only in the studio tab's memory; not logged by the service.
- Audio never persisted (per-request temp dir, deleted) — unchanged.
- Front-matter injection mitigated by the existing flatten+quote scalar handling, applied
  both server-side (synthesize output shaping) and in the studio's commit builder.
- CORS on the service already allows `https://kamilrybacki.github.io` (studio origin).
- Commit uses the user's own token (repo scope) — same trust as Decap.

## Error handling

- `/transcribe` failure → that note is not added; inline error; other notes unaffected.
- `/synthesize` failure → notes preserved for retry; inline error.
- Style-fetch failure → synthesize proceeds without samples (degrade, don't fail).
- Commit 422 (slug exists) → offer a renamed slug; other errors surfaced verbatim-safe.

## Testing

- **Service:** pytest — `/transcribe` returns raw transcript (faked STT); `/synthesize`
  with faked backend + faked style-fetch asserts JSON shape and that all notes are passed
  to the prompt; auth tests unchanged; `MAX_NOTES`/oversize guards.
- **Studio:** a small unit test for the pure helpers (slugify, front-matter/commit-payload
  builder, notes (de)serialization) runnable under node; plus a manual checklist
  (sign-in, accumulate, reorder, remove, persist-across-reload, synthesize, commit,
  slug-collision, CMS link).

## Out of scope (YAGNI)

- Editing audio/transcripts inline beyond remove/reorder.
- Multiple concurrent draft sessions (one accumulating session at a time).
- Server-side note storage (localStorage suffices).
- Mic recording in-browser (file upload only for v1).
- Migrating the CMS (Sveltia etc.) — separate decision.

## Removal checklist (decision 6)

- `src/admin/audio-widget.js` (delete)
- `<script src="audio-widget.js">` in `src/admin/index.html` (remove)
- `addPassthroughCopy({ "src/admin/audio-widget.js": ... })` in `.eleventy.js` (remove)
- `{ name: audio, … widget: audio }` field in `src/admin/config.yml` (remove)
