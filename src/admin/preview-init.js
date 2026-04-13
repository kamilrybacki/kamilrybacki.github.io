// Decap CMS preview panel — CSS-only approach
//
// Decap CMS 3.x bundles React privately (window.React is undefined), so
// registerPreviewTemplate cannot be used without loading a second React copy
// which deadlocks the page. This file uses only registerPreviewStyle.
//
// All article styles are re-declared unscoped so they apply to whatever
// wrapper Decap renders by default, without any JavaScript DOM manipulation.

// ── 1. Fonts ──────────────────────────────────────────────────────────────────
CMS.registerPreviewStyle(
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap'
);

// ── 2. Live blog CSS (auto-syncs on every blog deploy) ────────────────────────
CMS.registerPreviewStyle('https://kamilrybacki.github.io/styles/main.css');
CMS.registerPreviewStyle('https://kamilrybacki.github.io/styles/prism.css');

// ── 3. Unscoped article styles for the preview body ───────────────────────────
// article-layout.css scopes everything under .article-content which Decap's
// default preview wrapper doesn't add. Re-declare the rules unscoped here.
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
  h2 {
    font-size: 1.4rem;
    font-weight: 700;
    border-bottom: 2px solid var(--border-color, #0d0d0d);
    padding-bottom: 0.42rem;
    margin-top: 2.4rem;
  }
  h3 {
    font-size: 1.18rem;
    font-weight: 700;
    border-bottom: 1px solid var(--border-color, #0d0d0d);
    padding-bottom: 0.32rem;
    margin-top: 2rem;
  }

  p { margin: 0 0 1rem; }

  a {
    color: var(--text-primary, #0d0d0d);
    text-underline-offset: 2px;
  }

  strong { color: var(--text-primary, #0d0d0d); font-weight: 700; }

  ul, ol { margin: 0 0 1rem; padding-left: 1.4rem; }
  li { margin-bottom: 0.4rem; }

  blockquote {
    margin: 1.25rem 0;
    border-left: 4px solid var(--border-color, #0d0d0d);
    padding: 0.75rem 1rem;
    background: var(--bg-secondary, #ebebeb);
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
    background: var(--bg-secondary, #ebebeb);
    border: 1px solid var(--border-color, #0d0d0d);
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
    border: 1px solid var(--border-color, #0d0d0d);
    padding: 0.5rem;
    text-align: left;
  }
  th { color: var(--text-primary, #0d0d0d); }
`, { raw: true });
