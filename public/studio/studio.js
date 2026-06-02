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
  let recognition = null, liveFinal = '', liveActive = false;   // Web Speech API live caption
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
    const ws = current;
    dirty = false;                       // optimistic; a mid-flight edit re-sets it
    saveState = 'saving'; renderSaveState();
    try {
      await api('PUT', `/workspaces/${ws.id}`,
        { title: ws.title, status: ws.status, notes: ws.notes, article: ws.article });
      try { localStorage.removeItem('studio.ws.' + ws.id); } catch {}
      saveState = dirty ? 'unsaved' : 'saved';     // dirty again? a newer edit is pending
    } catch (err) {
      dirty = true;                      // keep dirty so the edit isn't lost
      saveState = 'unsaved';
      try { localStorage.setItem('studio.ws.' + ws.id, JSON.stringify(ws)); } catch {}
      status('Save failed (retrying): ' + err.message);
      scheduleSave();                    // reschedule a retry
    }
    renderSaveState();
  }
  function renderSaveState() {
    const el = $('savestate'); if (!el) return;
    el.textContent = { saved: 'Saved ✓', saving: 'Saving…', unsaved: 'Unsaved' }[saveState];
  }

  // --- Routing ---
  async function route() {
    if (!token) { showView('signin'); return; }
    if (dirty) { await saveNow(); }      // flush the outgoing workspace before switching
    const m = /^#\/w\/([A-Za-z0-9_-]+)/.exec(location.hash);
    if (m) openWorkspace(m[1]); else showDashboard();
  }
  function showView(v) {
    $('view-signin').style.display = v === 'signin' ? '' : 'none';
    $('view-dashboard').style.display = v === 'dashboard' ? '' : 'none';
    $('view-workspace').style.display = v === 'workspace' ? '' : 'none';
    document.body.classList.toggle('sticky-on', v === 'workspace');  // show the mobile action bar
  }

  // --- Dashboard ---
  async function showDashboard() {
    showView('dashboard'); status('Loading…');
    let list = [];
    try { list = (await api('GET', '/workspaces')).workspaces || []; }
    catch (err) { status('Failed to load: ' + err.message); }
    const now = Date.now();
    $('cards').innerHTML = list.length ? list.map(w => `
      <li data-id="${escapeHtml(w.id)}">
        <a href="#/w/${encodeURIComponent(w.id)}"><strong>${escapeHtml(w.title)}</strong></a>
        <span class="badge">${escapeHtml(L.statusLabel(w.status))}</span>
        <span class="meta">${escapeHtml(String(w.noteCount))} note(s) · ${escapeHtml(L.relTime(w.updatedAt, now))}</span>
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
    stopLive(); liveFinal = ''; renderLive('');
    try { current = await api('GET', `/workspaces/${id}`); }
    catch (err) { status('Load failed: ' + err.message); return; }
    if (!current) { location.hash = '#/'; return; }
    current.notes = current.notes || []; dirty = false; saveState = 'saved';
    // Offer to restore an unsaved local mirror left by a previous failed save.
    try {
      const raw = localStorage.getItem('studio.ws.' + current.id);
      if (raw && confirm('Unsaved local changes were found for this article. Restore them?')) {
        current = JSON.parse(raw); current.notes = current.notes || []; markDirty();
      } else if (raw) { localStorage.removeItem('studio.ws.' + current.id); }
    } catch {}
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
    startLive();
    recTimer = setInterval(() =>
      status(`Recording… ${L.formatDuration(Math.round((Date.now() - recStart) / 1000))}`), 1000);
    renderWorkspace();
  }
  function stopRec() { if (mediaRecorder) { clearInterval(recTimer); recTimer = null; stopLive(); mediaRecorder.stop(); status('Recording queued.'); } }

  // --- Live caption (browser Web Speech API; a preview only — server STT is authoritative) ---
  function renderLive(interim) {
    const box = $('live'); if (!box) return;
    box.hidden = !liveActive && !liveFinal;
    $('live-final').textContent = liveFinal;
    $('live-interim').textContent = interim || '';
    box.scrollTop = box.scrollHeight;
  }
  function startLive() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;                       // unsupported browser → silent; recording still works
    let rec;
    try { rec = new SR(); } catch { return; }
    liveFinal = ''; liveActive = true;
    rec.continuous = true; rec.interimResults = true;
    rec.lang = ($('live-lang') && $('live-lang').value) || navigator.language || 'en-US';
    rec.onresult = e => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const txt = e.results[i][0].transcript;
        if (e.results[i].isFinal) liveFinal += txt; else interim += txt;
      }
      renderLive(interim);
    };
    rec.onerror = e => { if (e.error === 'not-allowed' || e.error === 'service-not-allowed') liveActive = false; };
    rec.onend = () => { if (liveActive) { try { rec.start(); } catch {} } };  // mobile Chrome ends on pause → resume
    recognition = rec;
    try { rec.start(); renderLive(''); } catch { liveActive = false; }
  }
  function stopLive() {
    liveActive = false;
    if (recognition) { try { recognition.stop(); } catch {} recognition = null; }
    renderLive('');                        // drop trailing interim; keep finalized text visible
  }

  async function transcribeAll() {
    if (!pending.length || transcribing) return;
    const ws = current;
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
        if (current !== ws) { transcribing = false; return; }   // navigated away → don't touch another workspace
        ws.notes.push({ id: newId(), name: clip.name, transcript });
        removePending(clip.id); markDirty();
      } catch (err) { clip._err = err.message; failed++; }
    }
    transcribing = false;
    if (current !== ws) return;
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
    const ws = current;
    status(`Synthesizing ${ws.notes.length} note(s)…`);
    try {
      const r = await fetch(`${STT}/synthesize`, { method: 'POST',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: ws.notes.map(n => n.transcript) }) });
      if (!r.ok) throw new Error('HTTP ' + r.status + ': ' + (await r.text()).slice(0, 200));
      const article = await r.json();
      if (current !== ws) return;                 // navigated away → drop result, don't corrupt
      ws.article = article; ws.status = 'synthesized';
      markDirty(); renderWorkspace(); status('Synthesized — review and save.');
    } catch (err) { status('Synthesis failed: ' + err.message); }
  }

  async function saveDraft() {
    if (!current || !current.article) return;
    const ws = current;
    syncArticleFromForm();               // ensure ws.article reflects the live preview fields
    const a = ws.article;
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
        if (current === ws) { ws.status = 'committed'; dirty = true; await saveNow(); }
        else { dirty = true; current = ws; await saveNow(); }   // persist the committed status regardless
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

  function syncArticleFromForm() {
    if (!current || !current.article) return;
    const a = current.article;
    a.title = $('f-title').value; a.description = $('f-desc').value; a.category = $('f-cat').value;
    a.tags = $('f-tags').value.split(',').map(s => s.trim()).filter(Boolean); a.body = $('f-body').value;
    markDirty();
  }

  function renderWorkspace() {
    if (!current) return;
    $('rec').textContent = mediaRecorder ? '■ Stop' : '● Record';
    $('rec').dataset.on = mediaRecorder ? '1' : '';
    $('pending').innerHTML = pending.map(p => `
      <li data-id="${escapeHtml(p.id)}"><strong>${escapeHtml(p.name)}</strong>
        <audio controls src="${p.url}"></audio><button data-act="rm">✕</button>
        ${p._err ? `<span class="err">${escapeHtml(p._err)}</span>` : ''}</li>`).join('');
    $('transcribe-all').disabled = !pending.length || transcribing;
    $('transcribe-all').textContent = transcribing ? 'Transcribing…' : `Transcribe all (${pending.length})`;
    $('notes').innerHTML = current.notes.map(n => `
      <li data-id="${escapeHtml(n.id)}"><strong>${escapeHtml(n.name)}</strong>
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
    // Sticky primary action reflects the current stage.
    const prim = $('primary');
    let label, act, enabled = true;
    if (pending.length) { label = `Transcribe all (${pending.length})`; act = 'transcribe'; }
    else if (current.article) { label = 'Save draft'; act = 'save'; }
    else if (current.notes.length) { label = 'Synthesize'; act = 'synthesize'; }
    else { label = 'Record or drop a note'; act = ''; enabled = false; }
    prim.textContent = transcribing ? 'Transcribing…' : label;
    prim.dataset.action = act;
    prim.disabled = !enabled || transcribing;
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
    // Live caption language: restore saved choice (fall back to browser locale), persist on change.
    try {
      const saved = localStorage.getItem('studio.lang');
      const want = saved || navigator.language || 'en-US';
      if ([...$('live-lang').options].some(o => o.value === want)) $('live-lang').value = want;
    } catch {}
    $('live-lang').addEventListener('change', e => {
      try { localStorage.setItem('studio.lang', e.target.value); } catch {}
      if (liveActive) { const keep = liveFinal; stopLive(); startLive(); liveFinal = keep; renderLive(''); }
    });
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
    ['f-title', 'f-desc', 'f-cat', 'f-tags', 'f-body'].forEach(id =>
      $(id).addEventListener('input', syncArticleFromForm));   // persist preview edits via auto-save
    $('save').addEventListener('click', saveDraft);
    $('primary').addEventListener('click', () => {
      const a = $('primary').dataset.action;
      if (a === 'transcribe') transcribeAll();
      else if (a === 'synthesize') synthesize();
      else if (a === 'save') saveDraft();
    });
    window.addEventListener('hashchange', route);
    window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
    route();
  });
})();
