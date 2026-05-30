# Design — In-CMS audio → article (STT + polish) for Decap

Date: 2026-05-30
Status: Approved (pending spec review)
Repo: kamilrybacki/kamilrybacki.github.io

## Goal

Let the author turn a spoken recording into a draft article **from inside the
Decap CMS editor** (`/admin/#/collections/articles`): upload an audio file in
the article editor, have it transcribed and polished by an LLM, and have the
result fill the article's fields (`title`, `description`, `category`, `tags`,
`body`) for review and editing — all without leaving the CMS.

This complements (does not replace) the existing GitHub Action path
(`audio-inbox/` → `.github/workflows/transcribe-audio.yml`), which remains the
no-UI / bulk path.

## Decisions (locked during brainstorming)

1. **UX:** in-editor, synchronous — fields fill from within the CMS.
2. **Endpoint host:** a small service on homelab k3s that **reuses the existing
   `scripts/transcribe_audio.py` logic** (same prompt, pluggable STT/polish
   backends, ffmpeg compress + chunk). Keys from Vault.
3. **Widget scope:** upload audio → fill **all** article fields (then review/edit).
4. **Endpoint auth:** verify the GitHub OAuth token Decap already holds; the
   service confirms the caller is the repo owner before spending API credits.
5. **Fill mechanism:** **Approach A** — a dedicated `audio` custom widget holds
   the polish result and shows a review preview; a `preSave` event listener fans
   the result into the real fields. Documented APIs only (no Decap internals
   beyond reading the stored auth token), so it survives Decap upgrades. The
   native `modes: ['raw']` body editor is preserved. Tradeoff accepted: the form
   fields populate on the first **Save** (then fine-tuned natively), not the
   instant the call returns.

## Architecture

Two independent units:

### 1. `stt-polish-svc` — homelab STT+polish HTTP service

- **Runtime:** FastAPI (Python), containerised, deployed on k3s. Reuses the
  existing backend code from `scripts/transcribe_audio.py` (config loading,
  `compress_audio`/`split_audio`/`prepare_chunks`, `transcribe`, `polish`,
  `_with_retry`) — extracted into an importable module so the script and the
  service share one implementation.
- **Endpoint:** `POST /transcribe`
  - Request: `multipart/form-data` with one `audio` file part. `Authorization:
    Bearer <github-token>` header required.
  - Response `200`: `{ "title", "description", "category", "tags": [...],
    "body" }` — the same dict shape `polish()` already returns (minus front-matter
    assembly; the widget/CMS owns front-matter).
  - Errors: `401` (missing/invalid token), `403` (token valid but caller is not
    the allowed user), `415` (unsupported audio type), `502` (provider failure
    after retries), `500` (misconfiguration, e.g. missing key).
- **Auth check:** call `GET https://api.github.com/user` with the bearer token;
  require the returned `login` to equal an allowlisted GitHub login
  (`kamilrybacki`), configured via env. Reject otherwise, before any paid call.
  Cache positive results briefly (in-memory, short TTL) to avoid a GitHub call
  per request.
- **Secrets/config:** STT/polish schema, base URL, model, and API keys injected
  from Vault (same variable names the script already uses:
  `STT_PROVIDER_*`, `POLISH_PROVIDER_*`, `OPENAI_API_KEY`, etc.), plus
  `ALLOWED_GITHUB_LOGIN`.
- **Audio handling:** the uploaded file is written to a per-request temp dir,
  compressed/chunked with ffmpeg (reused logic), transcribed, polished, then the
  temp dir is deleted. **Audio is never persisted and never touches git.**
- **Limits:** enforce a max upload size (reject early with `413`) and a request
  timeout aligned with the provider calls.
- **Exposure:** behind Caddy + cloudflared at a dedicated hostname
  (e.g. `stt.kamilandrzejrybacki.dpdns.org`), so the browser-side CMS can reach
  it. CORS must allow the site origin (`https://kamilrybacki.github.io`) for
  `POST` + the `Authorization` header.

### 2. `audio-widget.js` — Decap custom widget + preSave listener

- **Location:** `src/admin/audio-widget.js`, loaded by adding a `<script
  src="audio-widget.js"></script>` to `src/admin/index.html` (after the Decap
  CDN script). **Eleventy passthrough must be extended** — the build copies
  `src/admin/*` files individually (see `.eleventy.js`), so a new line
  `addPassthroughCopy({ "src/admin/audio-widget.js": "admin/audio-widget.js" })`
  is required.
- **Registration:** `window.CMS.registerWidget('audio', Control)` and
  `window.CMS.registerEventListener({ name: 'preSave', handler })`.
- **Control behaviour:**
  - Renders a file input + "Transcribe & polish" button + status line + a
    read-only preview of the returned title/description/category/tags and the
    first lines of the body.
  - On click: read the GitHub token from Decap's stored auth (localStorage key
    written by the Decap GitHub backend), `POST` the file to the service with the
    bearer token, store the returned JSON object as the widget's own field value
    (`this.props.onChange(result)`), and render the preview.
  - Errors surface inline; the rest of the form stays fully usable.
- **preSave handler:** read the `audio` field value from `entry.get('data')`;
  if present, `.set()` `title`, `description`, `category`, `tags`, `body` from it
  (only overwriting empty/whitespace target fields, so manual edits win), then
  `.delete('audio')` so the helper value is not written to front-matter. Return
  the modified data.
- **Collection config:** add to the `articles` collection in
  `src/admin/config.yml` a field `{ name: audio, label: "Audio → draft",
  widget: audio, required: false }`. All existing fields stay as-is.

## Data flow

```
Decap editor (browser)
  │  pick audio file, click "Transcribe & polish"
  │  POST /transcribe  (multipart audio, Authorization: Bearer <gh-token>)
  ▼
Caddy + cloudflared ──► stt-polish-svc (k3s)
  │  verify gh-token → allowed login?
  │  ffmpeg compress/chunk → STT → polish (Vault keys)
  │  delete temp audio
  ▼  200 { title, description, category, tags, body }
Decap widget
  │  store result as `audio` field value, show preview
  │  author reviews; clicks Save
  ▼  preSave: fan result into real fields, clear `audio`
Decap GitHub backend → commit src/content/articles/<slug>.md (draft: true)
```

## Security posture

- **No audio in git.** The synchronous path keeps audio in browser → service →
  providers only; the service deletes it after the request. This removes the
  public-history exposure that the commit-to-`audio-inbox/` Action path has.
- **Paid endpoint is authenticated.** GitHub-token verification ties every
  request to the repo owner; no static client secret to leak.
- **Front-matter injection** is already mitigated in the shared `build_markdown`
  logic (newline-flattened, quoted scalars); the service returns the raw dict and
  the CMS/Decap performs YAML serialisation, which quotes values safely. The
  widget must still treat returned strings as data (render as text, never as
  HTML) to avoid DOM injection in the preview.
- **CORS** is scoped to the site origin; the service rejects other origins.

## Error handling

- Service: typed HTTP status codes (above); provider blips covered by the reused
  `_with_retry`; clear JSON error bodies (no secrets, no stack traces).
- Widget: every failure (network, 401/403, 5xx) shows an inline message and
  leaves manual editing untouched. A failed transcription never blocks Save.

## Testing

- **Service:** pytest with FastAPI `TestClient`. Reuse the existing offline
  faked-backend tests for the transcription/polish path; add tests for
  auth (missing token → 401, wrong login → 403, allowed login → 200 via a
  stubbed GitHub `/user` call) and for oversized/unsupported uploads.
- **Shared module:** the extracted module keeps the current
  `tests/test_transcribe_audio.py` green (imports updated to the new module path).
- **Widget:** CDN-loaded widgets are hard to unit-test; cover with a short manual
  test checklist (upload happy path, auth failure, provider failure, preSave
  fan-out, manual-edit-wins) plus one end-to-end smoke against a real recording.

## Out of scope (YAGNI)

- In-browser mic recording (file upload only for v1).
- Live (pre-Save) field fill via Decap internals (Approach B) — revisit only if
  the on-Save fill proves annoying.
- Composite mega-widget (Approach C).
- Multi-user access (single allowlisted GitHub login).

## Open coupling to watch on Decap upgrades

- Reading the GitHub token from Decap's stored auth (localStorage key/shape).
- The `preSave` payload shape (`entry.get('data')` Immutable map).

Both are documented/stable in Decap 3.3.3 (pinned). If a future upgrade breaks
token retrieval, Cloudflare Access is the fallback auth path.
