# Studio workspace store (service + chart) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a per-user, GitHub-login-keyed workspace store (JSON on a PVC) to `stt-polish-svc`, with CRUD endpoints, so the studio can persist multiple "started articles".

**Architecture:** New `workspaces.py` (JSON files under `WORKSPACES_DIR/<login>/<id>.json`, atomic writes, path-sanitized, capped). `auth.resolve_login` returns the allowlisted login. New `/workspaces` endpoints in `main.py`. Helm chart gains a PVC mounted at `/data` + `strategy: Recreate`.

**Tech Stack:** Python 3.12 / FastAPI / pytest. Repos: `/home/kamil-rybacki/Code/stt-polish-svc`, `/home/kamil-rybacki/Code/helm`.

**Working dir:** `/home/kamil-rybacki/Code/stt-polish-svc`, branch `feat/workspaces` (off main). `.venv/bin/pytest`.

---

### Task 0: Branch

- [ ] `cd /home/kamil-rybacki/Code/stt-polish-svc && git checkout main && git pull --ff-only && git checkout -b feat/workspaces`

---

### Task 1: `auth.resolve_login`

**Files:** Modify `src/stt_polish/auth.py`; Test `tests/test_auth.py` (append).

- [ ] **Step 1: failing test** (append to `tests/test_auth.py`)

```python
def test_resolve_login_returns_login_for_allowed(monkeypatch):
    monkeypatch.setenv("ALLOWED_GITHUB_LOGIN", "KamilRybacki")
    assert auth.resolve_login("tok", lambda t: FakeResp(200, "kamilrybacki")) == "kamilrybacki"

def test_resolve_login_none_for_wrong(monkeypatch):
    monkeypatch.setenv("ALLOWED_GITHUB_LOGIN", "kamilrybacki")
    assert auth.resolve_login("tok", lambda t: FakeResp(200, "someone")) is None

def test_resolve_login_none_on_error(monkeypatch):
    monkeypatch.setenv("ALLOWED_GITHUB_LOGIN", "kamilrybacki")
    assert auth.resolve_login("", lambda t: FakeResp(401)) is None

def test_verify_token_still_works(monkeypatch):
    monkeypatch.setenv("ALLOWED_GITHUB_LOGIN", "kamilrybacki")
    assert auth.verify_token("tok", lambda t: FakeResp(200, "kamilrybacki")) is True
    assert auth.verify_token("tok", lambda t: FakeResp(200, "x")) is False
```

- [ ] **Step 2:** `.venv/bin/pytest tests/test_auth.py -q` → FAIL (`resolve_login` undefined).

- [ ] **Step 3:** rewrite `auth.py` to add `resolve_login` and define `verify_token` in terms of it:

```python
def resolve_login(token: str, fetch=_default_fetch) -> str | None:
    """Return the caller's GitHub login IFF it equals the allowlisted login, else None."""
    allowed = (os.environ.get("ALLOWED_GITHUB_LOGIN") or "").strip().lower()
    if not allowed or not (token or "").strip():
        return None
    try:
        resp = fetch(token)
    except Exception:
        return None
    if resp.status_code != 200:
        return None
    try:
        login = (resp.json().get("login") or "").strip().lower()
    except Exception:
        return None
    return login if (login and login == allowed) else None

def verify_token(token: str, fetch=_default_fetch) -> bool:
    return resolve_login(token, fetch) is not None
```

- [ ] **Step 4:** `.venv/bin/pytest tests/test_auth.py -q` → PASS.
- [ ] **Step 5:** `git add -A && git commit -q -m "feat: auth.resolve_login (login for allowlisted token)"`

---

### Task 2: `workspaces.py` store

**Files:** Create `src/stt_polish/workspaces.py`; Test `tests/test_workspaces.py`.

- [ ] **Step 1: failing test**

```python
# tests/test_workspaces.py
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))
import pytest
from stt_polish import workspaces as ws

@pytest.fixture
def store(tmp_path, monkeypatch):
    monkeypatch.setenv("WORKSPACES_DIR", str(tmp_path))
    return tmp_path

NOW = "2026-05-31T00:00:00Z"

def test_create_list_get(store):
    w = ws.create_workspace("kamilrybacki", "My idea", NOW)
    assert w["id"] and w["status"] == "collecting" and w["title"] == "My idea"
    lst = ws.list_workspaces("kamilrybacki")
    assert len(lst) == 1 and lst[0]["title"] == "My idea" and lst[0]["noteCount"] == 0
    full = ws.get_workspace("kamilrybacki", w["id"])
    assert full["id"] == w["id"]

def test_put_updates_notes_and_status(store):
    w = ws.create_workspace("kamilrybacki", "x", NOW)
    upd = ws.put_workspace("kamilrybacki", w["id"],
                           {"notes": [{"id": "1", "name": "n", "transcript": "hi"}],
                            "status": "synthesized", "title": "New"}, "2026-05-31T01:00:00Z")
    assert upd["status"] == "synthesized" and upd["title"] == "New"
    assert ws.list_workspaces("kamilrybacki")[0]["noteCount"] == 1

def test_delete(store):
    w = ws.create_workspace("kamilrybacki", "x", NOW)
    assert ws.delete_workspace("kamilrybacki", w["id"]) is True
    assert ws.get_workspace("kamilrybacki", w["id"]) is None

def test_per_login_isolation(store):
    a = ws.create_workspace("kamilrybacki", "a", NOW)
    ws.create_workspace("intruder", "b", NOW)
    assert ws.get_workspace("intruder", a["id"]) is None        # B can't read A's id
    assert len(ws.list_workspaces("kamilrybacki")) == 1

def test_path_traversal_rejected(store):
    assert ws.get_workspace("kamilrybacki", "../../etc/passwd") is None
    assert ws.delete_workspace("kamilrybacki", "..%2f") is False
    with pytest.raises(ValueError):
        ws.create_workspace("../evil", "x", NOW)

def test_notes_cap(store):
    w = ws.create_workspace("kamilrybacki", "x", NOW)
    notes = [{"id": str(i), "name": "n", "transcript": "t"} for i in range(ws.MAX_NOTES + 1)]
    with pytest.raises(ValueError):
        ws.put_workspace("kamilrybacki", w["id"], {"notes": notes}, NOW)
```

- [ ] **Step 2:** `.venv/bin/pytest tests/test_workspaces.py -q` → FAIL (module missing).

- [ ] **Step 3:** create `src/stt_polish/workspaces.py`

```python
"""Per-user workspace store: JSON files under WORKSPACES_DIR/<login>/<id>.json.
Single-user/low-volume; atomic writes; path-sanitised; capped. No audio stored."""
from __future__ import annotations
import json
import os
import re
import secrets
from pathlib import Path

MAX_WORKSPACES = 200
MAX_NOTES = 50
MAX_DOC_CHARS = 500_000
_SAFE = re.compile(r"^[A-Za-z0-9_-]+$")

def _root() -> Path:
    return Path(os.environ.get("WORKSPACES_DIR", "/data/workspaces"))

def _safe(s: str) -> bool:
    return bool(s) and bool(_SAFE.match(s))

def _login_dir(login: str) -> Path:
    if not _safe(login):
        raise ValueError("invalid login")
    return _root() / login

def _summary(doc: dict) -> dict:
    return {
        "id": doc.get("id"),
        "title": doc.get("title") or "Untitled",
        "status": doc.get("status", "collecting"),
        "noteCount": len(doc.get("notes") or []),
        "updatedAt": doc.get("updatedAt"),
        "createdAt": doc.get("createdAt"),
    }

def _write(path: Path, doc: dict) -> None:
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(json.dumps(doc), encoding="utf-8")
    tmp.replace(path)  # atomic

def list_workspaces(login: str) -> list[dict]:
    d = _login_dir(login)
    if not d.exists():
        return []
    out = []
    for f in d.glob("*.json"):
        try:
            out.append(_summary(json.loads(f.read_text(encoding="utf-8"))))
        except Exception:
            continue
    out.sort(key=lambda s: s.get("updatedAt") or "", reverse=True)
    return out

def create_workspace(login: str, title: str | None, now: str) -> dict:
    d = _login_dir(login)
    d.mkdir(parents=True, exist_ok=True)
    if len(list(d.glob("*.json"))) >= MAX_WORKSPACES:
        raise OverflowError("too many workspaces")
    wid = secrets.token_urlsafe(9)
    doc = {"id": wid, "title": (str(title or "").strip()[:200] or "Untitled"),
           "status": "collecting", "notes": [], "article": None,
           "createdAt": now, "updatedAt": now}
    _write(d / f"{wid}.json", doc)
    return doc

def get_workspace(login: str, wid: str) -> dict | None:
    if not _safe(wid):
        return None
    f = _login_dir(login) / f"{wid}.json"
    if not f.exists():
        return None
    try:
        return json.loads(f.read_text(encoding="utf-8"))
    except Exception:
        return None

def put_workspace(login: str, wid: str, patch: dict, now: str) -> dict | None:
    doc = get_workspace(login, wid)
    if doc is None:
        return None
    if "title" in patch:
        doc["title"] = str(patch["title"] or "").strip()[:200] or "Untitled"
    if "status" in patch and patch["status"] in ("collecting", "synthesized", "committed"):
        doc["status"] = patch["status"]
    if "notes" in patch:
        notes = patch["notes"]
        if not isinstance(notes, list) or len(notes) > MAX_NOTES:
            raise ValueError("invalid notes")
        doc["notes"] = [{"id": str(n.get("id", "")), "name": str(n.get("name", ""))[:300],
                         "transcript": str(n.get("transcript", ""))}
                        for n in notes if isinstance(n, dict)]
    if "article" in patch:
        doc["article"] = patch["article"]
    doc["updatedAt"] = now
    if len(json.dumps(doc)) > MAX_DOC_CHARS:
        raise ValueError("workspace too large")
    _write(_login_dir(login) / f"{wid}.json", doc)
    return doc

def delete_workspace(login: str, wid: str) -> bool:
    if not _safe(wid):
        return False
    f = _login_dir(login) / f"{wid}.json"
    if f.exists():
        f.unlink()
        return True
    return False
```

- [ ] **Step 4:** `.venv/bin/pytest tests/test_workspaces.py -q` → PASS (6).
- [ ] **Step 5:** `git add -A && git commit -q -m "feat: per-user workspace store (json on disk)"`

---

### Task 3: `/workspaces` endpoints

**Files:** Modify `src/stt_polish/main.py`; Test `tests/test_workspaces_api.py`.

- [ ] **Step 1: failing test**

```python
# tests/test_workspaces_api.py
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))
import pytest
from fastapi.testclient import TestClient

@pytest.fixture
def client(monkeypatch, tmp_path):
    monkeypatch.setenv("ALLOWED_GITHUB_LOGIN", "kamilrybacki")
    monkeypatch.setenv("WORKSPACES_DIR", str(tmp_path))
    from stt_polish import main
    monkeypatch.setattr(main, "resolve_login", lambda tok: "kamilrybacki" if tok == "good" else None)
    return TestClient(main.app)

H = {"Authorization": "Bearer good"}

def test_requires_auth(client):
    assert client.get("/workspaces").status_code == 401
    assert client.get("/workspaces", headers={"Authorization": "Bearer bad"}).status_code == 403

def test_crud_flow(client):
    r = client.post("/workspaces", headers=H, json={"title": "Idea"}); assert r.status_code == 200
    wid = r.json()["id"]
    assert client.get("/workspaces", headers=H).json()["workspaces"][0]["title"] == "Idea"
    r = client.put(f"/workspaces/{wid}", headers=H,
                   json={"notes": [{"id": "1", "name": "n", "transcript": "hi"}], "status": "synthesized"})
    assert r.status_code == 200 and r.json()["status"] == "synthesized"
    assert client.get(f"/workspaces/{wid}", headers=H).json()["notes"][0]["transcript"] == "hi"
    assert client.delete(f"/workspaces/{wid}", headers=H).status_code == 200
    assert client.get(f"/workspaces/{wid}", headers=H).status_code == 404

def test_get_missing_404(client):
    assert client.get("/workspaces/nope", headers=H).status_code == 404

def test_put_bad_notes_422(client):
    wid = client.post("/workspaces", headers=H, json={}).json()["id"]
    r = client.put(f"/workspaces/{wid}", headers=H, json={"notes": "not-a-list"})
    assert r.status_code == 422
```

- [ ] **Step 2:** `.venv/bin/pytest tests/test_workspaces_api.py -q` → FAIL (no routes).

- [ ] **Step 3:** edit `main.py`:

(a) imports near the top: `import datetime as dt`, `from . import workspaces`, `from .auth import resolve_login` (keep `verify_token` import).

(b) helper:

```python
def _now() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat()

def _require_login(authorization: str | None) -> str:
    token = _bearer(authorization)            # 401 if no/blank bearer
    login = resolve_login(token)
    if not login:
        raise HTTPException(status_code=403, detail="not authorized")
    return login
```

(c) models + endpoints:

```python
class WorkspaceCreate(BaseModel):
    title: str | None = None

class WorkspacePatch(BaseModel):
    title: str | None = None
    status: str | None = None
    notes: object | None = None     # validated in the store
    article: object | None = None

@app.get("/workspaces")
def list_ws(authorization: str | None = Header(default=None)):
    login = _require_login(authorization)
    return {"workspaces": workspaces.list_workspaces(login)}

@app.post("/workspaces")
def create_ws(body: WorkspaceCreate, authorization: str | None = Header(default=None)):
    login = _require_login(authorization)
    try:
        return workspaces.create_workspace(login, body.title, _now())
    except OverflowError:
        raise HTTPException(status_code=413, detail="too many workspaces")

@app.get("/workspaces/{wid}")
def get_ws(wid: str, authorization: str | None = Header(default=None)):
    login = _require_login(authorization)
    doc = workspaces.get_workspace(login, wid)
    if doc is None:
        raise HTTPException(status_code=404, detail="not found")
    return doc

@app.put("/workspaces/{wid}")
def put_ws(wid: str, body: WorkspacePatch, authorization: str | None = Header(default=None)):
    login = _require_login(authorization)
    patch = {k: v for k, v in body.model_dump().items() if v is not None}
    try:
        doc = workspaces.put_workspace(login, wid, patch, _now())
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    if doc is None:
        raise HTTPException(status_code=404, detail="not found")
    return doc

@app.delete("/workspaces/{wid}")
def delete_ws(wid: str, authorization: str | None = Header(default=None)):
    login = _require_login(authorization)
    return {"ok": workspaces.delete_workspace(login, wid)}
```

Note: `notes`/`article` typed as `object` so FastAPI doesn't coerce; the store validates. `model_dump()` drops unset (None) so a PUT only patches provided fields.

- [ ] **Step 4:** `.venv/bin/pytest -q` → all pass.
- [ ] **Step 5:** `git add -A && git commit -q -m "feat: /workspaces CRUD endpoints (per-login)"`

---

### Task 4: Helm chart — PVC + mount

**Files (in `/home/kamil-rybacki/Code/helm`, branch `feat/stt-workspaces`):**
- Create `charts/stt-polish-svc/templates/pvc.yaml`
- Modify `charts/stt-polish-svc/values.yaml`, `charts/stt-polish-svc/templates/deployment.yaml`

- [ ] **Step 1:** branch: `cd /home/kamil-rybacki/Code/helm && git checkout main && git checkout -b feat/stt-workspaces`

- [ ] **Step 2:** `templates/pvc.yaml`

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: stt-polish-data
  labels: { app: stt-polish-svc }
spec:
  accessModes: ["ReadWriteOnce"]
  storageClassName: {{ .Values.storage.storageClass }}
  resources:
    requests:
      storage: {{ .Values.storage.size }}
```

- [ ] **Step 3:** `values.yaml` — add:

```yaml
storage:
  storageClass: nfs
  size: 256Mi
  mountPath: /data
```

- [ ] **Step 4:** `templates/deployment.yaml` — (a) add `strategy: Recreate` under `spec:` (RWO PVC); (b) add `WORKSPACES_DIR` env; (c) mount the PVC. Specifically:

Under `spec:` (sibling of `replicas`):
```yaml
  strategy:
    type: Recreate
```
In `env:` add:
```yaml
            - name: WORKSPACES_DIR
              value: "{{ .Values.storage.mountPath }}/workspaces"
```
In `volumeMounts:` add (alongside the existing `tmp`):
```yaml
            - { name: data, mountPath: {{ .Values.storage.mountPath }} }
```
In `volumes:` add (alongside `tmp`):
```yaml
        - name: data
          persistentVolumeClaim:
            claimName: stt-polish-data
```

- [ ] **Step 5:** `helm lint charts/stt-polish-svc && helm template t charts/stt-polish-svc | grep -E 'PersistentVolumeClaim|Recreate|WORKSPACES_DIR|claimName'` → all present.
- [ ] **Step 6:** `git add charts/stt-polish-svc && git commit -q -m "feat: PVC + /data mount for stt-polish-svc workspaces"`

---

### Task 5: README + final

- [ ] **Step 1:** `README.md` (service) — document `/workspaces*` endpoints + `WORKSPACES_DIR` env.
- [ ] **Step 2:** `.venv/bin/pytest -q` → all green; `node`-free.
- [ ] **Step 3:** docker build check if available (as in prior plans).
- [ ] **Step 4:** commit. **Deploy OUT OF SCOPE** (gated): push `feat/workspaces`→stt main (build), push `feat/stt-workspaces`→helm main (ArgoCD creates PVC + rolls out, Recreate).

---

## Self-Review
- Spec coverage: store JSON-on-PVC ✓ (T2,T4), per-login key + isolation ✓ (T2 test), CRUD endpoints ✓ (T3), caps/traversal ✓ (T2), auth resolve_login ✓ (T1), PVC + Recreate + WORKSPACES_DIR ✓ (T4). No audio stored ✓ (store has no audio field).
- Names consistent: `resolve_login`, `list_workspaces/create_workspace/get_workspace/put_workspace/delete_workspace`, `MAX_NOTES`, `WORKSPACES_DIR`, claim `stt-polish-data`, mount `/data`.
- `_require_login` uses `_bearer` (existing 401) then `resolve_login` (403) — order matches tests.
