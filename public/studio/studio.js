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
      // Only trust messages from the cms-auth popup itself — else any page with
      // a handle to this tab could forge an `authorization:github:success` token.
      if (e.origin !== OAUTH || e.source !== popup) return;
      if (!e.data || typeof e.data !== 'string') return;
      if (e.data === 'authorizing:github') { popup.postMessage(e.data, OAUTH); return; }
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

  // --- Pending audio queue (raw clips: dropped files + recordings, not yet transcribed) ---
  let pending = [];                 // [{id, name, blob, mime, url, _err}]
  let mediaRecorder = null, recChunks = [], recStart = 0, recTimer = null, transcribing = false;

  function newId() { return String(Date.now()) + Math.round(performance.now()); }

  function enqueue(fileList) {
    for (const file of Array.from(fileList || [])) {
      const mime = file.type || 'audio/webm';
      pending.push({ id: newId(), name: file.name || ('clip.' + L.extForMime(mime)),
                     blob: file, mime, url: URL.createObjectURL(file) });
    }
    render();
  }
  function removePending(id) {
    const p = pending.find(x => x.id === id);
    if (p) { try { URL.revokeObjectURL(p.url); } catch {} }
    pending = pending.filter(x => x.id !== id); render();
  }

  // --- Mic recording ---
  async function startRec() {
    if (!navigator.mediaDevices || !window.MediaRecorder) { status('Recording not supported here.'); return; }
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch (err) { status('Mic access denied: ' + err.message); return; }
    const stopTracks = () => stream.getTracks().forEach(t => t.stop());
    recChunks = [];
    let rec;
    try { rec = new MediaRecorder(stream); }
    catch (err) { stopTracks(); status('Recording not supported: ' + err.message); return; }
    mediaRecorder = rec;
    rec.ondataavailable = e => { if (e.data && e.data.size) recChunks.push(e.data); };
    rec.onstop = () => {
      clearInterval(recTimer); recTimer = null;
      stopTracks();
      const mime = rec.mimeType || 'audio/webm';
      const blob = new Blob(recChunks, { type: mime });
      const secs = Math.round((Date.now() - recStart) / 1000);
      const name = `Recording ${L.formatDuration(secs)}.${L.extForMime(mime)}`;
      pending.push({ id: newId(), name, blob, mime, url: URL.createObjectURL(blob) });
      mediaRecorder = null; render();
    };
    recStart = Date.now();
    try { rec.start(); }
    catch (err) { stopTracks(); mediaRecorder = null; status('Recording failed: ' + err.message); return; }
    recTimer = setInterval(() =>
      status(`Recording… ${L.formatDuration(Math.round((Date.now() - recStart) / 1000))}`), 1000);
    render();
  }
  function stopRec() {
    if (!mediaRecorder) return;
    clearInterval(recTimer); recTimer = null;
    mediaRecorder.stop(); status('Recording added to queue.');
  }

  // --- Transcribe all pending clips → notes ---
  async function transcribeAll() {
    if (!token) { status('Sign in first.'); return; }
    if (!pending.length || transcribing) return;
    transcribing = true; render();
    const KNOWN_EXT = /\.(mp3|m4a|wav|mp4|mpeg|mpga|webm|flac|ogg)$/i;
    let failed = 0;
    for (const clip of pending.slice()) {       // snapshot; clips added mid-run wait for next click
      status(`Transcribing ${clip.name}…`);
      // Keep the clip's existing audio extension; only synthesize one when missing.
      const fname = KNOWN_EXT.test(clip.name) ? clip.name : `${clip.name}.${L.extForMime(clip.mime)}`;
      const fd = new FormData(); fd.append('audio', clip.blob, fname);
      try {
        const r = await fetch(`${STT}/transcribe`, { method: 'POST',
          headers: { Authorization: 'Bearer ' + token }, body: fd });
        if (!r.ok) throw new Error('HTTP ' + r.status + ': ' + (await r.text()).slice(0, 200));
        const { transcript } = await r.json();
        notes.push({ id: newId(), name: clip.name, transcript });
        save(); removePending(clip.id);
      } catch (err) { clip._err = err.message; failed++; }
    }
    transcribing = false;
    status(failed ? `${failed} clip(s) failed — see queue.` : 'All transcribed.');
    render();
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
      const errText = await r.text();
      // GitHub returns 422 "sha wasn't supplied" only when the path already
      // exists. Other 422s are real errors — surface them, don't fake-rename.
      if (r.status === 422 && /sha/i.test(errText)) {
        slug = `${L.slugify(meta.title)}-${n + 2}`; continue;
      }
      status('Save failed: HTTP ' + r.status + ' ' + errText.slice(0, 200)); return;
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
    $('rec').textContent = mediaRecorder ? 'Stop' : 'Record';
    $('pending').innerHTML = pending.map(p => `
      <li data-id="${p.id}">
        <strong>${escapeHtml(p.name)}</strong>
        <audio controls src="${p.url}"></audio>
        <button data-act="rm">✕</button>
        ${p._err ? `<span class="err">${escapeHtml(p._err)}</span>` : ''}
      </li>`).join('');
    $('transcribe-all').disabled = !pending.length || transcribing;
    $('transcribe-all').textContent = transcribing ? 'Transcribing…' : `Transcribe all (${pending.length})`;
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
    $('drop').addEventListener('drop', e => { e.preventDefault(); enqueue(e.dataTransfer.files); });
    $('file').addEventListener('change', e => { enqueue(e.target.files); e.target.value = ''; });
    $('rec').addEventListener('click', () => (mediaRecorder ? stopRec() : startRec()));
    $('transcribe-all').addEventListener('click', transcribeAll);
    $('pending').addEventListener('click', e => {
      const li = e.target.closest('li'); if (!li) return;
      if (e.target.dataset.act === 'rm') removePending(li.dataset.id);
    });
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
