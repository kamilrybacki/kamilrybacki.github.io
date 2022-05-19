import React from "react";
import { graphql, Link, StaticQuery } from "gatsby"
import tw from "tailwind-styled-components"

type PostCardProps = {
	data: object
	type: string
}

const CardWrapper = tw(Link)`
	p-5
	border-2
	duration-500
	bg-secondary-50

	hover:-translate-x-[0.5rem]
	hover:-translate-y-[0.5rem]
	hover:shadow-[0.25rem_0.25rem_0_rgb(0,0,0)]

	md:w-1/4
`

const FrontmatterWrapper = tw.div`
	flex
	justify-between
	align-middle
	mb-4
`

const PostTitle = tw.h1`
	font-heading
	font-bold
	text-2xl
	underline
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
	mb-5
`

const PostExcerpt = tw.p`
	text-justify
	font-sans
	text-sm
	text-primary-400
	p-1
	overflow-x-hidden
	h-full
`

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
	`
	return(
        <StaticQuery
          query={thumbnailsQuery}
		  render = {(queryResult) => {
			return(
				<CardWrapper to={`/posts/${data.slug}`}>
					<FrontmatterWrapper>
						<PostTitle>{data.frontmatter.title}</PostTitle>
						<PostDate>🕑 {data.frontmatter.date}</PostDate>
					</FrontmatterWrapper> 
					{
						data.frontmatter.thumbnail !== 'none' ? <>
							<ThumbnailMiniature src={
								queryResult.allFile.edges.map((edge: object) => {
										if (edge.node.publicURL.includes(data.frontmatter.thumbnail)
											&& edge.node.absolutePath.includes(type)){
												return edge.node.publicURL
										} 
									} ).filter( Boolean )[0]
							}/><PostExcerpt>
								{data.frontmatter.abstract || data.excerpt}
							</PostExcerpt></> : <PostExcerpt className="mt-10">
								{data.frontmatter.abstract || data.excerpt}
							</PostExcerpt>  
					}
				</CardWrapper>
			)
		  }}
		/>
	)
}

export default PostCard
