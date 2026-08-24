// Directory data for src/content/drafts/. Drafts are edited live in SilverBullet
// (this dir is the SilverBullet PVC mount in the Eleventy preview container) and
// render 1:1 with the blog in dev/serve/watch via article.njk. In a production
// build they are ignored entirely (see the ELEVENTY_RUN_MODE guard in
// .eleventy.js), so they never publish. Real drafts live on the PVC, not git.
module.exports = {
  layout: "article.njk",
};
