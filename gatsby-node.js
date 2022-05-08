
exports.createPages = async ({ graphql, actions, reporter }) => {
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
            component: require.resolve('./src/layouts/BlogPostLayout.tsx'),
            context: {
                pagePath: path,
                frontmatter: {
                    title: node.frontmatter.title,
                    date: node.frontmatter.date,
                    tags: node.frontmatter.tags.split(' ') || [],
                    time: node.timeToRead,
                    thumbnail: node.frontmatter.thumbnail,
                },
                content: node.body,
        }})
    })

    projects_result.data.allMdx.edges.forEach(({ node }) => {
        const path = `/posts/${node.slug}`
        createPage({
            path,
            component: require.resolve('./src/layouts/ProjectEntryLayout.tsx'),
            context: {
                pagePath: path,
                frontmatter: {
                    title: node.frontmatter.title,
                    date: node.frontmatter.date,
                    tags: node.frontmatter.tags.split(' ') || [],
                    time: node.timeToRead,
                    thumbnail: node.frontmatter.thumbnail,
                    gallery: node.frontmatter.gallery,
                    techs: node.frontmatter.techs.split(' ') || [],
                    abstract: node.frontmatter.abstract
                },
                content: node.body,
        }})
    })
}