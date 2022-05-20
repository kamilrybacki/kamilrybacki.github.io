import React from 'react';
import {graphql, StaticQuery} from 'gatsby';
import tw from 'tailwind-styled-components';

import CardsWrapper from '@components/CardsWrapper';
import PostCard from '@components/PostCard';
import PageWrapper from '@components/PageWrapper';

const SubpageTitle = tw.h1`
    text-5xl
    font-heading
    font-bold
    text-accent-500
    tracking-tighter
    mb-10
`;

const postsQuery = graphql`
  query ProjectsQuery {
    allMdx(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: {fileAbsolutePath: {regex: "/\/projects\//"}}
    ) {
      nodes {
        id
        excerpt(pruneLength: 250)
        frontmatter {
          title
          date(formatString: "DD/MM/YY")
          thumbnail
          gallery
          techs
          abstract
        }
        slug
      }
    }
  }
`;

const PostsPage = () => {
  return (
    <>
      <PageWrapper>
        <SubpageTitle>My projects</SubpageTitle>
        <CardsWrapper>
          <StaticQuery
            query={postsQuery}
            render={(queryResult: object) => {
              const posts = queryResult.allMdx.nodes;
              return (
                posts.map((post: object) => {
                  return (
                    <PostCard data={post} key={post.id} type="projects"/>
                  );
                })
              );
            }}
          />
        </CardsWrapper>
      </PageWrapper>
    </>
  );
};

export default PostsPage;
