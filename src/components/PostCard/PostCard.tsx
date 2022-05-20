import React from 'react';
import {graphql, StaticQuery} from 'gatsby';

import {CardWrapper, FrontmatterWrapper,
  PostTitle, PostDate, PostExcerpt, ThumbnailMiniature} from './style';

type PostCardProps = {
    data: object
    type: string
}

const PostCard: React.FunctionComponent<PostCardProps> = ({data, type}) => {
  const thumbnailsQuery = graphql`
        query MiniatureQuery {
            allFile(filter: {relativePath: {regex: "/thumbnails/"}}) {
                edges {
                    node {
                        absolutePath
                        publicURL
                    }
                }
            }
        }
    `;
  return (
    <StaticQuery
      query={thumbnailsQuery}
      render = {(queryResult) => {
        return (
          <CardWrapper to={`/posts/${data.slug}`}>
            <FrontmatterWrapper>
              <PostTitle>{data.frontmatter.title}</PostTitle>
              <PostDate>🕑 {data.frontmatter.date}</PostDate>
            </FrontmatterWrapper>
            {
                data.frontmatter.thumbnail !== 'none' ? <>
                  <ThumbnailMiniature src={
                    queryResult.allFile.edges.map((edge: object) => {
                      const thumbnail = data.frontmatter.thumbnail;
                      const isPresent = edge.node.publicURL.includes(thumbnail);
                      if (isPresent && edge.node.absolutePath.includes(type)) {
                        return edge.node.publicURL;
                      }
                    } ).filter( Boolean )[0]
                  }/><PostExcerpt>
                    {data.frontmatter.abstract || data.excerpt}
                  </PostExcerpt></> : <PostExcerpt className="mt-10">
                    {data.frontmatter.abstract || data.excerpt}
                  </PostExcerpt>
            }
          </CardWrapper>
        );
      }}
    />
  );
};

export default PostCard;
