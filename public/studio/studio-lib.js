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
  function extForMime(mime) {
    const m = String(mime || '').split(';')[0].trim().toLowerCase();
    const map = {
      'audio/webm': 'webm', 'audio/ogg': 'ogg', 'audio/mp4': 'mp4',
      'audio/mpeg': 'mp3', 'audio/wav': 'wav', 'audio/x-wav': 'wav',
      'audio/flac': 'flac', 'audio/m4a': 'm4a',
    };
    return map[m] || 'webm';
  }
  function formatDuration(seconds) {
    const s = Math.max(0, Math.floor(Number(seconds) || 0));
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, '0')}`;
  }
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
  return { oneline, yamlQuote, slugify, coerceTags, buildMarkdown, extForMime, formatDuration, relTime, statusLabel };
});
