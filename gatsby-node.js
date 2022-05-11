const fetch = require('node-fetch');

module.exports.createPages = async ({ graphql, actions, reporter }) => {
    const { createPage } = actions
    const posts_result = await graphql(`
      {
        allMdx(
            sort: {fields: [frontmatter___date]}
            filter: {fileAbsolutePath: {regex: "/\/posts\//"}}
        ) {
            edges {
                node {
                    frontmatter {
                        date(formatString: "MM/DD/YYYY")
                        title
                        tags
                        thumbnail
                    }
                    slug
                    timeToRead
                    body
                }
            }
        }
    }`)

    const projects_result = await graphql(`
      {
        allMdx(
            sort: {fields: [frontmatter___date]}
            filter: {fileAbsolutePath: {regex: "/\/projects\//"}}
        ) {
            edges {
                node {
                    frontmatter {
                        date(formatString: "MM/DD/YYYY")
                        title
                        tags
                        thumbnail
                        gallery
                        techs
                        abstract
                        link
                        readme
                    }
                    slug
                    timeToRead
                    body
                }
            }
        }
    }`)

    if (posts_result.errors || projects_result.errors) {
        reporter.panicOnBuild(`Error while running GraphQL query.`)
        return
    }

    posts_result.data.allMdx.edges.forEach(({ node }) => {
        const path = `/posts/${node.slug}`
        createPage({
            path,
            component: require.resolve("./src/layouts/BlogPostLayout.tsx"),
            context: {
                pagePath: path,
                frontmatter: {
                    title: node.frontmatter.title,
                    date: node.frontmatter.date,
                    tags: node.frontmatter.tags.split(" ") || [],
                    time: node.timeToRead,
                    thumbnail: node.frontmatter.thumbnail,
                },
                content: node.body,
        }})
    })

    projects_result.data.allMdx.edges.forEach(({ node }) => {
        const tech_names = node.frontmatter.techs.split(" ")
        const path = `/posts/${node.slug}`

        let found_icons = []
        
        fetch("https://api.github.com/repos/get-icon/geticon/branches/master").then((response) => response.json())
        .then((master_data) => master_data.commit.sha).then((latest_sha) => {
            return fetch(`https://api.github.com/repos/get-icon/geticon/git/trees/${latest_sha}`).then(response => response.json())
            .then((contents) => {
                const master_tree = contents.tree
                const icons_tree_url = master_tree.filter((tree_node) => tree_node.path == "icons")[0].url
                return fetch(icons_tree_url).then(response => response.json()).then((contents) => contents.tree)
                .then((icons_tree_data) => {
                    icons_tree_data.forEach((icon_entry) => {
                        const icon_name = icon_entry.path.replace(".svg","").replace("-icon","")
                        if (tech_names.includes(icon_name)) {
                            if (found_icons.includes(`https://raw.githubusercontent.com/get-icon/geticon/master/icons/${icon_name}.svg`)) {
                                const index = found_icons.indexOf(`https://raw.githubusercontent.com/get-icon/geticon/master/icons/${icon_name}.svg`)
                                found_icons[index] =`https://raw.githubusercontent.com/get-icon/geticon/master/icons/${icon_name}-icon.svg` 
                            }
                            else {
                                found_icons.push(`https://raw.githubusercontent.com/get-icon/geticon/master/icons/${icon_name}.svg`)
                            }
                        }
                    })
                })
            })
        })

        createPage({
            path,
            component: require.resolve("./src/layouts/ProjectEntryLayout.tsx"),
            context: {
                pagePath: path,
                frontmatter: {
                    title: node.frontmatter.title,
                    date: node.frontmatter.date,
                    tags: node.frontmatter.tags.split(" ") || [],
                    time: node.timeToRead,
                    thumbnail: node.frontmatter.thumbnail,
                    gallery: node.frontmatter.gallery,
                    techs: found_icons || [],
                    abstract: node.frontmatter.abstract,
                    link: node.frontmatter.link || '',
                    readme: node.frontmatter.readme || ''
                },
                content: node.body,
        }})
    })
}