// Decap CMS preview panel styling — mirrors blog article styles
// Loaded after decap-cms.js via <script defer> in index.html

// 1. Fonts (same as base.njk)
CMS.registerPreviewStyle(
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap'
);

// 2. Blog design tokens + base typography (variables, reset, fonts)
CMS.registerPreviewStyle('https://kamilrybacki.github.io/styles/tokens/variables.css');
CMS.registerPreviewStyle('https://kamilrybacki.github.io/styles/base/reset.css');
CMS.registerPreviewStyle('https://kamilrybacki.github.io/styles/base/typography.css');
CMS.registerPreviewStyle('https://kamilrybacki.github.io/styles/prism.css');

// 3. Inline overrides: apply article-content styles at root level inside iframe
CMS.registerPreviewStyle(`
  body {
    background: var(--background-primary);
    color: var(--text-secondary);
    line-height: 1.7;
    font-size: 0.96rem;
    max-width: 52rem;
    margin: 0 auto;
    padding: 1.5rem 2rem 3rem;
  }

  h1, h2, h3, h4 {
    margin-top: 2rem;
    margin-bottom: 0.8rem;
    text-transform: uppercase;
    letter-spacing: -0.01em;
    color: var(--text-primary);
  }
  h1 { font-size: 1.6rem; }
  h2 {
    font-size: 1.4rem;
    font-weight: 700;
    border-bottom: 2px solid color-mix(in srgb, var(--border-color) 70%, transparent);
    padding-bottom: 0.42rem;
    margin-top: 2.4rem;
  }
  h3 {
    font-size: 1.18rem;
    font-weight: 700;
    border-bottom: 1px solid color-mix(in srgb, var(--border-color) 45%, transparent);
    padding-bottom: 0.32rem;
    margin-top: 2rem;
  }
  h4 {
    font-size: 1.02rem;
    font-weight: 700;
    border-bottom: 1px solid color-mix(in srgb, var(--border-color) 30%, transparent);
    padding-bottom: 0.2rem;
    margin-top: 1.6rem;
  }

  p { margin: 0 0 1rem; }

  ul, ol { margin: 0 0 1rem; padding-left: 1.4rem; }
  li { margin-bottom: 0.4rem; }

  a {
    color: var(--text-primary);
    text-decoration-color: color-mix(in srgb, var(--text-primary) 40%, transparent);
    text-underline-offset: 2px;
  }
  a:hover { text-decoration-color: var(--text-primary); }

  strong { color: var(--text-primary); font-weight: 700; }

  blockquote {
    margin: 1.25rem 0;
    border-left: 4px solid var(--border-color);
    padding: 0.75rem 1rem;
    background: color-mix(in srgb, var(--bg-secondary) 70%, white 30%);
  }

  code {
    font-family: var(--font-mono);
    background: color-mix(in srgb, var(--bg-secondary) 70%, white 30%);
    border: 1px solid color-mix(in srgb, var(--border-color) 50%, transparent);
    padding: 0.05rem 0.24rem;
    font-size: 0.84em;
  }
  pre {
    background: var(--bg-card);
    color: var(--text-primary);
    border: 2px solid var(--border-color);
    padding: 0.9rem;
    overflow-x: auto;
    margin: 1rem 0;
  }
  pre code { background: transparent; border: 0; padding: 0; }

  img {
    max-width: 100%;
    height: auto;
    margin: 1.25rem auto;
    display: block;
    border: 2px solid var(--border-color);
    background: var(--bg-card);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
    border: 2px solid var(--border-color);
    background: var(--bg-card);
  }
  th, td {
    border: 1px solid color-mix(in srgb, var(--border-color) 30%, transparent);
    padding: 0.5rem;
    text-align: left;
  }
  th { color: var(--text-primary); }

  hr {
    border: 0;
    border-top: 1px solid color-mix(in srgb, var(--border-color) 35%, transparent);
    margin: 2rem 0;
  }
`, { raw: true });
