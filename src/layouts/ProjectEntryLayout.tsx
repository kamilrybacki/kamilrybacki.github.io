import React from "react";
import {useEffect, useState} from "react";

import tw from 'tailwind-styled-components';
import { MDXRenderer } from "gatsby-plugin-mdx"
import { graphql, StaticQuery } from "gatsby";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

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
	md:overflow-hidden
`

const BigPicture = tw.img`
	bg-secondary-500
	mb-4
	border-8
	border-primary-500
	max-w-sm
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

	md:overflow-hidden
	md:flex-col
`

const SmallPicture = tw.img`
	border-4
	border-primary-500
	max-w-sm
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

const StackPresentationWrapper = tw.div`
	flex
	flex-wrap
	flex-auto
	justify-between
	bg-secondary-500
	px-3
	my-5
	border-2
	rounded-lg
	border-primary-500
	overflow-x-hidden
	overflow-y-scroll
	overscroll-contain
	scrollbar-thin

	md:mt-3
	md:mr-10
	md:py-6
`

const StackIcon = tw.img`
	my-1
	w-5
	h-5
	md:w-10
	md:h-10
	mx-3
`

const StackPresentation: React.FunctionComponent<StackPresentationProps> = ({techs}) => {
	const [icons, setIcons] = useState([])

	useEffect(()=>{
		fetch('https://api.github.com/repos/get-icon/geticon/branches/master').then((response) => response.json())
		.then((master_data: Dictionary) => master_data.commit.sha).then((latest_sha: string) => {
			return fetch(`https://api.github.com/repos/get-icon/geticon/git/trees/${latest_sha}`).then(response => response.json())
			.then((contents: Dictionary) => {
				const master_tree = contents.tree
				const icons_tree_url = master_tree.filter((tree_node: Dictionary) => tree_node.path == 'icons')[0].url
				return fetch(icons_tree_url).then(response => response.json()).then((contents: Dictionary) => contents.tree)
				.then((icons_tree_data: Array<Dictionary>) => {
					let found_icons: Array<string> = []
					icons_tree_data.forEach((icon_entry: Dictionary) => {
						const icon_name = icon_entry.path.replace('.svg','').replace('-icon','')
						if (techs.includes(icon_name)) {
							if (found_icons.includes(`https://raw.githubusercontent.com/get-icon/geticon/master/icons/${icon_name}.svg`)) {
								const index = found_icons.indexOf(`https://raw.githubusercontent.com/get-icon/geticon/master/icons/${icon_name}.svg`)
								found_icons[index] =`https://raw.githubusercontent.com/get-icon/geticon/master/icons/${icon_name}-icon.svg` 
							}
							else {
								found_icons.push(`https://raw.githubusercontent.com/get-icon/geticon/master/icons/${icon_name}.svg`)
							}
						}
					})
					setIcons(found_icons)
				})
			})
		})
	}, [])

	return(
		<StackPresentationWrapper>
			{icons.map((icon_url, index) => {
				return(<StackIcon key={`stack_${index}`} src={icon_url} alt={icon_url.split('/').at(-1).replace('.svg','')}/>)
			}) || <Skeleton count={2}/>}
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