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
  
  // Markdown configuration
  eleventyConfig.setLibrary("md", require("markdown-it")({
    html: true,
    breaks: true,
    linkify: true
  }));
  
  // Collections
  eleventyConfig.addCollection("articles", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/articles/*.md")
      .filter(item => !item.inputPath.includes('_template'))
      .sort((a, b) => {
        return new Date(b.data.date) - new Date(a.data.date);
      });
  });
  
  eleventyConfig.addCollection("projects", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/projects/*.md")
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
  
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts"
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk"
  };
};