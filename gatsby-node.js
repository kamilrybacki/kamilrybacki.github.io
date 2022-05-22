module.exports.createPages = async ({graphql, actions, reporter}) => {
  const {createPage} = actions;

  const postsResult = await graphql(`
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
    }`);

  const projectsResult = await graphql(`
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
    }`);

  if (postsResult.errors || projectsResult.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query.`);
    return;
  }

  postsResult.data.allMdx.edges.forEach(({node}) => {
    const path = `/posts/${node.slug}`;
    createPage({
      path,
      component: require.resolve('./src/layouts/blog/layout.tsx'),
      context: {
        pagePath: path,
        frontmatter: {
          title: node.frontmatter.title,
          date: node.frontmatter.date,
          tags: node.frontmatter.tags.split(' ') || [],
          thumbnail: node.frontmatter.thumbnail,
        },
        content: node.body,
      }});
  });

  projectsResult.data.allMdx.edges.forEach(({node}) => {
    const path = `/projects/${node.slug}`;

    createPage({
      path,
      component: require.resolve('./src/layouts/projects/layout.tsx'),
      context: {
        pagePath: path,
        frontmatter: {
          title: node.frontmatter.title,
          date: node.frontmatter.date,
          tags: node.frontmatter.tags.split(' ') || [],
          thumbnail: node.frontmatter.thumbnail,
          gallery: node.frontmatter.gallery,
          techs: node.frontmatter.techs.split(' ') ?? [],
          abstract: node.frontmatter.abstract,
          link: node.frontmatter.link || '',
          readme: node.frontmatter.readme || '',
        },
        content: node.body,
      }});
  });
};
