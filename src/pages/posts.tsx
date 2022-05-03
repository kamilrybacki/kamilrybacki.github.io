import React from "react"
import { graphql, StaticQuery } from "gatsby"

import CardsWrapper from "@components/CardsWrapper"
import { Dictionary } from "@src/types"
import PostCard from "@components/cards/PostCard" 
import PageWrapper from "@components/PageWrapper" 
import SubpageTitle from "@components/SubpageTitle"

const posts_query = graphql`
  query SITE_INDEX_QUERY {
    allMdx(sort: { fields: [frontmatter___date], order: DESC }) {
      nodes {
        id
        excerpt(pruneLength: 250)
        frontmatter {
          title
          date(formatString: "YYYY MMMM Do")
        }
        slug
      }
    }
  }
`

const PostsPage = () => {
	return(
		<PageWrapper>
			<SubpageTitle>Posts</SubpageTitle>
      <CardsWrapper>
        <StaticQuery
          query={posts_query}
          render={(query_result: Dictionary<string>) => {
            const posts = query_result.allMdx.nodes
            return(
              posts.map((post: Dictionary<string>) => <PostCard data={post} key={post.id}/>)
            )
          }}
        />
      </CardsWrapper>
		</PageWrapper>
	)
} 

export default PostsPage
