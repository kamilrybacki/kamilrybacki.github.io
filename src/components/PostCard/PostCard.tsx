import React from 'react';
import {graphql, StaticQuery} from 'gatsby';

import {CardWrapper, FrontmatterWrapper,
  PostTitle, PostDate, PostExcerpt, ThumbnailMiniature} from './style';

import {MiniaturesQuery, Edge, Mdx} from '@root/graphql-types';

type PostCardProps = {
    data: Mdx
    type: string
}

const PostCard: React.FunctionComponent<PostCardProps> = ({data, type}) => {
  const miniaturesQuery = graphql`
        query Miniatures {
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
      query={miniaturesQuery}
      render = {(queryResult: MiniaturesQuery) => {
        return (
          <CardWrapper to={`/${type}/${data.slug}`}>
            <FrontmatterWrapper>
              <PostTitle>{data.frontmatter.title}</PostTitle>
              <PostDate>🕑 {data.frontmatter.date}</PostDate>
            </FrontmatterWrapper>
            {
                data.frontmatter.thumbnail !== 'none' ? <>
                  <ThumbnailMiniature src={
                    queryResult.allFile.edges.map((edge: Edge) => {
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
