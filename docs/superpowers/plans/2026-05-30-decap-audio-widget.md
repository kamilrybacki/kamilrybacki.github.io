# Decap audio-widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A Decap CMS custom widget that uploads an audio file to the stt-polish service, previews the returned article, and (via a `preSave` listener) fans the result into the article's `title`/`description`/`category`/`tags`/`body` fields.

**Architecture:** Approach A from the spec. A `src/admin/audio-widget.js` registered through the CDN `window.CMS` global (`registerWidget` + `registerEventListener('preSave')`), loaded by a `<script>` in `src/admin/index.html`. The widget control owns only its own field value (the polish result object); `preSave` writes the real fields and deletes the helper field. Native field widgets (incl. the deliberate `modes: ['raw']` body editor) are untouched.

**Tech Stack:** Decap CMS 3.3.3 (CDN), vanilla JS using Decap's exposed `window.h` (createElement) + `window.createClass`. 11ty passthrough.

**Working directory:** `/home/kamil-rybacki/Code/kamilrybacki.github.io` (branch `feature/cms-stt-polish`).

**Endpoint:** `https://stt.kamilandrzejrybacki.dpdns.org/transcribe` (deployed by the deploy plan; the widget references it by constant).

---

### Task 1: Wire the widget script into the admin build

**Files:**
- Modify: `src/admin/index.html`
- Modify: `.eleventy.js` (passthrough)
- Create: `src/admin/audio-widget.js` (stub first)

- [ ] **Step 1: Create a stub `src/admin/audio-widget.js`**

```js
// Decap custom "audio" widget — uploads audio to the stt-polish service and
// fans the polished result into the article fields on save. See
// docs/superpowers/specs/2026-05-30-cms-stt-polish-design.md.
(function () {
  "use strict";
  if (!window.CMS) { console.error("[audio-widget] window.CMS missing"); return; }
  console.log("[audio-widget] loaded");
})();
```

- [ ] **Step 2: Add the script to `src/admin/index.html`**

Change the body so the widget script loads AFTER the Decap bundle:

```html
<body>
  <script src="https://unpkg.com/decap-cms@3.3.3/dist/decap-cms.js"></script>
  <script src="preview-init.js"></script>
  <script src="audio-widget.js"></script>
</body>
```

- [ ] **Step 3: Add the eleventy passthrough**

The build copies `src/admin/*` files individually. In `.eleventy.js`, after the existing `preview-init.js` passthrough line (~line 15), add:

```js
  eleventyConfig.addPassthroughCopy({ "src/admin/audio-widget.js": "admin/audio-widget.js" });
```

- [ ] **Step 4: Build and confirm the file is emitted**

Run: `npm run build && ls _site/admin/audio-widget.js`
Expected: the file exists in `_site/admin/`. (Open `_site/admin/index.html` to confirm the `<script>` tag is present.)

- [ ] **Step 5: Commit**

```bash
git add src/admin/index.html src/admin/audio-widget.js .eleventy.js
git commit -q -m "build: load audio-widget.js in Decap admin"
```

---

### Task 2: Implement the widget control + preSave fan-out

**Files:**
- Modify: `src/admin/audio-widget.js`

- [ ] **Step 1: Replace `audio-widget.js` with the full implementation**

```js
// Decap custom "audio" widget. Uploads audio to the stt-polish service,
// previews the polished article, and fans the result into the article fields
// on save (via preSave). Uses Decap's exposed window.h / window.createClass.
(function () {
  "use strict";
  var CMS = window.CMS, h = window.h, createClass = window.createClass;
  if (!CMS || !h || !createClass) {
    console.error("[audio-widget] CMS/h/createClass missing — Decap not ready");
    return;
  }

  var ENDPOINT = "https://stt.kamilandrzejrybacki.dpdns.org/transcribe";

  // Read the GitHub token Decap stored at login (GitHub backend).
  function githubToken() {
    var keys = ["decap-cms-user", "netlify-cms-user"];
    for (var i = 0; i < keys.length; i++) {
      try {
        var raw = window.localStorage.getItem(keys[i]);
        if (raw) {
          var u = JSON.parse(raw);
          if (u && u.token) return u.token;
        }
      } catch (e) { /* ignore */ }
    }
    return null;
  }

  var Control = createClass({
    getInitialState: function () {
      return { status: "", busy: false, result: this.props.value || null };
    },
    handleFile: function (e) {
      var self = this;
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      var token = githubToken();
      if (!token) { self.setState({ status: "Not signed in to GitHub — reload the CMS." }); return; }

      self.setState({ busy: true, status: "Transcribing & polishing… (can take a minute)" });
      var fd = new FormData();
      fd.append("audio", file, file.name);

      fetch(ENDPOINT, { method: "POST", headers: { Authorization: "Bearer " + token }, body: fd })
        .then(function (r) {
          if (!r.ok) {
            return r.text().then(function (t) { throw new Error("HTTP " + r.status + ": " + t.slice(0, 300)); });
          }
          return r.json();
        })
        .then(function (data) {
          self.props.onChange(data); // store result as this field's value
          self.setState({ busy: false, result: data, status: "Done — review below, then Save to apply." });
        })
        .catch(function (err) {
          self.setState({ busy: false, status: "Failed: " + err.message });
        });
    },
    render: function () {
      var v = this.state.result;
      var children = [
        h("input", {
          type: "file",
          accept: "audio/*",
          disabled: this.state.busy,
          onChange: this.handleFile,
          key: "file",
        }),
        h("p", { key: "status", style: { fontSize: "0.85em", color: "#555", marginTop: "6px" } }, this.state.status),
      ];
      if (v) {
        children.push(
          h("div", { key: "preview", style: { borderLeft: "3px solid #ccc", paddingLeft: "10px", marginTop: "8px" } }, [
            h("strong", { key: "t" }, String(v.title || "")),
            h("p", { key: "d", style: { fontSize: "0.85em" } }, String(v.description || "")),
            h("p", { key: "c", style: { fontSize: "0.8em", color: "#777" } },
              "category: " + String(v.category || "") + " · tags: " + ((v.tags || []).join(", "))),
            h("pre", { key: "b", style: { whiteSpace: "pre-wrap", fontSize: "0.8em", maxHeight: "160px", overflow: "auto" } },
              String(v.body || "").slice(0, 1200)),
            h("p", { key: "n", style: { fontSize: "0.8em", color: "#777" } },
              "These fill empty fields on Save (your manual edits are kept)."),
          ])
        );
      }
      return h("div", { className: this.props.classNameWrapper }, children);
    },
  });

  var Preview = createClass({
    render: function () {
      var v = this.props.value;
      return h("div", {}, v ? "Audio draft: " + String(v.get ? v.get("title") : v.title || "") : "");
    },
  });

  CMS.registerWidget("audio", Control, Preview);

  // Fan the polish result into the real fields at save, then drop the helper.
  CMS.registerEventListener({
    name: "preSave",
    handler: function (props) {
      var data = props.entry.get("data");
      var a = data.get("audio");
      if (!a) return data;
      var get = function (k) { return (a && typeof a.get === "function") ? a.get(k) : (a ? a[k] : undefined); };
      var isEmpty = function (cur) { return cur === undefined || cur === null || String(cur).trim() === ""; };
      var d = data;
      ["title", "description", "category", "body"].forEach(function (k) {
        var val = get(k);
        if (val && isEmpty(d.get(k))) d = d.set(k, val);
      });
      var tags = get("tags");
      var curTags = d.get("tags");
      var curLen = curTags ? (curTags.size != null ? curTags.size : curTags.length) : 0;
      if (tags && (!curLen || curLen === 0)) d = d.set("tags", tags);
      return d.delete("audio");
    },
  });

  console.log("[audio-widget] registered");
})();
```

- [ ] **Step 2: Build to confirm no syntax errors**

Run: `npm run build && node --check _site/admin/audio-widget.js`
Expected: build succeeds; `node --check` prints nothing (valid JS).

- [ ] **Step 3: Commit**

```bash
git add src/admin/audio-widget.js
git commit -q -m "feat: audio widget control + preSave fan-out"
```

---

### Task 3: Add the `audio` field to the articles collection

**Files:**
- Modify: `src/admin/config.yml`

- [ ] **Step 1: Add the field**

In `src/admin/config.yml`, in the `articles` collection `fields:` list, add as the FIRST field (so it sits at the top of the editor), before `title`:

```yaml
      - { name: audio, label: "Audio → draft (optional)", widget: audio, required: false }
```

- [ ] **Step 2: Build + verify config emitted**

Run: `npm run build && grep -A1 'widget: audio' _site/admin/config.yml`
Expected: the new field line appears in the emitted config.

- [ ] **Step 3: Commit**

```bash
git add src/admin/config.yml
git commit -q -m "feat: add audio->draft field to articles collection"
```

---

### Task 4: Manual smoke test (gated — needs the deployed endpoint)

The widget can only be fully exercised against the live endpoint + CMS OAuth. Run this checklist after the deploy plan completes and the site with the new admin is published.

- [ ] Sign in at `https://kamilrybacki.github.io/admin/`, open Articles → New.
- [ ] **Happy path:** pick a short audio file → status shows progress → preview renders title/description/category/tags/body → Save → reopen the entry: the fields are populated, the `audio` field/value is gone from the committed `.md` front-matter.
- [ ] **Manual-edit-wins:** type a `title` first, then transcribe + Save → your typed title is preserved (only empty fields filled).
- [ ] **Auth failure:** in a browser where you are not signed in / token cleared → status shows a clear "Not signed in" or HTTP 403 message; the form stays usable.
- [ ] **Provider failure:** (optional) point ENDPOINT at an unreachable host → status shows "Failed: …", editing still works.
- [ ] Confirm the committed file has `draft: true` and valid front-matter (no injected keys).

- [ ] **Step (record results):** note pass/fail in `docs/reviews/` during the review sweep.

---

## Self-Review notes
- Spec coverage: widget upload, GitHub-token bearer, preview, preSave fan-out, fill-empty-only, helper-field cleanup, passthrough, config field — all covered. ✓
- Field names in `preSave` (`title/description/category/tags/body`) match `config.yml` field names exactly. ✓
- `audio` helper field is `required: false` and deleted in `preSave`, so it never lands in front-matter. ✓
- Endpoint constant matches the hostname the deploy plan exposes. ✓
- Open coupling (documented in spec): localStorage key (`decap-cms-user`) and `preSave` Immutable shape — pinned to Decap 3.3.3.
