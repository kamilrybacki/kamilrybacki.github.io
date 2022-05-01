import type { GatsbyConfig } from "gatsby";

const config: GatsbyConfig = {
  siteMetadata: {
    title: `Kamil Rybacki"s site`,
    siteUrl: `https://kamilrybacki.github.io`
  },
  plugins: [
    "gatsby-plugin-styled-components", "gatsby-plugin-image", "gatsby-plugin-mdx", 
    "gatsby-plugin-sharp", "gatsby-transformer-sharp", "gatsby-plugin-postcss", 
    { 
      resolve: `gatsby-plugin-alias-imports`,
      options: {
        alias: {
          "@src": "src",
          "@style": "src/style",
          "@images": "assets/images",
          "@templates": "assets/templates",
          "@posts": "assets/posts",
          "@components": "src/components",
          "@pages": "src/pages"
        },
        extensions: ["js","ts","tsx","jsx"]
      }
    }, {
      resolve: "gatsby-source-filesystem",
      options: {
        "name": "images",
        "path": "./assets/images/"
      },
      __key: "images"
    }, {
      resolve: "gatsby-source-filesystem",
      options: {
        "name": "pages",
        "path": "./src/pages/"
      },
      __key: "pages"
    }, {
      resolve: "gatsby-source-filesystem",
      options: {
        "name": "posts",
        "path": "./assets/posts/"
      },
      __key: "posts"
    }]
};

export default config;
