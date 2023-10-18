import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import remarkCodeTitles from "remark-code-titles";
import robotsTxt from "astro-robots-txt";
import compress from "astro-compress";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://kamilrybacki.github.io/",
  integrations: [mdx({
    remarkPlugins: [remarkCodeTitles]
  }), tailwind({
    config: {
      applyBaseStyles: false
    }
  }), react(), robotsTxt(), compress(), sitemap()]
});