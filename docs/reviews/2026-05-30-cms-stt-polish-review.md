# Review Report — cms-stt-polish

Date: 2026-05-30
Reviews run: security-review (security-reviewer agent), codex (service), codex (widget)
Plans: docs/superpowers/plans/2026-05-30-stt-polish-{service,deploy}.md, 2026-05-30-decap-audio-widget.md

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| Important | 6 |
| Minor | 6 |
| Suggestion | 4 |

**Headline:** No auth bypass — all three reviews independently confirm `/transcribe` cannot reach the paid providers without a valid allowlisted GitHub token (`_bearer` → `verify_token` precede all paid calls; `verify_token` fails closed on empty allowlist/empty token/exception/non-200/mismatch). Confirmed safe: XSS in widget preview (Preact `h` escapes text children), YAML front-matter injection (Decap serializes, not string-concat), ffmpeg arg injection (list form + whitelisted suffix), temp-dir cleanup, CORS scope.

## Findings

### 1. Multipart 1 MB cap rejects real audio before auth runs [Important]
**Source:** security-review (IMPORTANT-1), codex-service (High)
**File:** `stt-polish-svc/src/stt_polish/main.py:51` (`audio: UploadFile = File(...)`)
**Issue:** FastAPI resolves the `UploadFile` param by calling `request.form()` with Starlette's default `max_part_size=1 MB`, BEFORE the handler body. Two consequences: (a) any audio >1 MB (i.e. essentially all real recordings) is rejected with a 400 at parse time — the feature is broken; (b) multipart is parsed/spooled before the bearer check, so an unauthenticated caller can make the service spool bodies.
**Fix:** Restructure `/transcribe` to take `request: Request`, do the cheap `Content-Length` guard + `_bearer` + `verify_token` FIRST, then `await request.form(max_part_size=MAX_UPLOAD_BYTES + 1MB)`.

---

### 2. Internal/upstream error text reflected to clients [Important]
**Source:** security-review (IMPORTANT-2), codex-service (Medium)
**File:** `main.py:69, 81, 87` (`detail=str(exc)` / f-strings with `exc`)
**Issue:** Config `ValueError` (env names), provider SDK errors, and `resp.text[:500]` (backends.py:179) get interpolated into HTTP responses — can leak env details, temp paths, ffmpeg command lines, provider response bodies. Spec requires "no secrets, no stack traces".
**Fix:** Log server-side via `logging`; return fixed generic detail strings.

---

### 3. Work/cost bounded by bytes, not audio duration [Important]
**Source:** codex-service (High)
**File:** `main.py:63`, `audio.py` (compress→64kbps, split into N×20-min chunks)
**Issue:** A 24 MB low-bitrate `.ogg`/`.webm` can decode to hours of audio → many paid STT chunk calls. Size cap alone doesn't bound spend.
**Fix:** Cap the number of chunks (e.g. `MAX_CHUNKS = 3` → ~60 min) after `prepare_chunks`; reject with 413 if exceeded.

---

### 4. `verify_token` not fail-closed on a malformed 200 [Important]
**Source:** codex-service (Low — escalated: auth correctness)
**File:** `stt-polish-svc/src/stt_polish/auth.py:24` (`resp.json()`)
**Issue:** Fetch exceptions are caught, but `resp.json()` on a 200 with a non-JSON body raises → turns a deny into a 500. Auth must always fail closed.
**Fix:** Wrap the `.json()`/login extraction in try/except → return False.

---

### 5. preSave helper-field cleanup is not reliable [Important]
**Source:** codex-widget (Medium), security-review (MINOR-1 — escalated: front-matter correctness)
**File:** `kamilrybacki.github.io/src/admin/audio-widget.js:103,116`
**Issue:** `if (!a) return data;` returns before `d.delete("audio")`, so a falsy-but-present `audio` value leaves the helper key in committed front-matter.
**Fix:** `if (!a) return data.delete("audio");` and ensure the populated branch also ends with `.delete("audio")`.

---

### 6. `tags` response shape unvalidated [Important]
**Source:** codex-widget (Medium)
**File:** `audio-widget.js:77` (`v.tags.join`), `:115` (writes into `widget: list`)
**Issue:** If the service ever returns `tags` as a string/object/null, the preview `.join` throws and/or the wrong type is written to the list field.
**Fix:** Coerce `tags` to an array of strings in the widget before preview/onChange.

---

### 7. No app-level rate limiting on `/transcribe` [Minor]
**Source:** security-review (IMPORTANT-3 — downgraded: mitigated at ingress)
**File:** `main.py:54`, `auth.py:8`
**Issue:** Every syntactically-valid bearer triggers an outbound GitHub `/user` call; a flood could exhaust the service's GitHub rate limit (self-DoS).
**Mitigation present:** the Caddy route includes `import rate_limit` (ingress-level). Combined with the Content-Length guard + auth-first ordering (finding 1) this is acceptable for a single-user service. No app dependency added. (Optional future: `verify_token` TTL cache — see Suggestion 2.)

---

### 8. Blocking I/O in an `async` endpoint [Minor]
**Source:** codex-service (Medium)
**File:** `main.py` (async), `auth.py:8` requests, `audio.py:15` subprocess, `backends.py:57` time.sleep
**Issue:** Synchronous calls block the event loop; one slow request stalls the worker.
**Fix:** Offload the blocking transcription/polish section to a threadpool (`starlette.concurrency.run_in_threadpool`).

---

### 9. No Subresource Integrity on the Decap CDN script [Minor]
**Source:** security-review (MINOR-3)
**File:** `src/admin/index.html:9`
**Issue:** A compromised unpkg delivery runs arbitrary JS on `/admin` with access to the localStorage token.
**Fix:** Add `integrity="sha384-…" crossorigin="anonymous"` to the pinned decap-cms script.

---

### 10. `/readyz` discloses provider-key presence [Minor]
**Source:** security-review (MINOR-4)
**File:** `main.py:40`
**Issue:** Distinct `misconfigured`/`no-keys` 503 bodies reveal internal state to unauthenticated callers.
**Fix:** Return a single generic `{"status":"not ready"}`.

---

### 11. File input not cleared after handling [Minor]
**Source:** codex-widget (Low)
**File:** `audio-widget.js:33`
**Issue:** Re-selecting the same file after a failure won't fire `change`.
**Fix:** Reset `e.target.value = ""` after reading the file.

---

### 12. No fetch timeout/abort [Minor]
**Source:** codex-widget (Low)
**File:** `audio-widget.js:40`
**Issue:** A hung request leaves the widget `busy` forever.
**Fix:** Use `AbortController` with a timeout (e.g. 180s).

---

### 13. GitHub token forwarded to homelab service [Suggestion / accepted]
**Source:** codex-widget (High), security-review (MINOR-2)
**File:** `audio-widget.js:44`
**Issue:** The repo-scoped Decap token is sent to the endpoint for identity. By design — no narrower GitHub OAuth scope is available, and it's the only identity credential. **Accept;** mitigate by never logging the bearer (service must not log it) and HTTPS-only via cloudflared.

---

### 14. `verify_token` caching not implemented [Suggestion]
**Source:** security-review (SUGGESTION-1)
**Issue:** Spec calls for a short TTL cache of positive results; not implemented → a GitHub call per request.
**Fix (cheap, stdlib):** small in-memory `{token: (ok, expiry)}` TTL cache. Will implement (reduces GitHub calls + finding 7 blast radius).

---

### 15. Bare `print` logging in backends [Suggestion]
**Source:** security-review (SUGGESTION-2)
**Issue:** `backends.py` uses `print`; fine (logs lengths/model names, no secrets) but unstructured. Out of scope for this pass; leave.

---

### 16. Missing `_bearer` edge-case tests [Suggestion]
**Source:** security-review (SUGGESTION-3)
**Issue:** No tests for lowercase `bearer`, extra spaces.
**Fix (cheap):** add a couple of tests.

## Fix plan
Fix Important 1–6, Minor 8–12, plus Suggestions 14 & 16 (trivial/safe). Skip 15 (out of scope). 7 mitigated at ingress + by 1/14. 13 accepted by design. Re-run `pytest` (service) and `npm run build` + `node --check` (widget) green.
