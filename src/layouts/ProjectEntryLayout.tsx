import React from "react";
import tw from 'tailwind-styled-components';
import styled from 'styled-components'
import { MDXRenderer } from "gatsby-plugin-mdx"
import { graphql, Link, StaticQuery } from "gatsby";

import Dictionary from 'types'
import PageWrapper from "@components/PageWrapper"

type ProjectEntryLayoutProps = {
	pageContext: Dictionary<string> | Dictionary
}

type SmallerGalleryProps = {
	pictures: Array<string>
}

type StackPresentationProps = {
	techs: Array<string>
}

const ProjectEntryLayoutWrapper = tw.article`
	w-fit
`

const ProjectPresentationHero = tw.div`
	flex
	justify-center
	align-middle
	w-full
	gap-4
`

const BigPicture = tw.img`
	bg-secondary-500
	border-8
	border-primary-500
	max-h-[30rem]
	max-w-[30rem]
`

const ContentWrapper = tw.main`
	flex
	flex-col
	align-middle
	justify-center
	mt-4
	px-5
	pt-3
	pb-10
	w-fit
	bg-secondary-500
`

const SmallerGalleryWrapper = tw.div`
	w-fit
`

const SmallPicture = tw.img`
	h-fit
	w-fit
	border-4
	border-primary-500
	max-h-[20rem]
	max-w-[20rem]
`

const SmallerGallery: React.FunctionComponent<SmallerGalleryProps> = ({pictures}) => {
	return(
		<SmallerGalleryWrapper>
			{pictures.map((picture: string) => <SmallPicture src={picture}/>)}
		</SmallerGalleryWrapper>
	)
}

const ProjectMetadata = tw.p`
	relative
	top-40
	flex
	flex-col
	w-1/4
	h-full
`

const PostTitle = tw.h1`
	font-display
	font-bold
	text-secondary-100
	text-5xl
	mb-4
	bg-primary-900
	p-3
	h-fit
	w-fit
	top-8
`

const StackPresentationWrapper = tw.div`
	mr-10
`

const StackPresentation: React.FunctionComponent<StackPresentationProps> = ({techs}) => {
	return(
		<StackPresentationWrapper>
			<hr className="border-0 h-1 mb-4 bg-primary-500"/>
			{techs.map((tech) => <h1>{tech.toUpperCase()}</h1>)}
		</StackPresentationWrapper>
	)
}

const ProjectEntryLayout: React.FunctionComponent<ProjectEntryLayoutProps> = ({pageContext: context}) => {
	const project_gallery_query = graphql`
		query ProjectsThumbnailQuery {
			allFile(filter: {relativePath: {regex: "/galleries/"}}) {
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
			query={project_gallery_query}
			render={(query_result: Dictionary<string>) => {
				const thumbnail_matches = query_result.allFile.edges.map(
					(edge: Dictionary<string>) => {
						if (edge.node.absolutePath.includes(`galleries/${context.frontmatter.gallery}`)){
							return edge.node.publicURL
						} 
					} 
				)
				return(
					<PageWrapper extraClass='w-fit'>
						<ProjectEntryLayoutWrapper>
							<ProjectPresentationHero>
								<ProjectMetadata>
									<PostTitle>{context.frontmatter.title}</PostTitle>
									<StackPresentation techs={context.frontmatter.techs}/>
								</ProjectMetadata>
								<BigPicture src={thumbnail_matches[0]}/>
								<SmallerGallery pictures={thumbnail_matches.slice(1)}/>
							</ProjectPresentationHero>
							<ContentWrapper>
								<MDXRenderer>{context.content}</MDXRenderer>
							</ContentWrapper>
						</ProjectEntryLayoutWrapper>
					</PageWrapper>
				)}
			}
		/>
	)
}

export default ProjectEntryLayout