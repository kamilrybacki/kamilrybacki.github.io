import React from "react";
import tw from 'tailwind-styled-components';
import { MDXRenderer } from "gatsby-plugin-mdx"
import { Link } from "gatsby";

import PageWrapper from "@components/PageWrapper"

type BlogPostLayoutProps = {

}

const BlogPostLayoutWrapper = tw.article`
`

const FrontmatterWrapper = tw.div`
	flex
	justify-between
`

const PostTitle = tw.h1`
	font-display
	font-bold
	text-accent-600
	text-5xl
	mb-4
`

const PostDate = tw.time`
	font-sans
	text-sm
`

const TagsWrapper = tw.menu`
	flex
	mb-10
	h-2
`

const TagsLabel = tw.span`
	font-sans
	text-sm
	text-primary-300
	mr-2
`

const TagLink = tw(Link)`
	h-max
	w-max
	mr-2
	px-2
	py-0.25
	rounded-sm
	bg-primary-100
	font-display
	text-sm
	text-primary-600

	hover:-translate-x-0.5
	hover:-translate-y-0.5
`

const ContentWrapper = tw.main`
	flex
	flex-col
	align-middle
	justify-center
	px-5
`

const BlogPostLayout: React.FunctionComponent<BlogPostLayoutProps> = ({pageContext: context}) => {
	return(
		<PageWrapper>
			<BlogPostLayoutWrapper>
				<FrontmatterWrapper>
					<PostTitle>{context.frontmatter.title}</PostTitle>
					<PostDate>Date published: {context.frontmatter.date}</PostDate>
				</FrontmatterWrapper>
				<TagsWrapper>
					<TagsLabel>Tags:</TagsLabel>
					{context.frontmatter.tags.map((tag) => <TagLink to={`/posts/_by-tag/${tag}`} key={tag}>{tag}</TagLink>)}
				</TagsWrapper>
				<ContentWrapper>
					<MDXRenderer>{context.content}</MDXRenderer>
				</ContentWrapper>
			</BlogPostLayoutWrapper>
		</PageWrapper>
	)
}

export default BlogPostLayout