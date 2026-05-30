# stt-polish-svc Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A small FastAPI service that accepts an audio upload, transcribes + polishes it into an article dict, and returns it — gated by GitHub-token auth. Reused by the Decap CMS widget.

**Architecture:** Stateless HTTP service. Ports the STT/polish/audio logic from `kamilrybacki.github.io/scripts/transcribe_audio.py` (vendored copy — the github.io script stays for the Action path). One `POST /transcribe` endpoint plus `/healthz` `/readyz`. Auth verifies the caller's GitHub token resolves to an allowlisted login before any paid call. Audio lives only in a per-request temp dir, then deleted.

**Tech Stack:** Python 3.12, FastAPI, uvicorn, openai/anthropic/requests SDKs, ffmpeg (system), pytest + FastAPI TestClient. Container → GHCR via GitHub Actions. Repo: `github.com/kamilandrzejrybacki-inc/stt-polish-svc`, image `ghcr.io/kamilandrzejrybacki-inc/stt-polish-svc`.

**Working directory:** a NEW repo at `/home/kamil-rybacki/Code/stt-polish-svc` (created in Task 0).

---

### Task 0: Scaffold the repo

**Files:**
- Create: `/home/kamil-rybacki/Code/stt-polish-svc/pyproject.toml`
- Create: `/home/kamil-rybacki/Code/stt-polish-svc/.gitignore`
- Create: `/home/kamil-rybacki/Code/stt-polish-svc/src/stt_polish/__init__.py` (empty)
- Create: `/home/kamil-rybacki/Code/stt-polish-svc/README.md`

- [ ] **Step 1: Create dir + git init**

```bash
mkdir -p /home/kamil-rybacki/Code/stt-polish-svc/src/stt_polish /home/kamil-rybacki/Code/stt-polish-svc/tests
cd /home/kamil-rybacki/Code/stt-polish-svc && git init -q && touch src/stt_polish/__init__.py
```

- [ ] **Step 2: Write `pyproject.toml`**

```toml
[project]
name = "stt-polish-svc"
version = "0.1.0"
description = "Audio -> article (STT + LLM polish) HTTP service for the Decap CMS widget."
requires-python = ">=3.12"
dependencies = [
    "fastapi>=0.110",
    "uvicorn[standard]>=0.29",
    "python-multipart>=0.0.9",
    "httpx>=0.27",
    "openai>=1.30.0",
    "anthropic>=0.40.0",
    "requests>=2.31.0",
]

[project.optional-dependencies]
dev = ["pytest>=7.0", "pytest-asyncio>=0.23"]

[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"

[tool.setuptools.packages.find]
where = ["src"]
```

- [ ] **Step 3: Write `.gitignore`**

```gitignore
__pycache__/
*.pyc
.pytest_cache/
*.egg-info/
.venv/
dist/
build/
```

- [ ] **Step 4: Write `README.md`** (one paragraph: what it is, `POST /transcribe`, env vars `STT_PROVIDER_*` / `POLISH_PROVIDER_*` / `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `ELEVENLABS_API_KEY` / `ALLOWED_GITHUB_LOGIN` / `ALLOWED_ORIGIN`, and `pip install -e '.[dev]' && pytest`).

- [ ] **Step 5: Install + commit**

```bash
cd /home/kamil-rybacki/Code/stt-polish-svc
python3 -m venv .venv && .venv/bin/pip install -q -e '.[dev]'
git add -A && git commit -q -m "chore: scaffold stt-polish-svc"
```

---

### Task 1: Vendor the backends module (config + STT + polish)

Port from `kamilrybacki.github.io/scripts/transcribe_audio.py` the pure transcription/polish logic (NOT file IO, slugify, build_markdown, or main()). Reference that file for the exact function bodies; they are reproduced below.

**Files:**
- Create: `src/stt_polish/backends.py`
- Test: `tests/test_backends.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_backends.py
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

import pytest
from stt_polish import backends as b


def test_load_config_defaults(monkeypatch):
    for k in list(__import__("os").environ):
        if k.split("_")[0] in ("STT", "POLISH", "OPENAI", "ELEVENLABS", "ANTHROPIC"):
            monkeypatch.delenv(k, raising=False)
    monkeypatch.setenv("OPENAI_API_KEY", "sk-x")
    stt = b.load_stt_config()
    assert (stt.schema, stt.model, stt.base_url, stt.api_key) == ("openai", "gpt-4o-transcribe", None, "sk-x")
    pol = b.load_polish_config()
    assert (pol.schema, pol.model, pol.api_key) == ("openai", "gpt-4o", "sk-x")


def test_load_config_blank_is_unset(monkeypatch):
    for k in ("STT_PROVIDER_API_SCHEMA", "STT_MODEL", "STT_PROVIDER_BASE_URL", "STT_PROVIDER_API_KEY"):
        monkeypatch.setenv(k, "")
    monkeypatch.setenv("OPENAI_API_KEY", "sk-x")
    stt = b.load_stt_config()
    assert (stt.schema, stt.model, stt.base_url) == ("openai", "gpt-4o-transcribe", None)


def test_invalid_schema_raises(monkeypatch):
    monkeypatch.setenv("STT_PROVIDER_API_SCHEMA", "grpc")
    with pytest.raises(ValueError, match="unknown STT_PROVIDER_API_SCHEMA"):
        b.load_stt_config()


def test_extract_json_tolerates_fences():
    assert b._extract_json('```json\n{"a":1}\n```') == {"a": 1}
    assert b._extract_json('Sure!\n{"a":2}\nDone.') == {"a": 2}


def test_polish_validates_required_fields(monkeypatch):
    monkeypatch.setitem(b.POLISH_BACKENDS, "openai", lambda cfg, t: {"title": "", "body": ""})
    cfg = b.BackendConfig("openai", "m", "k", None)
    with pytest.raises(ValueError, match="missing required"):
        b.polish(cfg, "transcript")
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/kamil-rybacki/Code/stt-polish-svc && .venv/bin/pytest tests/test_backends.py -q`
Expected: FAIL (`No module named 'stt_polish.backends'`).

- [ ] **Step 3: Write `src/stt_polish/backends.py`**

Copy these verbatim from `transcribe_audio.py` (they are unchanged): `POLISH_SYSTEM_PROMPT`, `DEFAULT_STT_MODEL`, `DEFAULT_POLISH_MODEL`, `DEFAULT_KEY_ENV`, `BackendConfig`, `_env`, `_load_config`, `load_stt_config`, `load_polish_config`, `_with_retry`, `_join_parts`, `_stt_openai`, `_stt_elevenlabs`, `STT_BACKENDS`, `transcribe`, `_extract_json`, `_polish_openai`, `_polish_anthropic`, `POLISH_BACKENDS`, `polish`. Module header:

```python
"""STT + LLM-polish backends, vendored from kamilrybacki.github.io
scripts/transcribe_audio.py. Keep the polish prompt in sync with that file.
Pure logic only: no file IO, no front-matter assembly (the CMS owns that)."""
from __future__ import annotations
import json, os, re, time
from dataclasses import dataclass

API_RETRY_ATTEMPTS = 3
API_RETRY_BACKOFF_SECONDS = 2

def log(msg: str) -> None:
    print(msg, flush=True)
# ... (paste the listed symbols here, unchanged) ...
```

Constraint: do NOT copy `compress_audio`/`split_audio`/`prepare_chunks` here (Task 2), and do NOT copy `slugify`/`yaml_quote`/`build_markdown`/`discover_audio`/`process_file`/`main`.

- [ ] **Step 4: Run test to verify it passes**

Run: `.venv/bin/pytest tests/test_backends.py -q`
Expected: PASS (5 passed).

- [ ] **Step 5: Commit**

```bash
git add src/stt_polish/backends.py tests/test_backends.py
git commit -q -m "feat: vendor STT + polish backends"
```

---

### Task 2: Audio prep module (ffmpeg)

**Files:**
- Create: `src/stt_polish/audio.py`
- Test: `tests/test_audio.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_audio.py
import sys, shutil
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))
import pytest
from stt_polish import audio as a

HAVE_FFMPEG = shutil.which("ffmpeg") is not None

def test_audio_extensions_known():
    assert ".mp3" in a.AUDIO_EXTENSIONS and ".m4a" in a.AUDIO_EXTENSIONS

@pytest.mark.skipif(not HAVE_FFMPEG, reason="ffmpeg not installed")
def test_prepare_chunks_compresses(tmp_path):
    import subprocess
    src = tmp_path / "tone.wav"
    subprocess.run(["ffmpeg","-y","-f","lavfi","-i","sine=frequency=440:duration=1","-ac","1",str(src)],
                   check=True, capture_output=True)
    chunks = a.prepare_chunks(src, tmp_path)
    assert chunks and all(c.exists() for c in chunks)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `.venv/bin/pytest tests/test_audio.py -q`
Expected: FAIL (`No module named 'stt_polish.audio'`).

- [ ] **Step 3: Write `src/stt_polish/audio.py`**

Copy `AUDIO_EXTENSIONS`, `MAX_UPLOAD_BYTES`, `CHUNK_SECONDS`, `_run`, `compress_audio`, `split_audio`, `prepare_chunks` verbatim from `transcribe_audio.py`. Add a `log` import or inline `print`. Header:

```python
"""ffmpeg audio preparation, vendored from transcribe_audio.py."""
from __future__ import annotations
import subprocess
from pathlib import Path

MAX_UPLOAD_BYTES = 24 * 1024 * 1024
CHUNK_SECONDS = 20 * 60
AUDIO_EXTENSIONS = {".mp3",".m4a",".wav",".mp4",".mpeg",".mpga",".webm",".flac",".ogg"}
# ... _run, compress_audio, split_audio, prepare_chunks (unchanged) ...
```

- [ ] **Step 4: Run test to verify it passes**

Run: `.venv/bin/pytest tests/test_audio.py -q`
Expected: PASS (2 passed, or 1 passed + 1 skipped without ffmpeg).

- [ ] **Step 5: Commit**

```bash
git add src/stt_polish/audio.py tests/test_audio.py
git commit -q -m "feat: vendor ffmpeg audio prep"
```

---

### Task 3: GitHub-token auth

**Files:**
- Create: `src/stt_polish/auth.py`
- Test: `tests/test_auth.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_auth.py
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))
import pytest
from stt_polish import auth

class FakeResp:
    def __init__(self, status, login=None):
        self.status_code = status
        self._login = login
    def json(self):
        return {"login": self._login} if self._login else {}

def test_missing_token_rejected(monkeypatch):
    monkeypatch.setenv("ALLOWED_GITHUB_LOGIN", "kamilrybacki")
    assert auth.verify_token("", lambda t: FakeResp(401)) is False

def test_wrong_login_rejected(monkeypatch):
    monkeypatch.setenv("ALLOWED_GITHUB_LOGIN", "kamilrybacki")
    assert auth.verify_token("tok", lambda t: FakeResp(200, "someone_else")) is False

def test_allowed_login_accepted(monkeypatch):
    monkeypatch.setenv("ALLOWED_GITHUB_LOGIN", "kamilrybacki")
    assert auth.verify_token("tok", lambda t: FakeResp(200, "kamilrybacki")) is True

def test_case_insensitive(monkeypatch):
    monkeypatch.setenv("ALLOWED_GITHUB_LOGIN", "KamilRybacki")
    assert auth.verify_token("tok", lambda t: FakeResp(200, "kamilrybacki")) is True

def test_no_allowlist_configured_denies(monkeypatch):
    monkeypatch.delenv("ALLOWED_GITHUB_LOGIN", raising=False)
    assert auth.verify_token("tok", lambda t: FakeResp(200, "kamilrybacki")) is False
```

- [ ] **Step 2: Run test to verify it fails**

Run: `.venv/bin/pytest tests/test_auth.py -q`
Expected: FAIL (`No module named 'stt_polish.auth'`).

- [ ] **Step 3: Write `src/stt_polish/auth.py`**

```python
"""Verify a GitHub OAuth token belongs to the allowlisted login.
Default fetcher hits GET https://api.github.com/user; injectable for tests."""
from __future__ import annotations
import os
import requests

def _default_fetch(token: str):
    return requests.get(
        "https://api.github.com/user",
        headers={"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json"},
        timeout=10,
    )

def verify_token(token: str, fetch=_default_fetch) -> bool:
    allowed = (os.environ.get("ALLOWED_GITHUB_LOGIN") or "").strip().lower()
    if not allowed or not (token or "").strip():
        return False
    try:
        resp = fetch(token)
    except Exception:
        return False
    if resp.status_code != 200:
        return False
    login = (resp.json().get("login") or "").strip().lower()
    return bool(login) and login == allowed
```

- [ ] **Step 4: Run test to verify it passes**

Run: `.venv/bin/pytest tests/test_auth.py -q`
Expected: PASS (5 passed).

- [ ] **Step 5: Commit**

```bash
git add src/stt_polish/auth.py tests/test_auth.py
git commit -q -m "feat: GitHub-token auth (allowlisted login)"
```

---

### Task 4: FastAPI app + /transcribe endpoint

**Files:**
- Create: `src/stt_polish/main.py`
- Test: `tests/test_api.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_api.py
import sys, io
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))
import pytest
from fastapi.testclient import TestClient

@pytest.fixture
def client(monkeypatch):
    monkeypatch.setenv("ALLOWED_GITHUB_LOGIN", "kamilrybacki")
    monkeypatch.setenv("OPENAI_API_KEY", "sk-x")
    from stt_polish import main, auth, backends, audio
    # auth fake: token "good" passes, everything else fails
    monkeypatch.setattr(main, "verify_token", lambda tok, **kw: tok == "good")
    # backend fakes: no ffmpeg, no network
    monkeypatch.setattr(main, "prepare_chunks", lambda src, wd: [src])
    monkeypatch.setattr(backends, "transcribe", lambda cfg, files: "um hello world")
    monkeypatch.setattr(backends, "polish", lambda cfg, t: {
        "title": "Hello", "description": "d", "category": "CI", "tags": ["x"], "body": "## Hi\n\nyo"})
    return TestClient(main.app)

def test_healthz(client):
    assert client.get("/healthz").json() == {"status": "ok"}

def test_readyz(client):
    assert client.get("/readyz").status_code == 200

def test_transcribe_requires_auth(client):
    r = client.post("/transcribe", files={"audio": ("a.mp3", b"x", "audio/mpeg")})
    assert r.status_code == 401

def test_transcribe_rejects_bad_token(client):
    r = client.post("/transcribe", headers={"Authorization": "Bearer nope"},
                    files={"audio": ("a.mp3", b"x", "audio/mpeg")})
    assert r.status_code == 403

def test_transcribe_rejects_bad_extension(client):
    r = client.post("/transcribe", headers={"Authorization": "Bearer good"},
                    files={"audio": ("a.txt", b"x", "text/plain")})
    assert r.status_code == 415

def test_transcribe_happy_path(client):
    r = client.post("/transcribe", headers={"Authorization": "Bearer good"},
                    files={"audio": ("a.mp3", b"x" * 32, "audio/mpeg")})
    assert r.status_code == 200
    body = r.json()
    assert body["title"] == "Hello" and body["tags"] == ["x"] and "Hi" in body["body"]

def test_transcribe_rejects_oversize(client):
    big = b"x" * (25 * 1024 * 1024 + 1)
    r = client.post("/transcribe", headers={"Authorization": "Bearer good"},
                    files={"audio": ("a.mp3", big, "audio/mpeg")})
    assert r.status_code == 413
```

- [ ] **Step 2: Run test to verify it fails**

Run: `.venv/bin/pytest tests/test_api.py -q`
Expected: FAIL (`No module named 'stt_polish.main'`).

- [ ] **Step 3: Write `src/stt_polish/main.py`**

```python
"""FastAPI app: POST /transcribe (audio -> article dict), plus health probes.
Audio is held only in a per-request temp dir and deleted afterward."""
from __future__ import annotations
import os, tempfile
from pathlib import Path

from fastapi import FastAPI, File, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .auth import verify_token
from .audio import AUDIO_EXTENSIONS, MAX_UPLOAD_BYTES, prepare_chunks
from . import backends
from .backends import load_stt_config, load_polish_config
# NOTE: call backends.transcribe(...) / backends.polish(...) via the module
# (not bound names) so tests can monkeypatch backends.transcribe/backends.polish.

app = FastAPI(title="stt-polish-svc")

_origin = (os.environ.get("ALLOWED_ORIGIN") or "https://kamilrybacki.github.io").strip()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[_origin],
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
    max_age=600,
)

@app.get("/healthz")
def healthz():
    return {"status": "ok"}

@app.get("/readyz")
def readyz():
    # Ready only if at least one provider key is resolvable for each stage.
    try:
        stt, pol = load_stt_config(), load_polish_config()
    except ValueError as exc:
        return JSONResponse({"status": "misconfigured", "detail": str(exc)}, status_code=503)
    if not stt.api_key or not pol.api_key:
        return JSONResponse({"status": "no-keys"}, status_code=503)
    return {"status": "ready"}

def _bearer(authorization: str | None) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="missing bearer token")
    return authorization.split(" ", 1)[1].strip()

@app.post("/transcribe")
async def transcribe_endpoint(
    audio: UploadFile = File(...),
    authorization: str | None = Header(default=None),
):
    token = _bearer(authorization)
    if not verify_token(token):
        raise HTTPException(status_code=403, detail="not authorized")

    suffix = Path(audio.filename or "").suffix.lower()
    if suffix not in AUDIO_EXTENSIONS:
        raise HTTPException(status_code=415, detail=f"unsupported audio type '{suffix}'")

    data = await audio.read()
    if len(data) > MAX_UPLOAD_BYTES + 1024 * 1024:  # allow a little slack over the chunk target
        raise HTTPException(status_code=413, detail="audio too large")

    try:
        stt_cfg, polish_cfg = load_stt_config(), load_polish_config()
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    if not stt_cfg.api_key or not polish_cfg.api_key:
        raise HTTPException(status_code=500, detail="provider key not configured")

    with tempfile.TemporaryDirectory() as tmp:
        workdir = Path(tmp)
        src = workdir / f"upload{suffix}"
        src.write_bytes(data)
        try:
            chunks = prepare_chunks(src, workdir)
            transcript = backends.transcribe(stt_cfg, chunks)
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"transcription failed: {exc}")
        if not transcript.strip():
            raise HTTPException(status_code=502, detail="transcription produced no text")
        try:
            meta = backends.polish(polish_cfg, transcript)
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"polish failed: {exc}")

    return {
        "title": str(meta.get("title", "")).strip(),
        "description": str(meta.get("description", "")).strip(),
        "category": str(meta.get("category", "")).strip(),
        "tags": [str(t).strip() for t in (meta.get("tags") or []) if str(t).strip()],
        "body": str(meta.get("body", "")).strip(),
    }
```

Note: `main.prepare_chunks`, `main.transcribe`, `main.polish`, `main.verify_token` are module-level names so the tests can monkeypatch them. The oversize test sends 25 MB+ → 413 (slack is 1 MB over `MAX_UPLOAD_BYTES`=24 MB → 25 MB threshold).

- [ ] **Step 4: Run test to verify it passes**

Run: `.venv/bin/pytest tests/test_api.py -q`
Expected: PASS (7 passed). Then run the whole suite: `.venv/bin/pytest -q` → all green.

- [ ] **Step 5: Commit**

```bash
git add src/stt_polish/main.py tests/test_api.py
git commit -q -m "feat: /transcribe endpoint + health probes + CORS"
```

---

### Task 5: Dockerfile + GHCR build workflow

**Files:**
- Create: `Dockerfile`
- Create: `.github/workflows/build-image.yml`

- [ ] **Step 1: Write `Dockerfile`**

```dockerfile
FROM python:3.12-slim AS builder
WORKDIR /app
COPY pyproject.toml .
COPY src/ src/
RUN pip install --no-cache-dir .

FROM python:3.12-slim
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*
RUN useradd -r -u 1000 -d /app stt
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin/uvicorn /usr/local/bin/uvicorn
COPY --from=builder /app/src/ src/
USER stt
EXPOSE 8000
CMD ["uvicorn", "stt_polish.main:app", "--host", "0.0.0.0", "--port", "8000", "--app-dir", "src"]
```

- [ ] **Step 2: Verify the image builds and serves (if docker available)**

```bash
docker build -t stt-polish-svc:test . && \
docker run --rm -e ALLOWED_GITHUB_LOGIN=x -p 8000:8000 -d --name sttt stt-polish-svc:test && \
sleep 3 && curl -fsS localhost:8000/healthz && docker rm -f sttt
```
Expected: `{"status":"ok"}`. (If docker is unavailable, skip and note it.)

- [ ] **Step 3: Write `.github/workflows/build-image.yml`**

```yaml
name: Build + push to GHCR
on:
  push:
    branches: [main]
    paths-ignore: ['**.md', 'docs/**']
  workflow_dispatch:
env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository_owner }}/stt-polish-svc
jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions: { contents: read, packages: write }
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=sha,prefix=sha-
            type=raw,value=latest,enable={{is_default_branch}}
      - uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          provenance: false
```

- [ ] **Step 4: Commit**

```bash
git add Dockerfile .github/workflows/build-image.yml
git commit -q -m "build: Dockerfile + GHCR build workflow"
```

---

### Task 6: Final verification

- [ ] **Step 1: Full suite green**

Run: `cd /home/kamil-rybacki/Code/stt-polish-svc && .venv/bin/pytest -q`
Expected: all pass (skips allowed only for ffmpeg-dependent test when ffmpeg is absent).

- [ ] **Step 2: Push (gated — requires the GitHub repo to exist)**

The repo `github.com/kamilandrzejrybacki-inc/stt-polish-svc` must exist (created in the deploy plan, Task A). Then:
```bash
git remote add origin https://github.com/kamilandrzejrybacki-inc/stt-polish-svc.git
git branch -M main && git push -u origin main
```
This triggers the GHCR build. **Do not push until the repo exists.**

---

## Self-Review notes
- Spec coverage: service endpoint, auth, audio handling, no-audio-persistence, error codes, CORS, tests — all have tasks. ✓
- The polish prompt + backend logic are vendored (intentional duplication, noted in spec). Keep `backends.py` `POLISH_SYSTEM_PROMPT` identical to the github.io script.
- Type/name consistency: `verify_token`, `prepare_chunks`, `transcribe`, `polish` referenced in `main` match the modules. Tests monkeypatch them at `main.*` and `backends.*` — `main` imports `transcribe`/`polish` by name AND keeps `backends` imported, so patch `backends.transcribe`/`backends.polish` won't affect the names bound in `main`. FIX: in `main.py` call `backends.transcribe(...)`/`backends.polish(...)` via the module, not the bound names — see Task 4 Step 3 imports both; change the two call sites to `backends.transcribe`/`backends.polish` and drop the `from .backends import transcribe, polish` line so the tests' `monkeypatch.setattr(backends, ...)` takes effect.
