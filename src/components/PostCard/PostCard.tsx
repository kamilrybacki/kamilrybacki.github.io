import React from "react";
import { graphql, Link, StaticQuery } from "gatsby"
import tw from 'tailwind-styled-components'

import { Dictionary } from "@src/types"

type PostCardProps = {
	data: Dictionary<string>
	type: string
}

const CardWrapper = tw(Link)`
	p-5
	w-[25rem]
	h-[25rem]
	border-2
	duration-500
	shadow-[0.5rem_0.5rem_0_rgb(0,0,0)]
	hover:translate-x-[0.25rem]
	hover:translate-y-[0.25rem]
	hover:shadow-[0.25rem_0.25rem_0_rgb(0,0,0)]
	bg-secondary-500
`

const FrontmatterWrapper = tw.div`
	flex
	justify-between
	align-middle
`

const PostTitle = tw.h1`
	font-display
	font-bold
	text-2xl
	mr-5
`

const PostDate = tw.span`
	py-2
	font-sans
	text-sm
	text-primary-200
`

const ThumbnailMiniature = tw.img`
	mt-1
	mb-3
	border-3
`

const PostExcerpt = tw.p`
	text-justify
	font-body
	text-sm
	text-primary-400
	p-1
	overflow-hidden
	h-[4rem]
`

const PostCard: React.FunctionComponent<PostCardProps> = ({data, type}) => {
	const miniature_query = graphql`
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
	`
	return(
        <StaticQuery
          query={miniature_query}
		  render = {(query_result) => {
			const miniature_matches = query_result.allFile.edges.map(
				(edge: Dictionary<string>) => {
					if (edge.node.publicURL.includes(data.frontmatter.thumbnail)
						&& edge.node.absolutePath.includes(type)){
							console.log(edge.node.publicURL)
							return edge.node.publicURL
					} 
				} 
			).filter( Boolean )
			return(
				<CardWrapper to={`/posts/${data.slug}`}>
					<FrontmatterWrapper>
						<PostTitle>{data.frontmatter.title}</PostTitle>
						<PostDate>{data.frontmatter.date}</PostDate>
					</FrontmatterWrapper>
					<ThumbnailMiniature src={miniature_matches[0]}/>
					<PostExcerpt>{data.excerpt}</PostExcerpt>
				</CardWrapper>
			)
		  }}
		/>
	)
}

export default PostCard
