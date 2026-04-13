// Decap CMS preview panel — auto-syncs with live blog CSS
//
// Decap CMS 3.x bundles React internally and does not expose window.React,
// so registerPreviewTemplate (which requires a React component) cannot be used
// without loading a second React copy — which causes a render deadlock.
//
// Strategy: skip registerPreviewTemplate entirely and instead inject:
//   1. The live blog CSS (fonts + main.css + prism.css) — auto-updated on every deploy
//   2. A raw CSS block that re-declares the article scoped rules unscoped,
//      targeting elements directly so they apply inside the default preview wrapper.
//   3. A small script that strips {% raw %} / {% endraw %} text nodes Eleventy
//      injects around code fences containing Nunjucks syntax.
//   4. Prism.js injected into the preview iframe for syntax highlighting.

// ── 1. Fonts ──────────────────────────────────────────────────────────────────
CMS.registerPreviewStyle(
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap'
);

// ── 2. Blog CSS (auto-syncs: any blog CSS change is reflected on reload) ──────
CMS.registerPreviewStyle('https://kamilrybacki.github.io/styles/main.css');
CMS.registerPreviewStyle('https://kamilrybacki.github.io/styles/prism.css');

// ── 3. Preview overrides ──────────────────────────────────────────────────────
// The default Decap preview wrapper doesn't add .article-content, so the
// scoped rules in article-layout.css don't fire. Re-declare them unscoped here.
// Variables resolve from main.css which is already loaded above.
CMS.registerPreviewStyle(`
  body {
    margin: 0;
    padding: 2rem 1.5rem 4rem;
    background: var(--background-primary, #f2f2f2);
    color: var(--text-secondary, #242424);
    font-family: var(--font-body, 'Space Mono', monospace);
    font-size: 0.96rem;
    line-height: 1.7;
    max-width: 52rem;
    box-sizing: border-box;
  }

  h1, h2, h3, h4 {
    margin-top: 2rem;
    margin-bottom: 0.8rem;
    text-transform: uppercase;
    letter-spacing: -0.01em;
    color: var(--text-primary, #0d0d0d);
    font-family: var(--font-heading, 'Space Grotesk', sans-serif);
  }
  h1 { font-size: 1.6rem; }
  h2 {
    font-size: 1.4rem;
    font-weight: 700;
    border-bottom: 2px solid color-mix(in srgb, var(--border-color, #0d0d0d) 70%, transparent);
    padding-bottom: 0.42rem;
    margin-top: 2.4rem;
  }
  h3 {
    font-size: 1.18rem;
    font-weight: 700;
    border-bottom: 1px solid color-mix(in srgb, var(--border-color, #0d0d0d) 45%, transparent);
    padding-bottom: 0.32rem;
    margin-top: 2rem;
  }
  h4 {
    font-size: 1.02rem;
    font-weight: 700;
    border-bottom: 1px solid color-mix(in srgb, var(--border-color, #0d0d0d) 30%, transparent);
    padding-bottom: 0.2rem;
    margin-top: 1.6rem;
  }

  p { margin: 0 0 1rem; }

  a {
    color: var(--text-primary, #0d0d0d);
    text-decoration-color: color-mix(in srgb, var(--text-primary, #0d0d0d) 40%, transparent);
    text-underline-offset: 2px;
  }
  a:hover { text-decoration-color: var(--text-primary, #0d0d0d); }

  strong { color: var(--text-primary, #0d0d0d); font-weight: 700; }

  ul, ol { margin: 0 0 1rem; padding-left: 1.4rem; }
  li { margin-bottom: 0.4rem; }

  blockquote {
    margin: 1.25rem 0;
    border-left: 4px solid var(--border-color, #0d0d0d);
    padding: 0.75rem 1rem;
    background: color-mix(in srgb, var(--bg-secondary, #ebebeb) 70%, white 30%);
  }

  img {
    max-width: 100%;
    height: auto;
    margin: 1.25rem auto;
    display: block;
    border: 2px solid var(--border-color, #0d0d0d);
    background: var(--bg-card, #fff);
  }
  img[src$=".svg"] { border: none; background: transparent; }

  pre {
    background: var(--code-bg, #0f0f0f);
    color: var(--code-fg, #d4c8aa);
    border: 1px solid var(--code-border, #262626);
    padding: 1.1rem 1.5rem;
    overflow-x: auto;
    margin: 1.5rem 0;
    font-family: var(--font-mono, 'Space Mono', monospace);
    font-size: 13px;
    line-height: 1.6;
  }
  code {
    font-family: var(--font-mono, 'Space Mono', monospace);
    background: color-mix(in srgb, var(--bg-secondary, #ebebeb) 70%, white 30%);
    border: 1px solid color-mix(in srgb, var(--border-color, #0d0d0d) 50%, transparent);
    padding: 0.05rem 0.24rem;
    font-size: 0.84em;
  }
  pre code { background: transparent; border: 0; padding: 0; }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
    border: 2px solid var(--border-color, #0d0d0d);
    background: var(--bg-card, #fff);
  }
  th, td {
    border: 1px solid color-mix(in srgb, var(--border-color, #0d0d0d) 30%, transparent);
    padding: 0.5rem;
    text-align: left;
  }
  th { color: var(--text-primary, #0d0d0d); }

  figure { margin: 1.5rem auto; }
  figure img { margin: 0 auto 0.5rem; }
  figcaption {
    font-family: var(--font-mono, 'Space Mono', monospace);
    font-size: 0.7rem;
    color: var(--text-muted, #666);
    text-align: center;
  }
`, { raw: true });

// ── 4. Post-render cleanup + Prism syntax highlighting ────────────────────────
// Decap CMS renders the preview inside an iframe. We can't use a React template
// (window.React is not exposed), but we CAN observe DOM changes on the preview
// frame via the MutationObserver API once we have a handle to its document.
//
// Approach: poll until the preview iframe appears in the DOM, then attach
// a MutationObserver on its body to (a) strip {% raw %}/{% endraw %} text nodes
// and (b) run Prism.highlightAllUnder after each mutation.

(function () {
  function stripNunjucksTags(root) {
    if (!root) return;
    var doc = root.ownerDocument || document;
    var walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var toRemove = [];
    var node;
    while ((node = walker.nextNode())) {
      var text = node.textContent.trim();
      if (text === '{% raw %}' || text === '{% endraw %}') {
        if (node.parentNode && node.parentNode !== root) {
          toRemove.push(node.parentNode);
        }
      }
    }
    toRemove.forEach(function (el) {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
  }

  function attachToPreviewFrame(iframeDoc) {
    var body = iframeDoc.body;
    if (!body) return;

    // Inject Prism.js into the iframe
    if (!iframeDoc.getElementById('prism-preview-script')) {
      var s = iframeDoc.createElement('script');
      s.id = 'prism-preview-script';
      s.setAttribute('data-manual', '');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js';
      s.onload = function () {
        var al = iframeDoc.createElement('script');
        al.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js';
        al.onload = function () {
          var win = iframeDoc.defaultView;
          if (win && win.Prism && win.Prism.plugins && win.Prism.plugins.autoloader) {
            win.Prism.plugins.autoloader.languages_path =
              'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/';
            win.Prism.highlightAll();
          }
        };
        iframeDoc.head.appendChild(al);
      };
      iframeDoc.head.appendChild(s);
    }

    stripNunjucksTags(body);

    var observer = new MutationObserver(function () {
      stripNunjucksTags(body);
      var win = iframeDoc.defaultView;
      if (win && win.Prism) win.Prism.highlightAllUnder(body);
    });
    observer.observe(body, { childList: true, subtree: true });
  }

  // Poll for the preview iframe — Decap creates it asynchronously after init.
  var pollCount = 0;
  var pollTimer = setInterval(function () {
    pollCount++;
    if (pollCount > 100) { clearInterval(pollTimer); return; } // give up after 10s

    // Decap CMS renders previews in iframes; find the one containing article content.
    var frames = document.querySelectorAll('iframe');
    for (var i = 0; i < frames.length; i++) {
      var f = frames[i];
      try {
        var fd = f.contentDocument || f.contentWindow.document;
        if (fd && fd.body && !fd.body.dataset.previewAttached) {
          fd.body.dataset.previewAttached = '1';
          attachToPreviewFrame(fd);
        }
      } catch (e) { /* cross-origin frame, skip */ }
    }
  }, 100);
}());
