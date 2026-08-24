const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function(eleventyConfig) {
  // Add plugins
  eleventyConfig.addPlugin(syntaxHighlight);
  
  // Copy static assets
  eleventyConfig.addPassthroughCopy("src/styles");
  eleventyConfig.addPassthroughCopy("public/images");
  eleventyConfig.addPassthroughCopy("public/article-filters.js");
  // Ensure article images and other assets are copied
  eleventyConfig.addPassthroughCopy({ "public/assets": "assets" });
  // KaTeX stylesheet + fonts for math rendering. CSS references fonts relatively
  // (url(fonts/KaTeX_*.woff2)), so both land under /styles/.
  eleventyConfig.addPassthroughCopy({ "node_modules/katex/dist/katex.min.css": "styles/katex.min.css" });
  eleventyConfig.addPassthroughCopy({ "node_modules/katex/dist/fonts": "styles/fonts" });
  
  // Draft images may be written as absolute raw.githubusercontent URLs pointing
  // at this repo's own /public assets, so they preview inside the SilverBullet
  // editor (which can't serve the blog's /public paths). At build time, rewrite
  // those self-repo raw URLs back to relative /public/ paths so published pages
  // (and the Eleventy preview) use local assets. No manual swap needed.
  eleventyConfig.addTransform("relativizeSelfRawImages", function (content, outputPath) {
    const out = outputPath || (this && this.page && this.page.outputPath) || "";
    if (!out.endsWith(".html")) return content;
    // The branch segment may itself contain slashes (e.g. assets/toolboxing2-figures),
    // so match non-greedily up to the first /public/.
    return content.replace(
      /https?:\/\/raw\.githubusercontent\.com\/kamilrybacki\/kamilrybacki\.github\.io\/[^"'\s)]*?\/public\//g,
      "/public/"
    );
  });

  // Drafts (src/content/drafts/, the SilverBullet PVC mount) render only in
  // dev/serve/watch for live preview; a production build ignores them entirely
  // so they never publish. (They also live on the PVC, not in git, so the live
  // build never sees them — this is the explicit guard.)
  if (process.env.ELEVENTY_RUN_MODE === "build") {
    eleventyConfig.ignores.add("src/content/drafts/**");
  }

  // Ignore template files and README
  eleventyConfig.ignores.add("src/content/**/_template.md");
  eleventyConfig.ignores.add("src/content/README.md");
  
  // Watch for changes
  eleventyConfig.addWatchTarget("src/styles/");
  
  // Markdown configuration
  const md = require("markdown-it")({
    html: true,
    breaks: false, // do NOT turn single newlines into <br>
    linkify: true
  });
  // Render soft line breaks (single newline) as a single space so source-wrapped
  // Markdown doesn't generate <br> tags mid sentence.
  md.renderer.rules.softbreak = () => ' ';

  // Wrap tables in a scroll container. Putting overflow on the <table> itself
  // needs display:block, which collapses the table's column layout (columns
  // shrink to content instead of filling the width). The wrapper keeps the
  // table a real table and scrolls only when it is genuinely too wide.
  md.renderer.rules.table_open = () => '<div class="table-wrap">\n<table>\n';
  md.renderer.rules.table_close = () => '</table>\n</div>\n';

  // Math rendering via KaTeX. Inline math with $...$, display math with $$...$$.
  // Operates on text tokens only, so `$VAR` inside code spans/fences is untouched.
  // throwOnError:false → malformed LaTeX renders in red instead of breaking the build.
  const markdownItKatex = require("@traptitech/markdown-it-katex");
  md.use(markdownItKatex, { throwOnError: false, errorColor: "#cc0000" });

  // Path utility needed for thumbnail map lookups
  const path = require('path');

  // Unified figure wrapper & auto-numbering rule.
  // Pattern we match (Markdown or raw HTML image):
  // paragraph_open, inline(image or <img>), paragraph_close,
  // paragraph_open, inline("*caption*"), paragraph_close
  // Additional consecutive italic paragraphs are merged into a single caption body.
  md.core.ruler.after('inline', 'wrap_figures', function(state) {
    const tokens = state.tokens;
    // Thumbnail logic removed: always use original images only.
    let figureCounter = 0;
    for (let i = 0; i < tokens.length; i++) {
      // Skip if already a figure we inserted earlier
      if (tokens[i].type === 'figure_open') continue;

      // Branch A: paragraph-wrapped image
      if (tokens[i].type === 'paragraph_open') {
      let imgInline = tokens[i + 1];
      const imgParaClose = tokens[i + 2];
      if (!imgInline || !imgParaClose || imgParaClose.type !== 'paragraph_close') continue;
      // Ensure we have an image
      let isImage = false;
      if (imgInline.type === 'inline') {
        if (imgInline.children && imgInline.children.length === 1 && imgInline.children[0].type === 'image') {
          isImage = true;
        } else if (/^\s*<img\b/i.test(imgInline.content.trim())) {
          const raw = imgInline.content.trim();
          const srcMatch = raw.match(/src\s*=\s*"([^"]+)"/i);
          const altMatch = raw.match(/alt\s*=\s*"([^"]*)"/i);
          const synthetic = new state.Token('image','img',0);
          synthetic.attrSet('src', srcMatch ? srcMatch[1] : '');
          if (altMatch) synthetic.attrSet('alt', altMatch[1]);
          imgInline.children = [synthetic];
          isImage = true;
        }
      } else if ((imgInline.type === 'html_inline' || imgInline.type === 'html_block') && /^\s*<img\b/i.test(imgInline.content.trim())) {
        const raw = imgInline.content.trim();
        const srcMatch = raw.match(/src\s*=\s*"([^\"]+)"/i);
        const altMatch = raw.match(/alt\s*=\s*"([^\"]*)"/i);
        // Replace with synthetic inline token for uniform processing
        const newInline = new state.Token('inline','',0);
        const synthetic = new state.Token('image','img',0);
        synthetic.attrSet('src', srcMatch ? srcMatch[1] : '');
        if (altMatch) synthetic.attrSet('alt', altMatch[1]);
        newInline.children = [synthetic];
        newInline.content = raw; // preserve original raw
        tokens[i + 1] = newInline;
        imgInline = newInline;
        isImage = true;
      }
      if (!isImage) continue;

      const imgTok = imgInline.children[0];
      const altRaw = (imgTok.attrGet('alt') || '').trim();
      // Opt-out: alt starting with '!' means decorative/no figure
      const skipFigure = altRaw.startsWith('!');
      const altText = skipFigure ? altRaw.slice(1).trim() : altRaw;

      // Optional caption paragraphs immediately following (italic *...*)
      let captionParts = [];
      let scan = i + 3;
      while (scan < tokens.length - 2 && tokens[scan].type === 'paragraph_open') {
        const maybeInline = tokens[scan + 1];
        const maybeClose = tokens[scan + 2];
        if (!(maybeInline && maybeInline.type === 'inline' && maybeClose && maybeClose.type === 'paragraph_close')) break;
        const txt = maybeInline.content.trim();
        if (!(txt.startsWith('*') && txt.endsWith('*'))) break;
        captionParts.push(txt.slice(1,-1).trim());
        scan += 3; // move past this caption paragraph
      }

      // Determine final caption body: italic paragraphs override alt if present; else alt used; if neither, omit figure.
      let body = '';
      if (captionParts.length) {
        body = captionParts.join(' ');
      } else if (altText) {
        body = altText;
      } else {
        // No caption text available, skip wrapping.
        continue;
      }

      // Numbering: allow existing Figure N. prefix in first caption (if any) else assign new number.
      let label;
      const first = captionParts[0] || altText;
      const numbered = /^Figure\s+(\d+)\.\s*(.*)$/.exec(first);
      if (numbered) {
        const existing = parseInt(numbered[1],10);
        figureCounter = Math.max(figureCounter, existing);
        label = `Figure ${existing}.`;
        if (captionParts.length) {
          // Replace first part with body without its number prefix
          const strippedFirst = numbered[2];
          captionParts[0] = strippedFirst;
          body = captionParts.join(' ');
        } else {
          body = numbered[2];
        }
      } else {
        label = `Figure ${++figureCounter}.`;
      }

      const src = imgTok.attrGet('src');
      imgTok.attrSet('loading','lazy');
      // Always use original image src, no thumbnail substitution.
      if (src && /\.(png|jpe?g|webp|gif|svg)$/i.test(src)) {
        imgTok.attrSet('width','800');
        imgTok.attrSet('height','450');
      }
      const base = src ? path.basename(src).replace(/\.[^.]+$/,'') : `fig-${figureCounter}`;
      const slug = base.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
      const figId = `fig-${slug || figureCounter}`;
      imgTok.attrSet('aria-describedby', figId);

      // Build replacement tokens
      // Build final image HTML out of imgTok
      const attrs = [];
      for (const [name, value] of imgTok.attrs || []) {
        attrs.push(`${name}="${value}"`);
      }
      const imgHtml = `<img ${attrs.join(' ')}>`;
      const figureHtml = `<figure class="figure">${imgHtml}<figcaption id="${figId}"><span class="figure-label">${label}</span> ${body}</figcaption></figure>`;
      const figBlock = new state.Token('html_block','',0); figBlock.content = figureHtml;
      const removeLen = 3 + captionParts.length * 3; // original paragraph + caption paragraphs
      tokens.splice(i, removeLen, figBlock);
      // Do not advance i (new figBlock at position i); continue loop
      continue;
      continue; // proceed to next token
      }

      // Branch B: standalone raw HTML image token (html_block or html_inline)
      if ((tokens[i].type === 'html_block' || tokens[i].type === 'html_inline') && /^\s*<img\b/i.test(tokens[i].content.trim())) {
        const raw = tokens[i].content.trim();
        const srcMatch = raw.match(/src\s*=\s*"([^\"]+)"/i);
        const altMatch = raw.match(/alt\s*=\s*"([^\"]*)"/i);
        const src = srcMatch ? srcMatch[1] : '';
        const altRaw = (altMatch ? altMatch[1] : '').trim();
        const skipFigure = altRaw.startsWith('!');
        const altText = skipFigure ? altRaw.slice(1).trim() : altRaw;

        // If opt-out marker present, just enhance <img> and skip figure wrapping/numbering.
        if (skipFigure) {
          // Always use original image src, no thumbnail substitution.
          let sizeAttrs = '';
          if (src && /\.(png|jpe?g|webp|gif|svg)$/i.test(src)) {
            sizeAttrs = ' width="800" height="450"';
          }
          const loading = ' loading="lazy"';
          const altAttr = altText ? ` alt="${altText.replace(/"/g,'&quot;')}"` : ' alt=""';
  const plainImgHtml = `<img src="${src}"${altAttr}${loading}${sizeAttrs}>`;
          const imgBlock = new state.Token('html_block','',0); imgBlock.content = plainImgHtml;
          tokens.splice(i, 1, imgBlock);
          continue;
        }

        // Collect optional caption paragraphs after the image token
        let captionParts = [];
        let scan = i + 1;
        while (scan < tokens.length - 2 && tokens[scan].type === 'paragraph_open') {
          const maybeInline = tokens[scan + 1];
          const maybeClose = tokens[scan + 2];
            if (!(maybeInline && maybeInline.type === 'inline' && maybeClose && maybeClose.type === 'paragraph_close')) break;
            const txt = maybeInline.content.trim();
            if (!(txt.startsWith('*') && txt.endsWith('*'))) break;
            captionParts.push(txt.slice(1,-1).trim());
            scan += 3;
        }
        let body = '';
        if (captionParts.length) body = captionParts.join(' '); else if (altText) body = altText; else continue;
        let label;
        const first = captionParts[0] || altText;
        const numbered = /^Figure\s+(\d+)\.\s*(.*)$/.exec(first);
        if (numbered) {
          const existing = parseInt(numbered[1],10);
          figureCounter = Math.max(figureCounter, existing);
          label = `Figure ${existing}.`;
          if (captionParts.length) { captionParts[0] = numbered[2]; body = captionParts.join(' '); } else { body = numbered[2]; }
        } else {
          label = `Figure ${++figureCounter}.`;
        }
        // Always use original image src, no thumbnail substitution.
        let sizeAttrs = '';
        if (src && /\.(png|jpe?g|webp|gif|svg)$/i.test(src)) {
          sizeAttrs = ' width="800" height="450"';
        }
        const base = src ? path.basename(src).replace(/\.[^.]+$/,'') : `fig-${figureCounter}`;
        const slug = base.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
        const figId = `fig-${slug || figureCounter}`;
        // Build updated img HTML
        const aria = ` aria-describedby="${figId}"`;
        const loading = ' loading="lazy"';
        const altAttr = ` alt="${altText.replace(/"/g,'&quot;')}"`;
  const newImageHtml = `<img src="${src}"${altAttr}${aria}${loading}${sizeAttrs}>`;
        const syntheticInline = new state.Token('inline','',0);
        syntheticInline.content = newImageHtml;
        const figureHtml = `<figure class="figure">${newImageHtml}<figcaption id="${figId}"><span class="figure-label">${label}</span> ${body}</figcaption></figure>`;
        const figBlock = new state.Token('html_block','',0); figBlock.content = figureHtml;
        const removeLen = 1 + captionParts.length * 3; // image html token + caption paragraphs
        tokens.splice(i, removeLen, figBlock);
        continue;
      }
    }
  });

  // Strip leftover raw demarcation paragraphs produced when markdownTemplateEngine is disabled.
  md.core.ruler.after('inline', 'strip_raw_markers', function(state) {
    const tokens = state.tokens;
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type === 'paragraph_open') {
        const inline = tokens[i + 1];
        const close = tokens[i + 2];
        if (inline && inline.type === 'inline' && close && close.type === 'paragraph_close') {
          const content = inline.content.trim();
          if (content === '{% raw %}' || content === '{% endraw %}') {
            tokens.splice(i, 3);
            i -= 1;
          }
        }
      }
    }
  });

  // Register customized markdown-it instance with Eleventy
  eleventyConfig.setLibrary('md', md);
  
  // Collections
  eleventyConfig.addCollection("articles", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/articles/*.md")
      .filter(item => !item.inputPath.includes('_template'))
      .sort((a, b) => {
        return new Date(b.data.date) - new Date(a.data.date);
      });
  });

  // Derive unique article categories (tags) from frontmatter 'category'
  eleventyConfig.addCollection("articleCategories", function(collectionApi) {
    const articles = collectionApi.getFilteredByGlob("src/content/articles/*.md")
      .filter(item => !item.inputPath.includes('_template'));
    const categories = new Set();
    for (const a of articles) {
      if (a.data && a.data.category) {
        // 'category' is a comma-delimited string; each token is its own category.
        String(a.data.category)
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
          .forEach(c => categories.add(c));
      }
    }
    return Array.from(categories).sort((a,b) => a.localeCompare(b));
  });

  // Split a comma-delimited `category` string into a trimmed list of categories.
  eleventyConfig.addFilter("splitCategories", function(value) {
    if (!value) return [];
    return String(value).split(',').map(s => s.trim()).filter(Boolean);
  });
  
  // Filters
  eleventyConfig.addFilter("dateFormat", function(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  });
  
  eleventyConfig.addFilter("head", function(array, n) {
    if (!Array.isArray(array) || array.length === 0) {
      return [];
    }
    if (n < 0) {
      return array.slice(n);
    }
    return array.slice(0, n);
  });

  // Preprocessor: auto-wrap fenced code blocks that contain Nunjucks-like sequences ({{ or {%)
  // with {% raw %} ... {% endraw %} so Eleventy/Nunjucks won't attempt to render them.
  // Only available when Eleventy provides addPreprocessor (2.0+). Provide a graceful
  // fallback for older versions by later disabling markdownTemplateEngine.
  const hasPreprocessor = typeof eleventyConfig.addPreprocessor === 'function';
  if (hasPreprocessor) {
    eleventyConfig.addPreprocessor("md", (content/*, inputPath */) => {
      if (!content || !/\{[{%]/.test(content)) return content; // fast exit
      const RAW_OPEN = '{% raw %}';
      const RAW_CLOSE = '{% endraw %}';
      // Regex for fenced code blocks: ```lang(optional)\n...\n```
      const fenceRegex = /```[\w-]*[^\n]*\n[\s\S]*?```/g;
      return content.replace(fenceRegex, (block, offset) => {
        // Skip if already inside a raw wrapper (look behind for '{% raw %}' within previous 50 chars)
        const prefix = content.slice(Math.max(0, offset - 50), offset);
        if (prefix.includes(RAW_OPEN)) return block; // assume already wrapped
        if (block.includes('{{') || block.includes('{%')) {
          return `${RAW_OPEN}\n${block}\n${RAW_CLOSE}`;
        }
        return block;
      });
    });
  } else {
    console.warn('[11ty] addPreprocessor API not available; fenced code blocks containing template braces will rely on markdownTemplateEngine=false fallback. Consider upgrading @11ty/eleventy to >=2.0.');
  }
  
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts"
    },
    templateFormats: ["md", "njk", "html"],
    // If we have the preprocessor we can safely keep Nunjucks enabled inside Markdown.
    // Without it, disable Nunjucks processing for Markdown to avoid parsing {{ }} in code fences.
    markdownTemplateEngine: hasPreprocessor ? "njk" : false,
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk"
  };
};