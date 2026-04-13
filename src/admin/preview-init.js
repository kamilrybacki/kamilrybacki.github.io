// Decap CMS preview panel — auto-syncs with live blog CSS
// Strategy: register the deployed CSS URLs directly (any blog CSS update
// is automatically reflected in the preview on next page load), then wrap
// the preview body in the same class hierarchy used by real article pages
// so every scoped rule (.article-content h2, pre, code, …) applies as-is.

// ── 1. Fonts ─────────────────────────────────────────────────────────────────
CMS.registerPreviewStyle(
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap'
);

// ── 2. Blog CSS (single entry-point, @imports resolve automatically) ──────────
// These are the exact same files base.njk loads, so any blog style change
// is reflected here without touching preview-init.js.
CMS.registerPreviewStyle('https://kamilrybacki.github.io/styles/main.css');
CMS.registerPreviewStyle('https://kamilrybacki.github.io/styles/prism.css');

// ── 3. Preview frame shell ────────────────────────────────────────────────────
// Just gives the iframe some breathing room; all real styles come from above.
CMS.registerPreviewStyle(`
  body {
    margin: 0;
    padding: 0;
    background: var(--background-primary, #f2f2f2);
  }
  .preview-shell {
    width: min(100%, 52rem);
    margin: 0 auto;
    padding: 2rem 1.5rem 4rem;
  }
`, { raw: true });

// ── 4. Preview template ───────────────────────────────────────────────────────
// Wraps the article body in the same class hierarchy as a real article page,
// so all scoped CSS rules (.article-content h2, .article-content pre, …) work
// without any duplication or manual overrides.
//
// Also strips {% raw %} / {% endraw %} markers that Eleventy injects around
// code fences containing template syntax — they appear as literal text nodes
// in the Decap preview because its renderer doesn't know about Nunjucks.
(function () {
  var React = window.React;
  if (!React) {
    console.warn('[preview-init] React not found on window — skipping template registration');
    return;
  }
  var h = React.createElement;

  // Walk text nodes under `root` and remove any paragraph that contains only
  // a Nunjucks raw/endraw tag. Re-runs via MutationObserver on content changes.
  function stripNunjucksTags(root) {
    if (!root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var toRemove = [];
    var node;
    while ((node = walker.nextNode())) {
      var text = node.textContent.trim();
      if (text === '{% raw %}' || text === '{% endraw %}') {
        // Remove the immediate parent element (typically a <p>)
        if (node.parentNode && node.parentNode !== root) {
          toRemove.push(node.parentNode);
        }
      }
    }
    toRemove.forEach(function (el) {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
  }

  function makeContentRef(root) {
    if (!root) return;
    stripNunjucksTags(root);
    var observer = new MutationObserver(function () { stripNunjucksTags(root); });
    observer.observe(root, { childList: true, subtree: true });
  }

  var ArticlePreview = function (props) {
    var entry   = props.entry;
    var widgetFor = props.widgetFor;
    var title   = entry.getIn(['data', 'title'], '');
    var date    = entry.getIn(['data', 'date'], '');
    var category = entry.getIn(['data', 'category'], '');

    return h('div', { className: 'preview-shell' },

      // Article header block — mirrors .article-header in article-layout.css
      h('div', { className: 'article-header' },
        h('h1', {}, title),
        (date || category) && h('hr', { className: 'article-rule' }),
        h('div', { className: 'article-meta' },
          date     && h('span', { className: 'article-date' }, new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })),
          date && category && h('span', { className: 'article-meta-dot' }, '·'),
          category && h('span', { className: 'article-category' }, category)
        )
      ),

      // Article body — all .article-content scoped CSS applies here.
      // ref callback sets up the Nunjucks tag stripper + MutationObserver.
      h('div', { className: 'article-content', ref: makeContentRef },
        widgetFor('body')
      )
    );
  };

  CMS.registerPreviewTemplate('articles', ArticlePreview);
}());
