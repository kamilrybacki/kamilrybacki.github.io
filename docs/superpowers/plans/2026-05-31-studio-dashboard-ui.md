# Studio dashboard UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the studio into a hash-routed app with a **dashboard** of persisted workspaces and a **workspace view** that loads/saves state from the `/workspaces` service (auto-save + explicit save), wrapping the existing record/transcribe/synthesize/commit flow.

**Architecture:** One `public/studio/` page, hash routes `#/` (dashboard) and `#/w/<id>` (workspace). A thin server API layer (fetch wrappers) + a `current` workspace object holding `notes`/`article`/`title`/`status`. Mutations mark dirty → debounced `PUT` (+ a Save-progress button). Pending audio blobs stay client-side. Reuses existing recorder/transcribe/synthesize/commit logic.

**Tech Stack:** Vanilla JS, `node --test`. Repo `/home/kamil-rybacki/Code/kamilrybacki.github.io`, branch `feature/studio-dashboard` (already created; this plan continues on it).

**Constants:** STT `https://stt.kamilandrzejrybacki.dpdns.org`, OAUTH `https://cms-auth.kamilandrzejrybacki.dpdns.org`, repo `kamilrybacki/kamilrybacki.github.io`.

---

### Task 1: studio-lib helpers (`relTime`, `statusLabel`) + tests

**Files:** Modify `public/studio/studio-lib.js`; Test `tests/studio-lib.test.js` (append).

- [ ] **Step 1: failing tests** (append)

```js
test('relTime', () => {
  const now = Date.parse('2026-05-31T12:00:00Z');
  assert.equal(lib.relTime('2026-05-31T12:00:00Z', now), 'just now');
  assert.equal(lib.relTime('2026-05-31T11:59:00Z', now), '1m ago');
  assert.equal(lib.relTime('2026-05-31T10:00:00Z', now), '2h ago');
  assert.equal(lib.relTime('2026-05-29T12:00:00Z', now), '2d ago');
  assert.equal(lib.relTime('', now), '');
});
test('statusLabel', () => {
  assert.equal(lib.statusLabel('collecting'), 'Collecting');
  assert.equal(lib.statusLabel('synthesized'), 'Synthesized');
  assert.equal(lib.statusLabel('committed'), 'Saved to repo');
  assert.equal(lib.statusLabel('weird'), 'weird');
});
```

- [ ] **Step 2:** `node --test tests/studio-lib.test.js` → FAIL.

- [ ] **Step 3:** add to `studio-lib.js` (before the final `return {...}`), and add both names to the returned object:

```js
  function relTime(iso, now) {
    if (!iso) return '';
    const t = Date.parse(iso); if (isNaN(t)) return '';
    const s = Math.max(0, Math.floor(((now || Date.now()) - t) / 1000));
    if (s < 45) return 'just now';
    const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }
  function statusLabel(s) {
    return { collecting: 'Collecting', synthesized: 'Synthesized', committed: 'Saved to repo' }[s] || String(s || '');
  }
```
Return line becomes:
```js
  return { oneline, yamlQuote, slugify, coerceTags, buildMarkdown, extForMime, formatDuration, relTime, statusLabel };
```

- [ ] **Step 4:** `node --test tests/studio-lib.test.js` → PASS.
- [ ] **Step 5:** `git add public/studio/studio-lib.js tests/studio-lib.test.js && git commit -q -m "feat(studio): relTime + statusLabel helpers"`

---

### Task 2: Rewrite `public/studio/studio.js` (router + dashboard + workspace sync)

**Files:** Modify `public/studio/studio.js` (full rewrite below).

- [ ] **Step 1: Replace the entire file** with:

```js
// Audio studio: dashboard of persisted workspaces + per-workspace note→synthesis flow.
// Depends on window.StudioLib (studio-lib.js).
(function () {
  'use strict';
  const STT = 'https://stt.kamilandrzejrybacki.dpdns.org';
  const OAUTH = 'https://cms-auth.kamilandrzejrybacki.dpdns.org';
  const REPO = 'kamilrybacki/kamilrybacki.github.io';
  const ARTICLES = 'src/content/articles';
  const L = window.StudioLib;

  let token = null;
  let current = null;        // {id, title, status, notes:[], article}
  let pending = [];          // raw clips (client-only): {id,name,blob,mime,url,_err}
  let mediaRecorder = null, recStart = 0, recTimer = null, transcribing = false;
  let dirty = false, saveTimer = null, saveState = 'saved';   // saved|saving|unsaved

  const $ = id => document.getElementById(id);
  const status = m => { $('status').textContent = m; };
  const newId = () => String(Date.now()) + Math.round(performance.now());
  const escapeHtml = s => String(s).replace(/[&<>"]/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // --- Server API (Bearer token) ---
  async function api(method, path, body) {
    const opt = { method, headers: { Authorization: 'Bearer ' + token } };
    if (body !== undefined) { opt.headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(body); }
    const r = await fetch(`${STT}${path}`, opt);
    if (!r.ok) throw new Error('HTTP ' + r.status + ': ' + (await r.text()).slice(0, 200));
    return r.status === 204 ? null : r.json();
  }

  // --- Auth (cms-auth popup handshake) ---
  function signIn() {
    const popup = window.open(`${OAUTH}/auth?provider=github&scope=repo&site_id=${location.hostname}`,
      'cms-auth', 'width=600,height=700');
    function onMsg(e) {
      if (e.origin !== OAUTH || e.source !== popup) return;
      if (!e.data || typeof e.data !== 'string') return;
      if (e.data === 'authorizing:github') { popup.postMessage(e.data, OAUTH); return; }
      const m = /^authorization:github:(success|error):(.+)$/.exec(e.data);
      if (!m) return;
      window.removeEventListener('message', onMsg);
      try { popup.close(); } catch {}
      if (m[1] === 'success') { token = JSON.parse(m[2]).token; status('Signed in.'); route(); }
      else status('Sign-in failed: ' + m[2].slice(0, 120));
    }
    window.addEventListener('message', onMsg);
  }

  // --- Dirty tracking / save ---
  function markDirty() { dirty = true; saveState = 'unsaved'; renderSaveState(); scheduleSave(); }
  function scheduleSave() { clearTimeout(saveTimer); saveTimer = setTimeout(saveNow, 1500); }
  async function saveNow() {
    if (!current || !dirty) return;
    clearTimeout(saveTimer);
    saveState = 'saving'; renderSaveState();
    try {
      await api('PUT', `/workspaces/${current.id}`,
        { title: current.title, status: current.status, notes: current.notes, article: current.article });
      dirty = false; saveState = 'saved';
    } catch (err) { saveState = 'unsaved'; status('Save failed (will retry): ' + err.message); }
    renderSaveState();
  }
  function renderSaveState() {
    const el = $('savestate'); if (!el) return;
    el.textContent = { saved: 'Saved ✓', saving: 'Saving…', unsaved: 'Unsaved' }[saveState];
  }

  // --- Routing ---
  function route() {
    if (!token) { showView('signin'); return; }
    const m = /^#\/w\/([A-Za-z0-9_-]+)/.exec(location.hash);
    if (m) openWorkspace(m[1]); else showDashboard();
  }
  function showView(v) {
    $('view-signin').style.display = v === 'signin' ? '' : 'none';
    $('view-dashboard').style.display = v === 'dashboard' ? '' : 'none';
    $('view-workspace').style.display = v === 'workspace' ? '' : 'none';
  }

  // --- Dashboard ---
  async function showDashboard() {
    showView('dashboard'); status('Loading…');
    let list = [];
    try { list = (await api('GET', '/workspaces')).workspaces || []; }
    catch (err) { status('Failed to load: ' + err.message); }
    const now = Date.now();
    $('cards').innerHTML = list.length ? list.map(w => `
      <li data-id="${w.id}">
        <a href="#/w/${w.id}"><strong>${escapeHtml(w.title)}</strong></a>
        <span class="badge">${escapeHtml(L.statusLabel(w.status))}</span>
        <span class="meta">${w.noteCount} note(s) · ${escapeHtml(L.relTime(w.updatedAt, now))}</span>
        <button data-act="del">Delete</button>
      </li>`).join('') : '<li class="empty">No started articles yet.</li>';
    status('');
  }
  async function newWorkspace() {
    try { const w = await api('POST', '/workspaces', { title: 'Untitled' }); location.hash = `#/w/${w.id}`; }
    catch (err) { status('Create failed: ' + err.message); }
  }
  async function deleteWorkspace(id) {
    if (!confirm('Delete this article workspace?')) return;
    try { await api('DELETE', `/workspaces/${id}`); showDashboard(); }
    catch (err) { status('Delete failed: ' + err.message); }
  }

  // --- Workspace ---
  async function openWorkspace(id) {
    showView('workspace'); status('Loading…');
    pending = [];
    try { current = await api('GET', `/workspaces/${id}`); }
    catch (err) { status('Load failed: ' + err.message); return; }
    if (!current) { location.hash = '#/'; return; }
    current.notes = current.notes || []; dirty = false; saveState = 'saved';
    $('w-title').value = current.title || '';
    status(''); renderWorkspace();
  }

  function enqueue(fileList) {
    for (const file of Array.from(fileList || [])) {
      const mime = file.type || 'audio/webm';
      pending.push({ id: newId(), name: file.name || ('clip.' + L.extForMime(mime)),
                     blob: file, mime, url: URL.createObjectURL(file) });
    }
    renderWorkspace();
  }
  function removePending(id) {
    const p = pending.find(x => x.id === id);
    if (p) { try { URL.revokeObjectURL(p.url); } catch {} }
    pending = pending.filter(x => x.id !== id); renderWorkspace();
  }

  async function startRec() {
    if (!navigator.mediaDevices || !window.MediaRecorder) { status('Recording not supported here.'); return; }
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch (err) { status('Mic access denied: ' + err.message); return; }
    const stopTracks = () => stream.getTracks().forEach(t => t.stop());
    const chunks = [];
    let rec;
    try { rec = new MediaRecorder(stream); }
    catch (err) { stopTracks(); status('Recording not supported: ' + err.message); return; }
    mediaRecorder = rec;
    rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    rec.onstop = () => {
      clearInterval(recTimer); recTimer = null; stopTracks();
      const mime = rec.mimeType || 'audio/webm';
      const blob = new Blob(chunks, { type: mime });
      mediaRecorder = null;
      if (!blob.size) { status('Recording was empty — try again.'); renderWorkspace(); return; }
      const secs = Math.round((Date.now() - recStart) / 1000);
      pending.push({ id: newId(), name: `Recording ${L.formatDuration(secs)}.${L.extForMime(mime)}`,
                     blob, mime, url: URL.createObjectURL(blob) });
      renderWorkspace();
    };
    recStart = Date.now();
    try { rec.start(1000); }
    catch (err) { stopTracks(); mediaRecorder = null; status('Recording failed: ' + err.message); return; }
    recTimer = setInterval(() =>
      status(`Recording… ${L.formatDuration(Math.round((Date.now() - recStart) / 1000))}`), 1000);
    renderWorkspace();
  }
  function stopRec() { if (mediaRecorder) { clearInterval(recTimer); recTimer = null; mediaRecorder.stop(); status('Recording queued.'); } }

  async function transcribeAll() {
    if (!pending.length || transcribing) return;
    transcribing = true; renderWorkspace();
    const KNOWN = /\.(mp3|m4a|wav|mp4|mpeg|mpga|webm|flac|ogg)$/i;
    let failed = 0;
    for (const clip of pending.slice()) {
      status(`Transcribing ${clip.name}…`);
      const fname = KNOWN.test(clip.name) ? clip.name : `${clip.name}.${L.extForMime(clip.mime)}`;
      const fd = new FormData(); fd.append('audio', clip.blob, fname);
      try {
        const r = await fetch(`${STT}/transcribe`, { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: fd });
        if (!r.ok) throw new Error('HTTP ' + r.status + ': ' + (await r.text()).slice(0, 200));
        const { transcript } = await r.json();
        current.notes.push({ id: newId(), name: clip.name, transcript });
        removePending(clip.id); markDirty();
      } catch (err) { clip._err = err.message; failed++; }
    }
    transcribing = false;
    status(failed ? `${failed} clip(s) failed — see queue.` : 'All transcribed.');
    renderWorkspace();
  }
  function removeNote(id) { current.notes = current.notes.filter(n => n.id !== id); markDirty(); renderWorkspace(); }
  function moveNote(id, d) {
    const i = current.notes.findIndex(n => n.id === id), j = i + d;
    if (i < 0 || j < 0 || j >= current.notes.length) return;
    [current.notes[i], current.notes[j]] = [current.notes[j], current.notes[i]]; markDirty(); renderWorkspace();
  }

  async function synthesize() {
    if (!current.notes.length) { status('No notes yet.'); return; }
    status(`Synthesizing ${current.notes.length} note(s)…`);
    try {
      const r = await fetch(`${STT}/synthesize`, { method: 'POST',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: current.notes.map(n => n.transcript) }) });
      if (!r.ok) throw new Error('HTTP ' + r.status + ': ' + (await r.text()).slice(0, 200));
      current.article = await r.json(); current.status = 'synthesized';
      markDirty(); renderWorkspace(); status('Synthesized — review and save.');
    } catch (err) { status('Synthesis failed: ' + err.message); }
  }

  async function saveDraft() {
    if (!current.article) return;
    const a = current.article;
    a.title = $('f-title').value; a.description = $('f-desc').value; a.category = $('f-cat').value;
    a.tags = $('f-tags').value.split(',').map(s => s.trim()).filter(Boolean); a.body = $('f-body').value;
    markDirty();
    const md = L.buildMarkdown(a, new Date().toISOString().slice(0, 10));
    let slug = L.slugify(a.title);
    status('Saving draft…');
    for (let n = 0; n < 5; n++) {
      const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${ARTICLES}/${slug}.md`, {
        method: 'PUT',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', Accept: 'application/vnd.github+json' },
        body: JSON.stringify({ message: `content: studio draft ${slug}`,
                               content: btoa(unescape(encodeURIComponent(md))), branch: 'main' }) });
      if (r.ok) {
        current.status = 'committed'; dirty = true; await saveNow();
        status('Saved to repo.');
        $('cms-link').innerHTML = `<a href="https://kamilrybacki.github.io/admin/#/collections/articles/entries/${slug}" target="_blank">Refine in CMS →</a>`;
        renderWorkspace(); return;
      }
      const errText = await r.text();
      if (r.status === 422 && /sha/i.test(errText)) { slug = `${L.slugify(a.title)}-${n + 2}`; continue; }
      status('Save failed: HTTP ' + r.status + ' ' + errText.slice(0, 200)); return;
    }
    status('Save failed: could not find a free slug.');
  }

  function renderWorkspace() {
    if (!current) return;
    $('rec').textContent = mediaRecorder ? 'Stop' : 'Record';
    $('pending').innerHTML = pending.map(p => `
      <li data-id="${p.id}"><strong>${escapeHtml(p.name)}</strong>
        <audio controls src="${p.url}"></audio><button data-act="rm">✕</button>
        ${p._err ? `<span class="err">${escapeHtml(p._err)}</span>` : ''}</li>`).join('');
    $('transcribe-all').disabled = !pending.length || transcribing;
    $('transcribe-all').textContent = transcribing ? 'Transcribing…' : `Transcribe all (${pending.length})`;
    $('notes').innerHTML = current.notes.map(n => `
      <li data-id="${n.id}"><strong>${escapeHtml(n.name)}</strong>
        <button data-act="up">↑</button><button data-act="down">↓</button><button data-act="rm">✕</button>
        <div class="t">${escapeHtml((n.transcript || '').slice(0, 240))}</div></li>`).join('');
    $('synth').disabled = !current.notes.length;
    const a = current.article;
    $('preview').style.display = a ? '' : 'none';
    if (a) {
      $('f-title').value = a.title || ''; $('f-desc').value = a.description || '';
      $('f-cat').value = a.category || ''; $('f-tags').value = (a.tags || []).join(', ');
      $('f-body').value = a.body || '';
    }
    renderSaveState();
  }

  // --- Wire up ---
  window.addEventListener('DOMContentLoaded', () => {
    $('signin').addEventListener('click', signIn);
    $('new-ws').addEventListener('click', newWorkspace);
    $('cards').addEventListener('click', e => {
      const li = e.target.closest('li'); if (!li || !li.dataset.id) return;
      if (e.target.dataset.act === 'del') deleteWorkspace(li.dataset.id);
    });
    $('w-title').addEventListener('input', e => { if (current) { current.title = e.target.value; markDirty(); } });
    $('save-progress').addEventListener('click', () => { dirty = true; saveNow(); });
    $('drop').addEventListener('dragover', e => e.preventDefault());
    $('drop').addEventListener('drop', e => { e.preventDefault(); enqueue(e.dataTransfer.files); });
    $('file').addEventListener('change', e => { enqueue(e.target.files); e.target.value = ''; });
    $('rec').addEventListener('click', () => (mediaRecorder ? stopRec() : startRec()));
    $('transcribe-all').addEventListener('click', transcribeAll);
    $('pending').addEventListener('click', e => {
      const li = e.target.closest('li'); if (li && e.target.dataset.act === 'rm') removePending(li.dataset.id);
    });
    $('notes').addEventListener('click', e => {
      const li = e.target.closest('li'); if (!li) return;
      const id = li.dataset.id, act = e.target.dataset.act;
      if (act === 'rm') removeNote(id); else if (act === 'up') moveNote(id, -1); else if (act === 'down') moveNote(id, 1);
    });
    $('synth').addEventListener('click', synthesize);
    $('save').addEventListener('click', saveDraft);
    window.addEventListener('hashchange', route);
    window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
    route();
  });
})();
```

- [ ] **Step 2:** `node --check public/studio/studio.js` → clean.
- [ ] **Step 3:** `git add public/studio/studio.js && git commit -q -m "feat(studio): dashboard + workspace routing + server sync + autosave"`

---

### Task 3: `index.html` — three views

**Files:** Modify `public/studio/index.html`.

- [ ] **Step 1:** Replace the body's `#app` block with three view containers (sign-in, dashboard, workspace). Keep the `<style>` (add a few rules) and the two `<script>` tags at the end. New body:

```html
<body>
  <h1>Audio Studio</h1>
  <p id="status"></p>

  <div id="view-signin" style="display:none">
    <button id="signin">Sign in with GitHub</button>
  </div>

  <div id="view-dashboard" style="display:none">
    <button id="new-ws">+ New article</button>
    <ul id="cards"></ul>
  </div>

  <div id="view-workspace" style="display:none">
    <p><a href="#/">← All articles</a> &nbsp; <span id="savestate"></span></p>
    <label>Title <input id="w-title" /></label>
    <button id="save-progress">Save progress</button>
    <div id="drop">Drop audio notes here, or
      <label><input id="file" type="file" accept="audio/*" multiple hidden /><a href="#">browse</a></label>
      &nbsp;or&nbsp; <button id="rec" type="button">Record</button>
    </div>
    <h2>To transcribe</h2>
    <ul id="pending"></ul>
    <button id="transcribe-all" disabled>Transcribe all (0)</button>
    <h2>Notes</h2>
    <ul id="notes"></ul>
    <button id="synth" disabled>Synthesize</button>
    <div id="preview" style="display:none">
      <h2>Draft preview</h2>
      <label>Title <input id="f-title" /></label>
      <label>Description <input id="f-desc" /></label>
      <label>Category <input id="f-cat" /></label>
      <label>Tags (comma-sep) <input id="f-tags" /></label>
      <label>Body (Markdown) <textarea id="f-body"></textarea></label>
      <button id="save">Save draft</button>
      <p id="cms-link"></p>
    </div>
  </div>

  <script src="studio-lib.js"></script>
  <script src="studio.js"></script>
</body>
```

- [ ] **Step 2:** add to `<style>`:
```css
    #cards { list-style: none; padding: 0; }
    #cards li { border: 1px solid #ddd; border-radius: 8px; padding: .6rem .8rem; margin: .5rem 0; display: flex; gap: .6rem; align-items: center; }
    #cards .badge { font-size: .75em; background: #eef; padding: .1rem .4rem; border-radius: 4px; }
    #cards .meta { color: #777; font-size: .8em; }
    #cards li button { margin-left: auto; }
    #cards .empty { border: none; color: #777; }
    #savestate { color: #777; font-size: .85em; }
```

- [ ] **Step 3:** `npm run build && ls _site/studio/ && grep -q 'view-dashboard' _site/studio/index.html && echo ok`
- [ ] **Step 4:** `git add public/studio/index.html && git commit -q -m "feat(studio): dashboard + workspace markup"`

---

### Task 4: Final verification

- [ ] **Step 1:** `node --test tests/studio-lib.test.js` → all pass.
- [ ] **Step 2:** `node --check public/studio/studio.js && npm run build` → green; `_site/studio/{index.html,studio.js,studio-lib.js}` present.
- [ ] **Step 3 (manual, post-deploy):** sign in → dashboard empty → New → workspace; set title; record + drop → Transcribe all → notes; Synthesize → preview; Save progress (Saved ✓); reload → state persists; back → card shows; open another browser/device → same list; Save draft → status "Saved to repo" + CMS link; Delete from dashboard.

**Deploy OUT OF SCOPE** (gated): publish = merge `feature/studio-dashboard` → main (Pages). Requires the service workspace endpoints deployed first (other plan).

---

## Self-Review
- Spec coverage: dashboard list/open/delete/new ✓ (T2,T3), workspace bound to id ✓, auto-save debounced + Save-progress button ✓ (markDirty/scheduleSave/saveNow + save-progress), title editable ✓, status transitions collecting→synthesized→committed ✓, pending audio client-only ✓, hash routing ✓, beforeunload guard for unsaved ✓. Helpers relTime/statusLabel ✓ (T1).
- Names consistent with the service plan: PUT body `{title,status,notes,article}` matches `WorkspacePatch`; statuses match the store's allowed set.
- studio.js single glue file (~330 lines, < 800) — acceptable.
