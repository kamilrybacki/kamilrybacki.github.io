import React from "react";
import {useEffect, useState} from "react";

import tw from 'tailwind-styled-components';
import { MDXRenderer } from "gatsby-plugin-mdx"
import { graphql, StaticQuery } from "gatsby";
import Skeleton from 'react-loading-skeleton'

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
	justify-center
	align-middle
	w-full
	gap-4
	h-fit
`

const BigPicture = tw.img`
	relative
	top-10
	bg-secondary-500
	border-8
	border-primary-500
	max-w-lg
	h-fit
	hover:-translate-x-1
	hover:-translate-y-1
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
	flex-col
	gap-4
	w-fit
	h-fit
`

const SmallPicture = tw.img`
	border-4
	border-primary-500
	max-w-md
	h-fit
	hover:-translate-x-1
	hover:-translate-y-1
`

const SmallerGallery: React.FunctionComponent<SmallerGalleryProps> = ({pictures}) => {
	return(
		<SmallerGalleryWrapper>
			{pictures.map((picture: string, index: number) => <SmallPicture src={picture} key={`smpic_${index}`}/>)}
		</SmallerGalleryWrapper>
	)
}

const ProjectMetadata = tw.div`
	relative
	top-20
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
	px-4
	py-2
	h-fit
	w-fit
	top-8
`

const StackPresentationWrapper = tw.div`
	flex
	mr-10
	mt-3
	bg-secondary-500
	p-4
	border-2
	rounded-lg
	border-primary-500
	h-48
	overflow-x-hidden
	overflow-y-scroll
	overscroll-contain
	scrollbar-thin

`

const StackIcon = tw.img`
	w-8
	h-8
	mr-5
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
			{icons.map((icon_url, index) => <StackIcon key={`stack_${index}`} src={icon_url}/>) || <Skeleton/>}
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
									<p className="mt-1 underline text-lg font-mono tracking-tighter font-bold">Tech Stack:</p>
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