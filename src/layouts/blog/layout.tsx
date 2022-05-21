import React from 'react';
import {graphql, StaticQuery} from 'gatsby';

import BlogBody from './body';

import {Mdx, Node} from '@root/graphql-types.ts';

type BlogPostLayoutProps = {
    pageContext: Mdx
}

const postsThumbnailsQuery = graphql`
        query PostsThumbnails {
            allFile(filter: {relativePath: {regex: "/thumbnails/posts/"}}) {
                edges {
                    node {
                        publicURL
                    }
                }
            }
        }
  `;

const BlogPostLayout: React.FunctionComponent<BlogPostLayoutProps> = ({pageContext: context}) => {
  return (
    <StaticQuery
      query={postsThumbnailsQuery}
      render={(postsThumbnailsList: Mdx) => {
        const firstMatchingThumbnail = postsThumbnailsList.allFile.edges.map(
            (edge: Node) => {
              if (edge.node.publicURL.includes(context.frontmatter.thumbnail)) {
                return edge.node.publicURL;
              }
            },
        )[0];
        return (
          <BlogBody
            thumbnailUrl={firstMatchingThumbnail}
            title={context.frontmatter.title}
            tags={context.frontmatter.tags}
            date={context.frontmatter.date}
            content={context.content}
          />
        );
      }}/>
  );
};

export default BlogPostLayout;
