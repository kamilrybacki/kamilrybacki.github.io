# Review Report — synthesis-studio

Date: 2026-05-31
Reviews run: security-review (security-reviewer agent), codex (service), codex (studio)
Plans: docs/superpowers/plans/2026-05-31-stt-synthesis-service.md, 2026-05-31-audio-studio-page.md

## Summary

| Severity | Count |
|----------|-------|
| Critical | 1 |
| Important | 2 |
| Minor | 3 |
| Suggestion / accepted | 5 |

Confirmed sound (all reviewers): auth verified before any paid call/GitHub fetch on both
endpoints; front-matter injection neutralised (`oneline`+`yamlQuote` server- and client-side);
XSS-safe render (`escapeHtml` + `.value`); SSRF-safe style-repo (env-fixed, not caller input);
`fetch_style_samples` fails closed to `[]`; audio never persisted.

## Findings

### 1. postMessage OAuth handler missing `e.origin`/`e.source` check — forged-token injection [Critical]
**Source:** security-review (C1), codex-studio (High)
**File:** `public/studio/studio.js` — `signIn()` `onMsg` listener (~L25–38)
**Issue:** The `message` listener trusts any `authorization:github:success:<json>` from any origin/window. A page holding a handle to the studio tab can `postMessage` a forged token → full auth bypass (attacker token used for transcribe/synthesize + GitHub commits).
**Fix:** `if (e.origin !== OAUTH) return; if (e.source !== popup) return;` at the top of `onMsg`.

---

### 2. `/synthesize` parses the JSON body before auth — pre-auth memory DoS [Important]
**Source:** security-review (I1), codex-service (High)
**File:** `src/stt_polish/main.py` — `synthesize_endpoint` (body parsed by FastAPI before L143)
**Issue:** `/transcribe` has a `Content-Length` pre-auth guard; `/synthesize` does not, so an unauth caller can POST a huge JSON body that is read/parsed before `verify_token`/caps.
**Fix:** Add a global body-size middleware capping `Content-Length` at `UPLOAD_BYTE_LIMIT` (blocks the GB-scale DoS; well above the small JSON `/synthesize` needs and at/above `/transcribe`'s own guard).

---

### 3. `popup.postMessage(e.data, '*')` wildcard target origin [Important]
**Source:** security-review (I2)
**File:** `public/studio/studio.js` — `onMsg` echo line
**Issue:** Echoes the handshake to the popup with `'*'`, delivering it regardless of where the popup navigated.
**Fix:** `popup.postMessage(e.data, OAUTH);`

---

### 4. `_is_draft` misses `draft: True` / quoted values [Minor]
**Source:** security-review (M1), codex-service (Low)
**File:** `src/stt_polish/github_articles.py` — `_is_draft` (~L28)
**Issue:** Case-sensitive `draft:\s*true` lets `draft: True`/`"true"`/`'true'` slip through → a draft could be used as a style sample.
**Fix:** `re.IGNORECASE` + match quoted variants.

---

### 5. `download_url` host not validated before forwarding the token [Minor]
**Source:** security-review (M2), codex-service (Low)
**File:** `src/stt_polish/github_articles.py` — `fetch_style_samples` (~L58)
**Issue:** The caller's GitHub token is sent to whatever `download_url` GitHub returns, without a host check.
**Fix:** Validate `https` + host in {`raw.githubusercontent.com`,`api.github.com`} before `_gh`.

---

### 6. `/synthesize`-side: every GitHub `422` treated as slug-collision [Minor]
**Source:** codex-studio (Medium)
**File:** `public/studio/studio.js` — `saveDraft` (~L107)
**Issue:** All `422`s are retried as renames; non-collision validation errors become bogus `-2`/`-3` slugs.
**Fix:** Only rename when the error body indicates the path already exists; else surface the error.

---

## Suggestions / accepted (no code change)
- **Token forwarded to the homelab service** (codex-studio Critical, security M2-studio): accepted by design — no narrower GitHub OAuth scope exists; HTTPS-only; service never logs the bearer and verifies it via `/user`. Same trust model as the prior widget/Action.
- **Commits go straight to `main`** (codex-studio Medium): accepted — `draft:true`, matches the existing Action/widget pattern for this personal blog.
- App-level per-token rate limit on `/synthesize` (S1): deferred — Caddy `import rate_limit` covers ingress.
- `noopener` on popup (S3): the `e.source !== popup` check (finding 1) is the correct mitigation.
- Truncate the OAuth error string in `status()` (S2): cosmetic.

## Fix plan
Fix 1–6. Skip the accepted/suggestion items. Re-run `pytest` (service) + `node --test` + `npm run build` (studio).
