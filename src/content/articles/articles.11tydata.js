// Directory data for articles.
//
// Makes the `draft: true` front-matter flag actually mean something at build
// time. Historically the `articles` collection in .eleventy.js did not filter
// drafts, so any article with `draft: true` was still rendered and listed.
//
// Behaviour:
//   * Production build (`npm run build`, i.e. ELEVENTY_RUN_MODE === "build"):
//       draft articles are excluded from every collection AND no page is
//       generated for them (permalink: false). They stay completely invisible
//       on the live site until you flip `draft: false`.
//   * Local dev (`npm run dev`, serve/watch): drafts render normally so you
//       can preview work-in-progress — including freshly transcribed audio
//       drafts — before publishing.
//
// This applies to BOTH manually written articles and audio-transcribed drafts.

const isProductionBuild = process.env.ELEVENTY_RUN_MODE === "build";

module.exports = {
  eleventyComputed: {
    // Hide draft pages from collections in production only.
    eleventyExcludeFromCollections: (data) =>
      isProductionBuild && data.draft === true,
    // Skip writing the page entirely in production when it's a draft.
    permalink: (data) => {
      if (isProductionBuild && data.draft === true) {
        return false;
      }
      // Fall back to Eleventy's default permalink behaviour otherwise.
      return data.permalink;
    },
  },
};
