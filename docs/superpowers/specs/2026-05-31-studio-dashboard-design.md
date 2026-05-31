# Design — Studio persistent workspaces + dashboard

Date: 2026-05-31
Status: Approved
Repos: stt-polish-svc (server store) + kamilrybacki.github.io (studio UI)

## Goal

Turn the studio from a single ephemeral session into **persistent, per-user "started
articles"** with a **dashboard**: list in-progress ideas/articles, open to resume, delete.
State lives server-side (cross-device) on k3s.

## Decisions (approved)

1. **Storage:** server-side on `stt-polish-svc`, JSON files on a PVC (nfs), one file per
   workspace at `/data/workspaces/<github-login>/<id>.json`. (Not SQLite.)
2. **Dashboard lists studio workspaces only** (not repo `draft:` .md). Statuses:
   `collecting | synthesized | committed`.
3. **Persistence:** **both** debounced **auto-save** AND an explicit **"Save progress"**
   button.
4. Per-user, keyed by the verified GitHub login. No raw audio server-side (notes =
   transcripts only; pending audio blobs stay client-side/transient).

## Part 1 — Service: workspace store

**New module `src/stt_polish/workspaces.py`** — CRUD over JSON files:
- Root dir from env `WORKSPACES_DIR` (default `/data/workspaces`).
- Per-login subdir; workspace id = a URL-safe random token (generated server-side).
- Functions (pure-ish, dir injectable for tests): `list_workspaces(login)`,
  `create_workspace(login, data)`, `get_workspace(login, id)`, `put_workspace(login, id, data)`,
  `delete_workspace(login, id)`. Sanitize `login`/`id` to `[A-Za-z0-9_-]` to prevent path
  traversal. `list_` returns lightweight summaries (id, title, status, noteCount, updatedAt);
  full read returns the whole doc. Timestamps set server-side (passed in by the endpoint,
  since `datetime.now` is fine in the service — not the workflow sandbox).

**Auth refactor:** add `auth.resolve_login(token) -> str | None` (the allowlisted login or
None) reusing the same GitHub `/user` call + allowlist; `verify_token` stays for the existing
endpoints. Workspace endpoints use `resolve_login`; 403 if None.

**Endpoints (main.py), all Bearer-gated, JSON):**
- `GET  /workspaces` → `{workspaces: [summary...]}`
- `POST /workspaces` (`{title?}`) → `{id, ...workspace}` (status `collecting`)
- `GET  /workspaces/{id}` → full workspace (404 if absent for this login)
- `PUT  /workspaces/{id}` (`{title?, notes?, article?, status?}`) → updated workspace
  (validate: notes is a list capped at `MAX_NOTES`, total transcript chars capped, title
  length capped; reject otherwise 422)
- `DELETE /workspaces/{id}` → `{ok: true}`
- CORS already allows the studio origin; add a body-size guard (existing middleware covers it).

**Cap/limits:** per-login workspace count cap (e.g. 200) to bound disk; each workspace doc
size cap. Reject with 413 over cap.

## Part 2 — Service deploy (chart)

`helm/charts/stt-polish-svc`:
- Add a `PersistentVolumeClaim` (storageClass `nfs`, e.g. `256Mi`, RWO) + volumeMount at
  `/data`; `WORKSPACES_DIR=/data/workspaces`.
- `strategy: Recreate` + `replicas: 1` (RWO PVC can't be held by two pods during a rolling
  update). `readOnlyRootFilesystem: true` stays (only `/data` + `/tmp` writable).
- Argo app unchanged. Deploy = push helm main → ArgoCD sync → rollout (pulls new image).

## Part 3 — Studio UI (`public/studio/`)

Hash-routed single page:
- **Dashboard (`#/`):** `GET /workspaces` → cards (title, status badge, note count,
  relative updatedAt) with **Open** + **Delete**; **+ New article** → `POST /workspaces`
  → open `#/w/<id>`. Empty state.
- **Workspace (`#/w/<id>`):** `GET /workspaces/{id}` → the existing flow (record/upload →
  pending queue → Transcribe all → notes → Synthesize → preview → **Save draft** commit),
  bound to the workspace. Editable **title**. A **back to dashboard** link.
  - **Auto-save:** debounced (~1.5 s after a change to notes/article/title/status) `PUT`.
  - **Save progress** button: forces an immediate `PUT`; shows `Saved ✓ / Saving… / Unsaved`.
  - **Save draft** (existing GitHub-commit path) → on success set `status:committed`, `PUT`,
    keep the workspace + show the CMS link.
- **Pending audio** (raw blobs) stays client-side only — never sent to the workspace store;
  transcripts (notes) are what persist.
- **Offline/PUT failure:** mirror the workspace to `localStorage` and show **Unsaved**; retry
  on next change/blur; never lose notes.
- Auth (cms-auth popup) unchanged; token used for both the studio service calls and commits.

**studio-lib.js** gains pure helpers (unit-tested): `workspaceSummary(ws)` (derive
title/status/noteCount), `relTime(iso, now)` (e.g. "2h ago"). Existing helpers unchanged.

## Data flow

```
sign in → GET /workspaces → dashboard cards
  + New → POST /workspaces → #/w/<id>
  open card → GET /workspaces/{id} → workspace view
  record/upload → transcribe → notes; synthesize → article
       └─ debounced PUT /workspaces/{id}  (+ explicit Save progress)
  Save draft → GitHub Contents PUT .md → status=committed → PUT → CMS link
```

## Error handling

- Service: path-sanitize login/id (no traversal); 404 missing; 422 invalid body; 413 over caps;
  generic 500 (logged). Store writes atomic (write tmp file + rename).
- Studio: auth fail → sign-in; PUT fail → localStorage mirror + Unsaved + retry; per-clip
  transcribe + synthesize errors unchanged.

## Testing

- Service pytest: workspaces CRUD against a tmp dir; per-login isolation (login A can't read
  B); path-traversal attempts rejected; caps (too many notes/workspaces → 4xx); auth (no/ bad
  token → 401/403); `resolve_login` (allowed vs wrong login). FastAPI TestClient with the
  store dir monkeypatched.
- Studio: node unit tests for `workspaceSummary`/`relTime`; manual checklist (create, list,
  open, auto-save, explicit save, reload→persists, cross-device implied, delete, commit→status).

## Out of scope (YAGNI)

- Repo-draft listing, multi-user/sharing, audio persistence, search/tags on the dashboard,
  workspace history/versioning.
