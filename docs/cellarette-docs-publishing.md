# Cellarette user documentation

`public/cellarette/` is generated from `site/` in the Cellarette project.
The canonical source is the project, not these generated HTML files.

To update:

1. In Cellarette, run `npm run docs:build` and `npm run docs:check`.
2. Exercise changed runnable examples against the matching application version.
3. Synchronize only the generated `_site/` into this repository's
   `public/cellarette/`; remove stale generated files when pages are renamed.
4. Run `npm ci && npm run build` here. Eleventy copies this directory to
   `_site/cellarette/` without applying blog templates.
5. Use a PR and the existing GitHub Pages workflow to publish.
6. Check the public index, guides, search index, assets and mobile navigation.

The source deck's Space Grotesk / Space Mono fonts, muted green palette,
chamfered frames and dither artwork define the documentation style. Bundled
font notices and licenses are included in `public/cellarette/assets/`.
Project naming and public URLs are configured in the canonical source's
`site/config.json`; a rename must regenerate the output and update the copy
mapping in `.eleventy.js` if the route changes.

Only user-facing documentation is published. Do not copy the application's
internal `docs/`, local YAML configuration, environment files or operational
secrets into this public tree.
