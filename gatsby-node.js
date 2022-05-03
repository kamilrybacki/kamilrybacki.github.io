
exports.createPages = async ({ graphql, actions, reporter }) => {
    const { createPage } = actions
    const result = await graphql(`
      {
        allMdx(sort: {fields: [frontmatter___date]}) {
            edges {
                node {
                    frontmatter {
                        date(formatString: "MM/DD/YYYY")
                        title
                        tags
                    }
                    slug
                    timeToRead
                    body
                }
            }
        }
    }`)

    if (result.errors) {
        reporter.panicOnBuild(`Error while running GraphQL query.`)
        return
    }

    result.data.allMdx.edges.forEach(({ node }) => {
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
                    time: node.timeToRead
                },
                content: node.body,
        }})
    })
}