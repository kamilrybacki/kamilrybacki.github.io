# stt-polish-svc — synthesis service Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the service into `/transcribe` (raw transcript per note) and `/synthesize` (fuse many transcripts + style-match to recent articles → one draft article).

**Architecture:** Reuse the existing `backends`/`audio`/`auth` modules. `/transcribe` drops the polish step and returns raw text. `/synthesize` accepts a JSON list of transcripts, fetches the author's recent non-draft articles via the caller's GitHub token as a style reference, and runs a new synthesis+stylization prompt.

**Tech Stack:** Python 3.12, FastAPI, pytest. Repo: `/home/kamil-rybacki/Code/stt-polish-svc`. Existing tests in `tests/`.

**Working dir:** `/home/kamil-rybacki/Code/stt-polish-svc` (use `.venv/bin/pytest`).

---

### Task 1: Synthesis backend (prompt + multi-note fn)

**Files:**
- Modify: `src/stt_polish/backends.py`
- Test: `tests/test_synthesize.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_synthesize.py
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))
import pytest
from stt_polish import backends as b

def test_build_synthesis_input_includes_notes_and_style():
    msg = b.build_synthesis_input(
        notes=["first note text", "second note text"],
        style_samples=["a past article body"],
    )
    assert "first note text" in msg and "second note text" in msg
    assert "a past article body" in msg
    # notes are clearly delimited/numbered
    assert "1" in msg and "2" in msg

def test_build_synthesis_input_no_style():
    msg = b.build_synthesis_input(notes=["only note"], style_samples=[])
    assert "only note" in msg

def test_synthesize_validates_required_fields(monkeypatch):
    monkeypatch.setitem(b.SYNTHESIZE_BACKENDS, "openai", lambda cfg, txt: {"title": "", "body": ""})
    cfg = b.BackendConfig("openai", "m", "k", None)
    with pytest.raises(ValueError, match="missing required"):
        b.synthesize(cfg, ["n1"], [])

def test_synthesize_returns_shape(monkeypatch):
    monkeypatch.setitem(b.SYNTHESIZE_BACKENDS, "openai",
                        lambda cfg, txt: {"title": "T", "description": "d", "category": "CI",
                                          "tags": ["x"], "body": "## H\n\nbody"})
    cfg = b.BackendConfig("openai", "m", "k", None)
    out = b.synthesize(cfg, ["n1", "n2"], ["style"])
    assert out["title"] == "T" and out["body"].startswith("## H")
```

- [ ] **Step 2: Run test to verify it fails**

Run: `.venv/bin/pytest tests/test_synthesize.py -q`
Expected: FAIL (`build_synthesis_input`/`SYNTHESIZE_BACKENDS`/`synthesize` undefined).

- [ ] **Step 3: Implement in `backends.py`**

After the existing `POLISH_SYSTEM_PROMPT` block, add the synthesis prompt:

```python
SYNTH_SYSTEM_PROMPT = """\
You are an editor for a personal software-engineering blog. You receive several raw,
machine-generated transcripts of the author speaking SEPARATE notes that are all
intended as material for ONE article. Transcripts are messy: no punctuation, run-on
sentences, filler ("um", "you know", "like"), false starts and repetition.

Synthesize the notes into a SINGLE coherent blog article in GitHub-flavoured Markdown:
  - Treat the notes as raw material. MERGE overlapping ideas, DROP repetition, and
    REORGANISE freely into the clearest structure — do not just concatenate them.
  - Preserve the author's spoken VOICE: their idioms, phrasing and rhythm as heard in
    the transcripts. Do NOT flatten into generic blog-speak. Remove only filler/false
    starts and fix grammar/punctuation.
  - If STYLE SAMPLES (the author's past articles) are provided, match their written
    tone, structure and formatting conventions.
  - Do NOT invent facts, code, citations or details that were not spoken.
  - Use `##`/`###` headings where topics shift. No top-level `#` (title is front-matter).
  - Keep code verbatim in ```fenced``` blocks when dictated.

Respond with a single JSON object, no prose around it, with keys:
  "title": string  - concise, specific (no surrounding quotes).
  "description": string  - one-sentence meta description.
  "category": string  - one short category, e.g. "Python", "Rust", "CI", "Web".
  "tags": string[]  - 0-5 lowercase topical tags (may be empty).
  "body": string  - full article body in Markdown (no front-matter).
"""

def build_synthesis_input(notes: list[str], style_samples: list[str]) -> str:
    """Assemble the user message: numbered notes + optional style samples."""
    parts = ["# NOTES (raw spoken material for one article)\n"]
    for i, n in enumerate(notes, 1):
        parts.append(f"## Note {i}\n{n.strip()}\n")
    if style_samples:
        parts.append("\n# STYLE SAMPLES (the author's past articles — match this written voice)\n")
        for i, s in enumerate(style_samples, 1):
            parts.append(f"## Sample {i}\n{s.strip()}\n")
    return "\n".join(parts)
```

Then add synthesis backends mirroring the polish ones but using `SYNTH_SYSTEM_PROMPT` and a pre-built user message. Add after `POLISH_BACKENDS`:

```python
def _synthesize_openai(cfg: BackendConfig, user_msg: str) -> dict:
    try:
        from openai import OpenAI
    except ImportError:
        raise RuntimeError("the 'openai' package is required for the openai schema")
    client = OpenAI(api_key=cfg.api_key, base_url=cfg.base_url)
    messages = [
        {"role": "system", "content": SYNTH_SYSTEM_PROMPT},
        {"role": "user", "content": user_msg},
    ]
    def _call():
        try:
            return client.chat.completions.create(
                model=cfg.model, messages=messages, response_format={"type": "json_object"})
        except Exception:
            return client.chat.completions.create(model=cfg.model, messages=messages)
    response = _with_retry("openai synthesize", _call)
    return _extract_json(response.choices[0].message.content)

def _synthesize_anthropic(cfg: BackendConfig, user_msg: str) -> dict:
    try:
        import anthropic
    except ImportError:
        raise RuntimeError("the 'anthropic' package is required for the anthropic schema")
    client = anthropic.Anthropic(api_key=cfg.api_key, base_url=cfg.base_url)
    message = _with_retry("anthropic synthesize", lambda: client.messages.create(
        model=cfg.model, max_tokens=8192,
        system=SYNTH_SYSTEM_PROMPT + "\n\nReturn ONLY the JSON object.",
        messages=[{"role": "user", "content": user_msg}]))
    text = "".join(block.text for block in message.content if block.type == "text")
    return _extract_json(text)

SYNTHESIZE_BACKENDS = {"openai": _synthesize_openai, "anthropic": _synthesize_anthropic}

def synthesize(cfg: BackendConfig, notes: list[str], style_samples: list[str]) -> dict:
    log(f"  synthesizing {len(notes)} note(s) with {cfg.schema}:{cfg.model}, "
        f"{len(style_samples)} style sample(s)")
    user_msg = build_synthesis_input(notes, style_samples)
    data = SYNTHESIZE_BACKENDS[cfg.schema](cfg, user_msg)
    if not data.get("body") or not data.get("title"):
        raise ValueError("model response missing required 'title'/'body' fields")
    return data
```

- [ ] **Step 4: Run test to verify it passes**

Run: `.venv/bin/pytest tests/test_synthesize.py -q`
Expected: PASS (4 passed).

- [ ] **Step 5: Commit**

```bash
git add src/stt_polish/backends.py tests/test_synthesize.py
git commit -q -m "feat: synthesis backend (multi-note fuse + stylize prompt)"
```

---

### Task 2: Style-sample fetch (recent non-draft articles via GitHub token)

**Files:**
- Create: `src/stt_polish/github_articles.py`
- Test: `tests/test_github_articles.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_github_articles.py
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))
from stt_polish import github_articles as ga

DRAFT = "---\ntitle: x\ndraft: true\n---\n\ndraft body"
PUB1 = "---\ntitle: a\ndraft: false\n---\n\npublished body one"
PUB2 = "---\ntitle: b\n---\n\npublished body two"  # no draft key => published

def fake_fetch(token, count=3, char_cap=4000):
    # simulate: returns list of raw file contents (newest first)
    return [PUB1, PUB2, DRAFT]

def test_strip_front_matter():
    assert ga._strip_front_matter(PUB1).strip() == "published body one"
    assert ga._strip_front_matter("no front matter").strip() == "no front matter"

def test_is_draft():
    assert ga._is_draft(DRAFT) is True
    assert ga._is_draft(PUB1) is False
    assert ga._is_draft(PUB2) is False

def test_select_style_samples_excludes_drafts_and_caps():
    samples = ga.select_style_samples([PUB1, PUB2, DRAFT], count=3, char_cap=8)
    assert all("draft body" not in s for s in samples)         # drafts excluded
    assert len(samples) == 2                                    # only the 2 published
    assert all(len(s) <= 8 for s in samples)                    # truncated to cap
```

- [ ] **Step 2: Run test to verify it fails**

Run: `.venv/bin/pytest tests/test_github_articles.py -q`
Expected: FAIL (`No module named 'stt_polish.github_articles'`).

- [ ] **Step 3: Implement `src/stt_polish/github_articles.py`**

```python
"""Fetch the author's recent non-draft articles as synthesis style samples.
Uses the caller's GitHub token (already verified for auth) so it works for the
public repo without separate creds and respects rate limits. Best-effort: callers
should treat any failure as 'no samples'."""
from __future__ import annotations
import os
import re
import requests

GITHUB_API = "https://api.github.com"

def _repo() -> str:
    return os.environ.get("STYLE_REPO", "kamilrybacki/kamilrybacki.github.io")

def _articles_path() -> str:
    return os.environ.get("STYLE_ARTICLES_PATH", "src/content/articles")

def _strip_front_matter(text: str) -> str:
    m = re.match(r"^---\n.*?\n---\n", text, flags=re.DOTALL)
    return text[m.end():] if m else text

def _is_draft(text: str) -> bool:
    m = re.match(r"^---\n(.*?)\n---\n", text, flags=re.DOTALL)
    if not m:
        return False
    return re.search(r"^draft:\s*true\s*$", m.group(1), flags=re.MULTILINE) is not None

def select_style_samples(contents: list[str], count: int, char_cap: int) -> list[str]:
    out = []
    for raw in contents:
        if _is_draft(raw):
            continue
        body = _strip_front_matter(raw).strip()
        if body:
            out.append(body[:char_cap])
        if len(out) >= count:
            break
    return out

def _gh(url: str, token: str):
    return requests.get(url, headers={
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.raw+json",
    }, timeout=15)

def fetch_style_samples(token: str, count: int = 3, char_cap: int = 4000) -> list[str]:
    """Return up to `count` recent non-draft article bodies. [] on any failure."""
    try:
        listing = requests.get(
            f"{GITHUB_API}/repos/{_repo()}/contents/{_articles_path()}",
            headers={"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json"},
            timeout=15)
        if listing.status_code != 200:
            return []
        files = [f for f in listing.json()
                 if isinstance(f, dict) and f.get("name", "").endswith(".md")]
        # newest-ish: GitHub returns alphabetical; take the last N by name as a cheap proxy
        files = sorted(files, key=lambda f: f.get("name", ""))[-(count * 2):][::-1]
        contents = []
        for f in files:
            r = _gh(f["download_url"], token) if f.get("download_url") else None
            if r is not None and r.status_code == 200:
                contents.append(r.text)
        return select_style_samples(contents, count, char_cap)
    except Exception:
        return []
```

- [ ] **Step 4: Run test to verify it passes**

Run: `.venv/bin/pytest tests/test_github_articles.py -q`
Expected: PASS (3 passed).

- [ ] **Step 5: Commit**

```bash
git add src/stt_polish/github_articles.py tests/test_github_articles.py
git commit -q -m "feat: fetch recent non-draft articles as style samples"
```

---

### Task 3: `/transcribe` → raw transcript; add `/synthesize`

**Files:**
- Modify: `src/stt_polish/main.py`
- Test: `tests/test_api.py` (extend)

- [ ] **Step 1: Write the failing tests** (append to `tests/test_api.py`)

```python
def test_transcribe_returns_raw_transcript(client):
    r = client.post("/transcribe", headers={"Authorization": "Bearer good"},
                    files={"audio": ("a.mp3", b"x" * 32, "audio/mpeg")})
    assert r.status_code == 200
    body = r.json()
    assert body == {"transcript": "um hello world"}   # from the fixture's faked transcribe

def test_synthesize_requires_auth(client):
    r = client.post("/synthesize", json={"notes": ["a"]})
    assert r.status_code == 401

def test_synthesize_happy_path(client, monkeypatch):
    from stt_polish import main, backends, github_articles
    monkeypatch.setattr(github_articles, "fetch_style_samples", lambda token, **k: ["past"])
    monkeypatch.setattr(backends, "synthesize",
                        lambda cfg, notes, style: {"title": "Fused", "description": "d",
                                                   "category": "CI", "tags": ["x"],
                                                   "body": "## H\n\nbody", "_notes": notes,
                                                   "_style": style})
    r = client.post("/synthesize", headers={"Authorization": "Bearer good"},
                    json={"notes": ["n1", "n2"]})
    assert r.status_code == 200
    b = r.json()
    assert b["title"] == "Fused" and b["tags"] == ["x"]

def test_synthesize_rejects_empty_notes(client):
    r = client.post("/synthesize", headers={"Authorization": "Bearer good"}, json={"notes": []})
    assert r.status_code == 422

def test_synthesize_rejects_too_many_notes(client):
    from stt_polish import main
    notes = ["n"] * (main.MAX_NOTES + 1)
    r = client.post("/synthesize", headers={"Authorization": "Bearer good"}, json={"notes": notes})
    assert r.status_code == 413
```

Note: the existing `test_transcribe_happy_path` asserts `body["title"]` — **update it** to expect `{"transcript": ...}` (it now returns raw). Change that assertion to:
```python
    assert r.status_code == 200
    assert r.json() == {"transcript": "um hello world"}
```
And the fixture's faked `backends.polish` is no longer used by `/transcribe`; leave it (harmless) or remove. Keep `backends.transcribe` fake returning `"um hello world"`.

- [ ] **Step 2: Run to verify failures**

Run: `.venv/bin/pytest tests/test_api.py -q`
Expected: FAIL (no `/synthesize`; `/transcribe` still returns polished dict).

- [ ] **Step 3: Edit `main.py`**

(a) Replace `_process` so it returns the raw transcript (drop polish):

```python
def _process(data: bytes, suffix: str, stt_cfg) -> str:
    """Blocking transcription. Returns raw transcript. Audio lives only in tmp."""
    with tempfile.TemporaryDirectory() as tmp:
        workdir = Path(tmp)
        src = workdir / f"upload{suffix}"
        src.write_bytes(data)
        try:
            chunks = prepare_chunks(src, workdir)
        except Exception as exc:
            logger.error("audio prep failed: %s", exc)
            raise HTTPException(status_code=502, detail="audio preparation failed")
        if len(chunks) > MAX_CHUNKS:
            raise HTTPException(status_code=413,
                                detail=f"audio too long (>{MAX_CHUNKS * 20} minutes after compression)")
        try:
            transcript = backends.transcribe(stt_cfg, chunks)
        except Exception as exc:
            logger.error("transcription failed: %s", exc)
            raise HTTPException(status_code=502, detail="transcription failed")
    if not transcript.strip():
        raise HTTPException(status_code=502, detail="transcription produced no text")
    return transcript
```

(b) Change the `/transcribe` handler tail (it currently loads `polish_cfg`, calls `_process(... )` and returns a dict). Make it load only the STT config and return raw text:

```python
    try:
        stt_cfg = load_stt_config()
    except ValueError as exc:
        logger.error("config error: %s", exc)
        raise HTTPException(status_code=500, detail="service misconfigured")
    if not stt_cfg.api_key:
        raise HTTPException(status_code=500, detail="service misconfigured")

    transcript = await run_in_threadpool(_process, data, suffix, stt_cfg)
    return {"transcript": transcript}
```

(Remove the old `polish_cfg` load and the dict-with-title return from `/transcribe`.)

(c) Add the cap constant near `MAX_CHUNKS`:

```python
MAX_NOTES = 20
SYNTH_TOTAL_CHAR_CAP = 200_000
```

(d) Add imports at top: `from pydantic import BaseModel`, `from . import github_articles`, and `from .backends import load_polish_config` (keep — synthesize uses the polish/synthesis model config).

(e) Add the `/synthesize` endpoint:

```python
class SynthesizeRequest(BaseModel):
    notes: list[str]

@app.post("/synthesize")
async def synthesize_endpoint(
    body: SynthesizeRequest,
    authorization: str | None = Header(default=None),
):
    token = _bearer(authorization)
    if not verify_token(token):
        raise HTTPException(status_code=403, detail="not authorized")

    notes = [n for n in (body.notes or []) if n and n.strip()]
    if not notes:
        raise HTTPException(status_code=422, detail="no notes provided")
    if len(notes) > MAX_NOTES:
        raise HTTPException(status_code=413, detail=f"too many notes (max {MAX_NOTES})")
    if sum(len(n) for n in notes) > SYNTH_TOTAL_CHAR_CAP:
        raise HTTPException(status_code=413, detail="notes too large")

    try:
        synth_cfg = load_polish_config()
    except ValueError as exc:
        logger.error("config error: %s", exc)
        raise HTTPException(status_code=500, detail="service misconfigured")
    if not synth_cfg.api_key:
        raise HTTPException(status_code=500, detail="service misconfigured")

    style = await run_in_threadpool(github_articles.fetch_style_samples, token)  # best-effort, [] on fail
    try:
        meta = await run_in_threadpool(backends.synthesize, synth_cfg, notes, style)
    except Exception as exc:
        logger.error("synthesis failed: %s", exc)
        raise HTTPException(status_code=502, detail="synthesis failed")

    return {
        "title": str(meta.get("title", "")).strip(),
        "description": str(meta.get("description", "")).strip(),
        "category": str(meta.get("category", "")).strip(),
        "tags": [str(t).strip() for t in (meta.get("tags") or []) if str(t).strip()],
        "body": str(meta.get("body", "")).strip(),
    }
```

- [ ] **Step 4: Run the full suite**

Run: `.venv/bin/pytest -q`
Expected: all pass (update any leftover `/transcribe` polish assertions per Step 1).

- [ ] **Step 5: Commit**

```bash
git add src/stt_polish/main.py tests/test_api.py
git commit -q -m "feat: /transcribe raw + /synthesize endpoint (style-aware)"
```

---

### Task 4: README + final verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1:** Update `README.md` endpoint docs: `/transcribe` → `{transcript}`; `/synthesize` (`{notes:[...]}` Bearer) → article, fetches style via `STYLE_REPO`/`STYLE_ARTICLES_PATH` env (defaults `kamilrybacki/kamilrybacki.github.io`, `src/content/articles`).
- [ ] **Step 2:** `.venv/bin/pytest -q` → all green.
- [ ] **Step 3 (docker, if available):** `docker build -t stt-polish-svc:test . && docker run --rm -e ALLOWED_GITHUB_LOGIN=x -p 8000:8000 -d --name s stt-polish-svc:test && sleep 3 && curl -fsS localhost:8000/healthz && docker rm -f s`
- [ ] **Step 4: Commit** `git add README.md && git commit -q -m "docs: README for transcribe/synthesize split"`.

**Deploy is OUT OF SCOPE here** (gated). Pushing this triggers the live image build + ArgoCD; do it only at the deploy step, AND note `/transcribe` contract changed (the old Decap widget that called it is being removed in the studio plan, so deploy the service AFTER or with the widget removal).

---

## Self-Review
- Spec coverage: `/transcribe` raw ✓ (Task 3), `/synthesize` + notes ✓ (Task 3), synthesis+voice+style prompt ✓ (Task 1), style fetch via token, non-draft, capped ✓ (Task 2), MAX_NOTES/char caps ✓ (Task 3), front-matter-safe output shaping ✓ (Task 3 return strips). Auth unchanged ✓.
- Names consistent: `synthesize(cfg, notes, style_samples)`, `SYNTHESIZE_BACKENDS`, `build_synthesis_input`, `fetch_style_samples`, `select_style_samples`, `MAX_NOTES`, `SynthesizeRequest` — used identically across tasks.
- `load_polish_config()` reused for the synthesis model (DEFAULT_POLISH_MODEL openai→gpt-4o / anthropic→claude-sonnet-4-5) — intentional; synthesis uses the "polish" model slot.
