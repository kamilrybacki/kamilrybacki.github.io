// Decap custom "audio" widget — uploads audio to the stt-polish service and
// fans the polished result into the article fields on save. See
// docs/superpowers/specs/2026-05-30-cms-stt-polish-design.md.
(function () {
  "use strict";
  if (!window.CMS) { console.error("[audio-widget] window.CMS missing"); return; }
  console.log("[audio-widget] loaded");
})();
