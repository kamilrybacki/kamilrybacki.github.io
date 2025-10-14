const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function(eleventyConfig) {
  // Add plugins
  eleventyConfig.addPlugin(syntaxHighlight);
  
  // Copy static assets
  eleventyConfig.addPassthroughCopy("src/styles");
  eleventyConfig.addPassthroughCopy("public/images");
  eleventyConfig.addPassthroughCopy("public/article-filters.js");
  
  // Ignore template files and README
  eleventyConfig.ignores.add("src/content/**/_template.md");
  eleventyConfig.ignores.add("src/content/README.md");
  
  // Watch for changes
  eleventyConfig.addWatchTarget("src/styles/");
  
  // Markdown configuration (standard, no KaTeX)
  const md = require("markdown-it")({
    html: true,
    breaks: false, // do NOT turn single newlines into <br>
    linkify: true
  });
  // Render soft line breaks (single newline) as a single space so source-wrapped
  // Markdown doesn't generate <br> tags mid sentence.
  md.renderer.rules.softbreak = () => ' ';

  // Auto number figure captions: detect pattern Image token followed by paragraph starting/ending with * ... *
  md.core.ruler.after('inline', 'auto_figure_captions', function(state) {
    let figureIndex = 0;
    const tokens = state.tokens;
    for (let i = 0; i < tokens.length - 1; i++) {
      const t = tokens[i];
      const next = tokens[i + 1];
      if (t.type === 'inline' && t.children) {
        // check if inline contains only image token
        const imgChild = t.children.length === 1 && t.children[0].type === 'image' ? t.children[0] : null;
        if (imgChild && next && next.type === 'paragraph_open') {
          // paragraph text inline is two tokens ahead (paragraph_open -> inline -> paragraph_close)
          const inline = tokens[i + 2];
          const close = tokens[i + 3];
          if (inline && inline.type === 'inline' && close && close.type === 'paragraph_close') {
            const content = inline.content.trim();
            if (/^\*Figure\s+\d+\./.test(content) || /^\*Figure\s+\d+/.test(content)) {
              // already numbered, skip
              continue;
            }
            if (/^\*Figure/.test(content) || /^\*.+\*$/.test(content)) {
              // treat any italic line as caption to number
              figureIndex += 1;
              // ensure wrapped in *...*; inject number at start if not present
              let raw = content;
              const isItalic = raw.startsWith('*') && raw.endsWith('*');
              if (isItalic) raw = raw.slice(1, -1).trim();
              raw = `Figure ${figureIndex}. ${raw.replace(/^Figure\s+\d+\.\s*/, '')}`;
              inline.content = `*${raw}*`;
              // Also add a class to preceding image token via attrJoin
              const attrIndex = imgChild.attrIndex('class');
              if (attrIndex < 0) {
                imgChild.attrPush(['class', 'figure-img']);
              } else {
                imgChild.attrs[attrIndex][1] += ' figure-img';
              }
            }
          }
        }
      }
    }
  });
  eleventyConfig.setLibrary("md", md);

  // Remove paragraphs that consist solely of Eleventy raw demarcations left in the source
  // when markdownTemplateEngine is disabled. This prevents literal '{% raw %}' markers from
  // surfacing in the rendered HTML. We do this post-inline so tokens are available.
  md.core.ruler.after('inline', 'strip_raw_markers', function(state) {
    const tokens = state.tokens;
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type === 'paragraph_open') {
        const inline = tokens[i + 1];
        const close = tokens[i + 2];
        if (inline && inline.type === 'inline' && close && close.type === 'paragraph_close') {
          const content = inline.content.trim();
            if (content === '{% raw %}' || content === '{% endraw %}') {
              // Remove the three tokens representing this paragraph
              tokens.splice(i, 3);
              i -= 1; // adjust index
            }
        }
      }
    }
  });
  
  // Collections
  eleventyConfig.addCollection("articles", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/articles/*.md")
      .filter(item => !item.inputPath.includes('_template'))
      .sort((a, b) => {
        return new Date(b.data.date) - new Date(a.data.date);
      });
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