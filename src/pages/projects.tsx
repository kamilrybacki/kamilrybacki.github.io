import React from "react"
import { graphql, StaticQuery } from "gatsby"

import CardsWrapper from "@components/CardsWrapper"
import PostCard from "@components/PostCard" 
import PageWrapper from "@components/PageWrapper" 
import SubpageTitle from "@components/SubpageTitle"

const posts_query = graphql`
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
`

const PostsPage = () => {
	return(
    <>
      <PageWrapper>
        <SubpageTitle>My projects</SubpageTitle>
        <CardsWrapper>
          <StaticQuery
            query={posts_query}
            render={(query_result: object) => {
              const posts = query_result.allMdx.nodes
              return(
                posts.map((post: object) => <PostCard data={post} key={post.id} type="projects"/>)
              )
            }}
          />
        </CardsWrapper>
      </PageWrapper>
    </>
	)
} 

export default PostsPage
