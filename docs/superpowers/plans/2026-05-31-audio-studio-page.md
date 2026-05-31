# Audio-notes Studio page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A standalone `/studio/` page: sign in (reuse `cms-auth`), accumulate audio notes (each transcribed via the service), synthesize into one draft article, commit it as `draft:true` Markdown via the GitHub API. Remove the old Decap audio widget.

**Architecture:** Static files under `public/studio/` (passthrough-copied to `/studio/` — no Eleventy templating/layout). Pure helpers in `studio-lib.js` (unit-tested under node); browser glue in `studio.js`; markup in `index.html`. Auth via the Netlify/Decap `postMessage` OAuth handshake against `cms-auth`.

**Tech Stack:** Vanilla JS (no build), `node --test` for the pure helpers. Repo: `/home/kamil-rybacki/Code/kamilrybacki.github.io`, branch `feature/studio-synthesis`.

**Constants:** STT `https://stt.kamilandrzejrybacki.dpdns.org`; OAuth `https://cms-auth.kamilandrzejrybacki.dpdns.org`; repo `kamilrybacki/kamilrybacki.github.io`; articles `src/content/articles`.

---

### Task 1: Pure helpers (`studio-lib.js`) + node tests

**Files:**
- Create: `public/studio/studio-lib.js`
- Test: `tests/studio-lib.test.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/studio-lib.test.js
const test = require('node:test');
const assert = require('node:assert');
const lib = require('../public/studio/studio-lib.js');

test('slugify', () => {
  assert.equal(lib.slugify('Hello, World! 2026'), 'hello-world-2026');
  assert.equal(lib.slugify('***'), 'untitled');
});

test('oneline flattens newlines', () => {
  assert.equal(lib.oneline('a\nb   c\t d'), 'a b c d');
});

test('buildMarkdown sanitizes front-matter (no injection)', () => {
  const md = lib.buildMarkdown({
    title: 'x', description: 'd',
    category: 'CI\npermalink: /pwn/\ndraft: false',
    tags: ['safe', 'y\nlayout: evil.njk'],
    body: '## H\n\nbody',
  }, '2026-05-31');
  // front-matter block only between the first two ---
  const fm = md.split('---')[1];
  assert.ok(!/^permalink:/m.test(fm), 'no injected permalink line');
  assert.ok(!/^layout: evil/m.test(fm), 'no injected layout line');
  assert.ok(/category: "CI permalink: \/pwn\/ draft: false"/.test(md));
  assert.ok(/draft: true/.test(md));
  assert.ok(md.trim().endsWith('body'));
});

test('buildMarkdown empty tags', () => {
  assert.ok(lib.buildMarkdown({ title: 't', body: 'b', tags: [] }, '2026-05-31').includes('tags: []'));
});

test('coerceTags', () => {
  assert.deepEqual(lib.coerceTags('python'), ['python']);
  assert.deepEqual(lib.coerceTags(['a', ' b ', '']), ['a', 'b']);
  assert.deepEqual(lib.coerceTags(null), []);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test tests/studio-lib.test.js`
Expected: FAIL (cannot find module / fns undefined).

- [ ] **Step 3: Implement `public/studio/studio-lib.js`**

```js
// Pure helpers for the audio studio. Browser + node (CommonJS) compatible.
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.StudioLib = api;
})(typeof self !== 'undefined' ? self : this, function () {
  function oneline(v) { return String(v == null ? '' : v).replace(/\s+/g, ' ').trim(); }
  function yamlQuote(v) { return '"' + oneline(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'; }
  function slugify(t) {
    const s = String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return s || 'untitled';
  }
  function coerceTags(raw) {
    let arr;
    if (Array.isArray(raw)) arr = raw;
    else if (raw == null || raw === '') arr = [];
    else arr = [raw];
    return arr.map(oneline).filter(Boolean);
  }
  function buildMarkdown(meta, date) {
    const title = oneline(meta.title).replace(/^"+|"+$/g, '');
    const description = oneline(meta.description);
    const category = oneline(meta.category) || 'Uncategorized';
    const tags = coerceTags(meta.tags);
    const body = String(meta.body || '').trim();
    const tagsBlock = tags.length
      ? 'tags:\n' + tags.map(t => `  - ${yamlQuote(t)}\n`).join('')
      : 'tags: []\n';
    const fm =
      '---\n' +
      'layout: article.njk\n' +
      `title: ${yamlQuote(title)}\n` +
      `date: ${date}\n` +
      `category: ${yamlQuote(category)}\n` +
      `description: ${yamlQuote(description)}\n` +
      tagsBlock +
      'draft: true\n' +
      '---\n\n';
    return fm + body + '\n';
  }
  return { oneline, yamlQuote, slugify, coerceTags, buildMarkdown };
});
```

- [ ] **Step 4: Run to verify it passes**

Run: `node --test tests/studio-lib.test.js`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add public/studio/studio-lib.js tests/studio-lib.test.js
git commit -q -m "feat(studio): pure helpers (slug, sanitized front-matter) + tests"
```

---

### Task 2: Studio glue (`studio.js`) — auth, transcribe, accumulate, synthesize, commit

**Files:**
- Create: `public/studio/studio.js`

- [ ] **Step 1: Implement `public/studio/studio.js`**

```js
// Audio studio glue. Depends on window.StudioLib (studio-lib.js).
(function () {
  'use strict';
  const STT = 'https://stt.kamilandrzejrybacki.dpdns.org';
  const OAUTH = 'https://cms-auth.kamilandrzejrybacki.dpdns.org';
  const REPO = 'kamilrybacki/kamilrybacki.github.io';
  const ARTICLES = 'src/content/articles';
  const LS_KEY = 'studio.notes.v1';
  const L = window.StudioLib;

  let token = null;
  let notes = load();           // [{id, name, transcript}]
  let article = null;           // synthesized result

  function load() { try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch { return []; } }
  function save() { localStorage.setItem(LS_KEY, JSON.stringify(notes)); }
  function $(id) { return document.getElementById(id); }
  function status(msg) { $('status').textContent = msg; }

  // --- Auth: Netlify/Decap postMessage handshake against cms-auth ---
  function signIn() {
    const w = 600, h = 700;
    const popup = window.open(
      `${OAUTH}/auth?provider=github&scope=repo&site_id=${location.hostname}`,
      'cms-auth', `width=${w},height=${h}`);
    function onMsg(e) {
      if (!e.data || typeof e.data !== 'string') return;
      if (e.data === 'authorizing:github') { popup.postMessage(e.data, '*'); return; }
      const m = /^authorization:github:(success|error):(.+)$/.exec(e.data);
      if (!m) return;
      window.removeEventListener('message', onMsg);
      try { popup.close(); } catch {}
      if (m[1] === 'success') {
        token = JSON.parse(m[2]).token;
        status('Signed in.'); render();
      } else { status('Sign-in failed: ' + m[2]); }
    }
    window.addEventListener('message', onMsg);
  }

  // --- Transcribe one file ---
  async function addFiles(fileList) {
    if (!token) { status('Sign in first.'); return; }
    for (const file of Array.from(fileList)) {
      status(`Transcribing ${file.name}…`);
      const fd = new FormData(); fd.append('audio', file, file.name);
      try {
        const r = await fetch(`${STT}/transcribe`, { method: 'POST',
          headers: { Authorization: 'Bearer ' + token }, body: fd });
        if (!r.ok) throw new Error('HTTP ' + r.status + ': ' + (await r.text()).slice(0, 200));
        const { transcript } = await r.json();
        notes.push({ id: String(Date.now()) + Math.round(performance.now()), name: file.name, transcript });
        save(); render(); status(`Added ${file.name}.`);
      } catch (err) { status(`Failed ${file.name}: ${err.message}`); }
    }
  }

  function removeNote(id) { notes = notes.filter(n => n.id !== id); save(); render(); }
  function move(id, dir) {
    const i = notes.findIndex(n => n.id === id); const j = i + dir;
    if (i < 0 || j < 0 || j >= notes.length) return;
    [notes[i], notes[j]] = [notes[j], notes[i]]; save(); render();
  }

  // --- Synthesize ---
  async function synthesize() {
    if (!token) { status('Sign in first.'); return; }
    if (!notes.length) { status('No notes yet.'); return; }
    status(`Synthesizing ${notes.length} note(s)…`);
    try {
      const r = await fetch(`${STT}/synthesize`, { method: 'POST',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notes.map(n => n.transcript) }) });
      if (!r.ok) throw new Error('HTTP ' + r.status + ': ' + (await r.text()).slice(0, 200));
      article = await r.json(); render(); status('Synthesized — review and save.');
    } catch (err) { status('Synthesis failed: ' + err.message); }
  }

  // --- Commit draft via GitHub Contents API ---
  async function saveDraft() {
    if (!token || !article) return;
    const date = new Date().toISOString().slice(0, 10);
    const meta = {
      title: $('f-title').value, description: $('f-desc').value,
      category: $('f-cat').value, tags: $('f-tags').value.split(',').map(s => s.trim()).filter(Boolean),
      body: $('f-body').value,
    };
    const md = L.buildMarkdown(meta, date);
    let slug = L.slugify(meta.title);
    status('Saving draft…');
    for (let n = 0; n < 5; n++) {
      const path = `${ARTICLES}/${slug}.md`;
      const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
        method: 'PUT',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json',
                   Accept: 'application/vnd.github+json' },
        body: JSON.stringify({ message: `content: studio draft ${slug}`,
                               content: btoa(unescape(encodeURIComponent(md))), branch: 'main' }),
      });
      if (r.ok) {
        localStorage.removeItem(LS_KEY); notes = []; article = null; render();
        status('Saved.');
        $('cms-link').innerHTML =
          `<a href="https://kamilrybacki.github.io/admin/#/collections/articles/entries/${slug}" target="_blank">Refine in CMS →</a>`;
        return;
      }
      if (r.status === 422) { slug = `${L.slugify(meta.title)}-${n + 2}`; continue; } // exists → rename
      status('Save failed: HTTP ' + r.status + ' ' + (await r.text()).slice(0, 200)); return;
    }
    status('Save failed: could not find a free slug.');
  }

  // --- Render ---
  function render() {
    $('signin').style.display = token ? 'none' : '';
    $('app').style.display = token ? '' : 'none';
    $('notes').innerHTML = notes.map(n => `
      <li data-id="${n.id}">
        <strong>${escapeHtml(n.name)}</strong>
        <button data-act="up">↑</button><button data-act="down">↓</button>
        <button data-act="rm">✕</button>
        <div class="t">${escapeHtml(n.transcript.slice(0, 240))}</div>
      </li>`).join('');
    $('synth').disabled = !notes.length;
    $('preview').style.display = article ? '' : 'none';
    if (article) {
      $('f-title').value = article.title || '';
      $('f-desc').value = article.description || '';
      $('f-cat').value = article.category || '';
      $('f-tags').value = (article.tags || []).join(', ');
      $('f-body').value = article.body || '';
    }
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  // --- Wire up ---
  window.addEventListener('DOMContentLoaded', () => {
    $('signin').addEventListener('click', signIn);
    $('drop').addEventListener('dragover', e => { e.preventDefault(); });
    $('drop').addEventListener('drop', e => { e.preventDefault(); addFiles(e.dataTransfer.files); });
    $('file').addEventListener('change', e => { addFiles(e.target.files); e.target.value = ''; });
    $('synth').addEventListener('click', synthesize);
    $('save').addEventListener('click', saveDraft);
    $('notes').addEventListener('click', e => {
      const li = e.target.closest('li'); if (!li) return;
      const id = li.dataset.id, act = e.target.dataset.act;
      if (act === 'rm') removeNote(id);
      else if (act === 'up') move(id, -1);
      else if (act === 'down') move(id, 1);
    });
    render();
  });
})();
```

- [ ] **Step 2: Syntax check**

Run: `node --check public/studio/studio.js`
Expected: no output (valid).

- [ ] **Step 3: Commit**

```bash
git add public/studio/studio.js
git commit -q -m "feat(studio): auth handshake, transcribe, accumulate, synthesize, commit"
```

---

### Task 3: Markup (`index.html`) + eleventy passthrough

**Files:**
- Create: `public/studio/index.html`
- Modify: `.eleventy.js`

- [ ] **Step 1: Create `public/studio/index.html`**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>Audio Studio</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 820px; margin: 2rem auto; padding: 0 1rem; }
    #drop { border: 2px dashed #aaa; border-radius: 10px; padding: 2rem; text-align: center; color: #666; }
    #notes { list-style: none; padding: 0; }
    #notes li { border-left: 3px solid #ccc; padding: .5rem .75rem; margin: .5rem 0; }
    #notes .t { font-size: .85em; color: #555; white-space: pre-wrap; }
    button { cursor: pointer; }
    input, textarea { width: 100%; box-sizing: border-box; }
    #f-body { min-height: 320px; font-family: ui-monospace, monospace; }
    #status { color: #444; min-height: 1.4em; }
  </style>
</head>
<body>
  <h1>Audio Studio</h1>
  <p id="status"></p>
  <button id="signin">Sign in with GitHub</button>
  <div id="app" style="display:none">
    <div id="drop">Drop audio notes here, or
      <label><input id="file" type="file" accept="audio/*" multiple hidden /><a href="#">browse</a></label>
    </div>
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
</html>
```

- [ ] **Step 2: Add passthrough in `.eleventy.js`** (near the other `addPassthroughCopy` lines):

```js
  eleventyConfig.addPassthroughCopy({ "public/studio": "studio" });
```

- [ ] **Step 3: Build + verify**

Run: `npm run build && ls _site/studio/ && node --check _site/studio/studio.js`
Expected: `index.html studio-lib.js studio.js` present; `node --check` clean.

- [ ] **Step 4: Commit**

```bash
git add public/studio/index.html .eleventy.js
git commit -q -m "feat(studio): page markup + eleventy passthrough"
```

---

### Task 4: Remove the Decap audio widget

**Files:**
- Delete: `src/admin/audio-widget.js`
- Modify: `src/admin/index.html`, `.eleventy.js`, `src/admin/config.yml`

- [ ] **Step 1:** `git rm src/admin/audio-widget.js`
- [ ] **Step 2:** In `src/admin/index.html` remove the line `<script src="audio-widget.js"></script>`.
- [ ] **Step 3:** In `.eleventy.js` remove the line `addPassthroughCopy({ "src/admin/audio-widget.js": "admin/audio-widget.js" })`.
- [ ] **Step 4:** In `src/admin/config.yml` remove the field line `- { name: audio, label: "Audio → draft (optional)", widget: audio, required: false }`.
- [ ] **Step 5:** `npm run build` → succeeds; `grep -r audio-widget _site/ || echo clean` → clean.
- [ ] **Step 6: Commit**

```bash
git add -A src/admin/ .eleventy.js
git commit -q -m "chore: remove Decap audio widget (superseded by /studio)"
```

---

### Task 5: Final verification

- [ ] **Step 1:** `node --test tests/studio-lib.test.js` → all pass.
- [ ] **Step 2:** `npm run build` → green; `_site/studio/index.html` exists; `_site/admin/` has no `audio-widget.js`.
- [ ] **Step 3 (manual, post-deploy):** sign in at `/studio/`, drop a note (transcribes), drop more, reorder/remove, reload (notes persist), Synthesize (preview fills), edit title, Save draft (commits `.md`), follow CMS link. Verify the committed file has valid front-matter + `draft: true`.

**Deploy OUT OF SCOPE here** (publishing the page = merge to `main`; the service `/transcribe`/`/synthesize` change must be deployed too). Gated.

---

## Self-Review
- Spec coverage: standalone page ✓, cms-auth handshake ✓ (Task 2 signIn), accumulate+localStorage+reorder/remove ✓, transcribe per note ✓, synthesize ✓, commit via Contents API + slug-collision rename ✓, CMS link ✓, widget removal ✓ (Task 4), front-matter sanitization shared with service-side logic ✓ (studio-lib buildMarkdown).
- Names consistent: `StudioLib.{slugify,buildMarkdown,coerceTags,oneline,yamlQuote}` used identically in studio.js + tests.
- Static passthrough (`public/studio` → `/studio`) avoids Eleventy layout/templating on the page.
- Integration risk noted in spec: the exact `authorizing:github` ↔ `authorization:github:success` handshake with cms-auth — verify against the running provider during manual test; adjust the `postMessage` target/origin if the provider expects `window.opener` vs `e.source`.
