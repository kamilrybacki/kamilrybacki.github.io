import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import remarkCodeTitles from "remark-code-titles";
import robotsTxt from "astro-robots-txt";
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://kamilrybacki.github.io/",
  integrations: [mdx({
    remarkPlugins: [remarkCodeTitles, remarkMath],
    rehypePlugins: [rehypeKatex]
  }), tailwind({
    config: {
      applyBaseStyles: false
    }
  }), react(), robotsTxt(), sitemap()]
});