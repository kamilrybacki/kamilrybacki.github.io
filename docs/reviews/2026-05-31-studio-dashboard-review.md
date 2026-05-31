# Review Report — studio-dashboard (workspaces + dashboard)

Date: 2026-05-31
Reviews: security-review, codex (service), codex (studio UI)
Plans: docs/superpowers/plans/2026-05-31-studio-workspace-service.md, 2026-05-31-studio-dashboard-ui.md

## Summary

| Severity | Count |
|----------|-------|
| Critical | 1 |
| Important | 8 |
| Minor | 4 |
| Suggestion | 3 |

Clean (all reviewers): path traversal closed (`_safe` on every store entry), per-login isolation (login from token only), auth order (401→403), unguessable ids (`secrets.token_urlsafe`), postMessage origin/source intact, token only to STT + api.github.com, synthesized `article` rendered via `.value` not innerHTML.

## Findings

### 1. XSS — `w.id` / `n.id` / `noteCount` injected raw into HTML [Critical]
**Source:** codex-studio (Critical), security (M-1/S-3)
**File:** `public/studio/studio.js` `showDashboard()` (card `data-id`/`href`), `renderWorkspace()` (note/pending `data-id`)
**Issue:** Only title/status/name/transcript are escaped; `w.id`, `n.id`, `noteCount` are raw → a crafted workspace/note payload can break attribute context and run JS in the page holding the repo-scoped token. (Ids are server-token/sanitized, but defense-in-depth required.)
**Fix:** `escapeHtml()` every interpolated value (ids, counts) + sanitize note `id` charset server-side.

### 2. CORS allows only POST/OPTIONS → GET/PUT/DELETE preflight blocked [Important]
**Source:** security (I-1)
**File:** `src/stt_polish/main.py` CORS `allow_methods`
**Issue:** Dashboard's GET/PUT/DELETE are cross-origin → preflight 405 → browser blocks them. Dashboard non-functional.
**Fix:** `allow_methods=["GET","POST","PUT","DELETE","OPTIONS"]`.

### 3. Auto-save race clears `dirty`, drops last edit [Important]
**Source:** security (I-2), codex-studio (High)
**File:** `studio.js saveNow()`
**Issue:** Edits during an in-flight PUT get `dirty=false`'d on completion → follow-up save no-ops → "Saved ✓" while last edit lost.
**Fix:** capture dirty state before await; only clear if not re-dirtied since (sequence/flag guard).

### 4. Preview field edits not persisted (auto-save saves stale `article`) [Important]
**Source:** codex-studio (High)
**File:** `studio.js` preview inputs `f-*`
**Issue:** `f-title/desc/cat/tags/body` only copied into `current.article` inside `saveDraft`; auto-save/Save-progress persist the stale `current.article` → preview edits lost on reload/nav unless you Save draft.
**Fix:** wire `input` listeners on the `f-*` fields → update `current.article` + `markDirty()`.

### 5. Navigation discards unsaved state [Important]
**Source:** codex-studio (High)
**File:** `studio.js route()/openWorkspace()`
**Issue:** `hashchange` → `openWorkspace` overwrites `current` + resets dirty without flushing → switching workspaces/dashboard loses unsaved edits. `beforeunload` only covers full unload.
**Fix:** flush (`await saveNow()`) the outgoing workspace before loading another.

### 6. Stale `current` corrupts wrong workspace during long ops [Important]
**Source:** codex-studio (High)
**File:** `studio.js transcribeAll()/synthesize()/saveDraft()`
**Issue:** Completions write notes/article/status into the global `current`; switching mid-op lands results on the wrong workspace.
**Fix:** capture `const ws = current` at op start; guard each write-back with `if (current !== ws) return`.

### 7. No localStorage fallback on PUT failure [Important]
**Source:** security (I-3)
**File:** `studio.js saveNow()` catch
**Issue:** Spec requires mirroring to localStorage on save failure ("never lose notes"); not implemented.
**Fix:** on catch, `localStorage.setItem('studio.ws.'+id, JSON.stringify(current))`; restore-offer on open if newer.

### 8. Failed PUT never reschedules a retry [Important]
**Source:** codex-studio (Medium → grouped)
**File:** `studio.js saveNow()` catch
**Fix:** on failure keep `dirty` + `scheduleSave()` again (bounded backoff).

### 9. `/workspaces` PUT/POST body parsed pre-auth at the audio ceiling [Important]
**Source:** codex-service (High)
**File:** `main.py _limit_body` middleware
**Issue:** Middleware caps at the 25 MB audio limit for all paths; workspace JSON should be ~1 MB. Pre-auth 25 MB JSON parse is a mild DoS (chunked/no-CL bypasses entirely — accepted, Caddy-mitigated).
**Fix:** path-aware cap — `/transcribe` keeps `UPLOAD_BYTE_LIMIT`; other paths capped at 1 MB.

### 10. `notes` non-dict entries silently dropped (data wipe) [Important]
**Source:** codex-service (Medium → escalated: silent data loss)
**File:** `workspaces.py put_workspace`
**Issue:** `{"notes":[1,2]}` → non-dicts filtered → notes overwritten with `[]`, returns 200.
**Fix:** reject (raise ValueError→422) if any note isn't a dict with the expected shape.

### Minor
- **11.** Atomic write uses predictable `.tmp` → concurrent-write corruption. Fix: unique tmp name (security M-2).
- **12.** Blank `Bearer ` → 403 not 401 (codex-svc Low). Fix: `_bearer` rejects empty token with 401.
- **13.** Note `id` charset unbounded server-side (ties to #1). Fix: sanitize to `[A-Za-z0-9_-]`, cap length.
- **14.** Corrupt workspace file surfaces as 404, hiding corruption (codex-svc Low). Accept/log later.

### Suggestion (skip)
- Auth `/user` TTL cache (security M-3): deferred — a token-keyed cache breaks the injected-fetch unit tests; the localStorage fallback (#7) covers the data-loss angle. Caddy `rate_limit` covers ingress.
- App rate-limit on workspace routes (S-1); `article` shape validation (S-2).

## Fix plan
Fix 1–13 (Critical + Important + cheap Minor). Skip 14 + suggestions. Re-run `pytest` + `node --test` + `npm run build`.
