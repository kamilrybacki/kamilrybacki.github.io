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
