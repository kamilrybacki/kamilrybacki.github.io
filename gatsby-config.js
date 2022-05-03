
module.exports = {
  siteMetadata: {
    title: `Kamil Rybacki"s site`,
    siteUrl: `https://kamilrybacki.github.io`
  },
  plugins: [
    "gatsby-plugin-styled-components", "gatsby-plugin-image", 
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
          "@projects": "assets/projects",
          "@components": "src/components",
          "@pages": "src/pages"
        },
        extensions: ["js","ts","tsx","jsx"]
      }
    },{
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
        "path": "./content/posts/"
      },
      __key: "posts"
    }, {
      resolve: "gatsby-source-filesystem",
      options: {
        "name": "projects",
        "path": "./content/projects/"
      },
      __key: "projects"
    },{
      resolve: `gatsby-plugin-mdx`,
      options: {
        defaultLayouts: {
          default: require.resolve('./src/layouts/DefaultLayout.tsx'),
          posts: require.resolve('./src/layouts/BlogPostLayout.tsx'),
          project: require.resolve('./src/layouts/ProjectEntryLayout.tsx'),
        },
        extensions: ['.mdx', '.md']
      }
    }]
  };
