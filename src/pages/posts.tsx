// @ts-nocheck
import React from 'react';
import {graphql, StaticQuery} from 'gatsby';
import tw from 'tailwind-styled-components';

import CardsWrapper from '@components/CardsWrapper';
import PostCard from '@components/PostCard';
import PageWrapper from '@components/PageWrapper';

import {PostsQuery, Node} from '@root/graphql-types';

const SubpageTitle = tw.h1`
    text-5xl
    font-heading
    font-bold
    text-accent-500
    tracking-tighter
    mb-10
`;

const postsQuery = graphql`
  query Posts {
    allMdx(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: {fileAbsolutePath: {regex: "/\/posts\//"}}
    ) {
      nodes {
        id
        excerpt(pruneLength: 250)
        frontmatter {
          title
          date(formatString: "DD/MM/YY")
          thumbnail
        }
        slug
      }
    }
  }
`;

const PostsPage = () => {
  return (
    <PageWrapper>
      <SubpageTitle>Posts</SubpageTitle>
      <CardsWrapper>
        <StaticQuery
          query={postsQuery}
          render={(queryResult: PostsQuery) => {
            const posts = queryResult.allMdx.nodes;
            return (
              posts.map((post: Node) => {
                return (
                  <PostCard data={post} key={post.id} type="posts"/>
                );
              })
            );
          }}
        />
      </CardsWrapper>
    </PageWrapper>
  );
};

export default PostsPage;
