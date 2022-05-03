import React from "react";
import { Link } from "gatsby"
import tw from 'tailwind-styled-components'

import { Dictionary } from "@src/types"

type PostCardProps = {
	data: Dictionary<string>
}

const CardWrapper = tw.article`
	w-max
	p-5
	max-w-md
	border-2
	rounded-xl
`

const FrontmatterWrapper = tw.div`
	flex
	justify-between
	align-middle
`

const PostTitle = tw(Link)`
	font-display
	font-bold
	text-2xl
`

const PostDate = tw.span`
	py-2
	font-sans
	text-sm
	text-primary-200
`

const PostExcerpt = tw.p`
	font-body
	text-lg
`

const PostCard: React.FunctionComponent<PostCardProps> = ({data}) => {
	return(
		<CardWrapper>
			<FrontmatterWrapper>
				<PostTitle to={`/posts/${data.slug}`}><h1>{data.frontmatter.title}</h1></PostTitle>
				<PostDate>{data.frontmatter.date}</PostDate>
			</FrontmatterWrapper>
			<PostExcerpt>{data.excerpt}</PostExcerpt>
		</CardWrapper>
	)
}

export default PostCard
