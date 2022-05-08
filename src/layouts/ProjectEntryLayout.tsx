import React from "react";

import tw from 'tailwind-styled-components';
import { MDXRenderer } from "gatsby-plugin-mdx"
import { graphql, StaticQuery } from "gatsby";
import 'react-loading-skeleton/dist/skeleton.css'

import Dictionary from 'types'
import PageWrapper from "@components/PageWrapper"
import StackPresentation from "@components/StackPresentation"

type ProjectEntryLayoutProps = {
	pageContext: Dictionary<string> | Dictionary
}

type SmallerGalleryProps = {
	pictures: Array<string>
}

const ProjectEntryLayoutWrapper = tw.article`
	w-full
`

const ProjectPresentationHero = tw.div`
	flex
	flex-col
	w-full
	gap-4
	h-fit

	md:flex-row
	md:justify-center
	md:align-middle
`

const GalleryWrapper = tw.section`
	flex
	flex-row
	gap-5
	overflow-x-scroll
	scrollbar-thin

	md:overflow-hidden
`

const BigPicture = tw.img`
	bg-secondary-500
	mb-4
	border-8
	border-primary-500
	max-w-2
	h-fit

	md:mb-0
	md:max-w-lg
	md:relative
	md:top-10
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
	flex
	flex-row
	align-middle
	justify-center
	m-auto
	gap-4
	w-fit
	h-fit
	overflow-x-scroll
	scrollbar-thin

	md:overflow-x-hidden
	md:overflow-y-scroll
	md:flex-col
`

const SmallPicture = tw.img`
	border-4
	border-primary-500
	max-w-2
	h-fit
	m-auto

	md:max-w-md
`

const SmallerGallery: React.FunctionComponent<SmallerGalleryProps> = ({pictures}) => {
	return(
		<SmallerGalleryWrapper>
			{pictures.map((picture: string, index: number) => <SmallPicture src={picture} key={`smpic_${index}`}/>)}
		</SmallerGalleryWrapper>
	)
}

const ProjectMetadata = tw.div`
	flex
	flex-col
	h-full

	md:relative
	md:top-20
	md:w-1/4
`

const PostTitle = tw.h1`
	font-display
	font-bold
	text-secondary-100
	text-4xl
	mb-4
	bg-primary-900
	px-4
	py-2
	h-fit
	w-fit
	md:top-8
`

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
					<PageWrapper extraClass='w-full'>
						<ProjectEntryLayoutWrapper>
							<ProjectPresentationHero>
								<ProjectMetadata>
									<PostTitle>{context.frontmatter.title}</PostTitle>
									<p className="mt-1 underline text-sm md:text-lg font-mono tracking-tighter font-bold">Tech Stack:</p>
									<StackPresentation techs={context.frontmatter.techs}/>
								</ProjectMetadata>
								<GalleryWrapper>
									<BigPicture src={thumbnail_matches[0]}/>
									<SmallerGallery pictures={thumbnail_matches.slice(1)}/>
								</GalleryWrapper>
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