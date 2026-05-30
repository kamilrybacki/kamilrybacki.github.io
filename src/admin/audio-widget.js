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
