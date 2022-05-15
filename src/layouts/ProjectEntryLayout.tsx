import React, { useEffect } from "react";

import tw from "tailwind-styled-components";
import { graphql, StaticQuery } from "gatsby";

import PageWrapper from "@components/PageWrapper"
import StackPresentation from "@components/StackPresentation"
import StyledMarkdown from "@components/StyledMarkdown"
import StyledSpinner from "@components/StyledSpinner"

type ProjectEntryLayoutProps = {
	pageContext: object
}

type SmallerGalleryProps = {
	pictures: Array<string>
}

const ProjectEntryLayoutWrapper = tw.article`
	w-full
`

const ProjectTitle = tw.h1`
	font-heading
	font-bold
	text-primary-500
	text-3xl
	mb-8
	bg-primary-100
	px-4
	pt-3
	pb-2
	h-fit
	text-center
	border-2
	border-primary-200

	max-w-full
	md:text-6xl
	md:pt-5
	md:pb-3
	md:top-8
	md:mb-12
	md:text-left
`

const ProjectPresentationHero = tw.div`
	flex
	flex-col
	w-full
	gap-4
	h-fit

	md:h-1/3
	md:flex-row
	md:justify-center
	md:align-middle
	md:gap-10
	
	lg:h-fit
	lg:gap-20
`

const GalleryWrapper = tw.section`
	flex
	flex-nowrap
	gap-5
	overflow-x-scroll
	overflow-y-hidden

	md:flex-col
	md:gap-0
	md:overflow-x-hidden
	md:overflow-y-scroll
	md:w-[50vw]

	lg:w-fit
	lg:flex-row
	lg:gap-5
	lg:overflow-hidden
`

const BigPicture = tw.img`
	bg-secondary-500
	mb-4
	border-8
	border-primary-500
	w-screen
	h-fit

	md:w-full
	md:mb-0

	lg:max-w-lg
	lg:relative
	lg:top-10
`

const ContentWrapper = tw.main`
	flex
	flex-col
	align-middle
	justify-center
	mt-2
	pb-10
	w-full
	bg-secondary-500

	md:mt-4
`

const ReadmeButton = tw.button`
	mx-auto
	my-5
	p-2
	text-sans
	font-bold
	border-[1px]	
	border-primary-500
	border-dashed

	hover:translate-y-1
	hover:border-solid
	hover:bg-accent-100

	active:bg-accent-500
`

const SmallerGalleryWrapper = tw.div`
	relative
	flex
	flex-row
	flex-nowrap
	flex-shrink-0
	align-middle
	justify-center
	m-auto
	gap-4
	h-full
	scrollbar-thin

	md:h-fit
	md:mt-14
	md:overflow-x-hidden
	md:overflow-y-scroll
	md:flex-col
`

const SmallPicture = tw.img`
	border-4
	border-primary-500
	w-screen
	lg:w-[25vw]
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

	md:relative
	md:w-1/4
`

const Abstract = tw.p`
	font-sans
	text-xl
	w-full
	mb-5
	text-justify
	
	md:overflow-y-scroll
	md:scrollbar-thin
	md:h-20
	lg-text-2xl
	lg:h-40
`

const ProjectLink = tw.a`
	relative
	w-1/3
	text-center
	text-2xl
	font-bold
	font-heading
	bg-primary-500
	text-accent-500
	mx-auto
	px-3
	py-2

	hover:bg-primary-900
	hover:text-accent-200
`

const MarkdownTitle = tw.span`
    relative
    text-4xl
    font-bold
	font-heading
	underline
    w-full
    my-5

    md:mt-10
`

const ProjectEntryLayout: React.FunctionComponent<ProjectEntryLayoutProps> = ({pageContext: context}) => {
	const [readme, setReadmeContent] = React.useState('')
	const [spinner, setReadmeUi] = React.useState()
	const [isReadmeLoaded, setIfReadmeLoaded] = React.useState(false)

	const handleReadmeLoad = async () => {
		const fetchReadme = async () => {
			setReadmeUi(<StyledSpinner id="readme_spinner" size={"5rem"}/>)
			await fetch(context.frontmatter.readme)
			.then((fetch) => fetch.text())
			.then((text) => {
				return text === '404: Not Found' ? '<strong>Failed loading Readme!</strong> <br/> Check the link in the post frontmatter.' : text
			})
			.then((readme) => {
				setReadmeContent(readme)
			})
		}
		await fetchReadme()
	}

	useEffect(()=>{
		if (context.frontmatter.readme === 'none') document.getElementById('readme_button').outerHTML = ''
		if (readme !== '') {
			setIfReadmeLoaded(true)
		}
	}, [readme])

	const projectsGalleryListQuery = graphql`
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
			query={projectsGalleryListQuery}
			render={(projectsGalleryList: object) => {
				const matchingProjectGallery = projectsGalleryList.allFile.edges.map(
					(edge: object) => {
						if (edge.node.absolutePath.includes(`galleries/${context.frontmatter.gallery}`)){
							return edge.node.publicURL
						} 
					} 
				).filter(Boolean)
				return(
					<PageWrapper extraClass="w-full">
						<ProjectEntryLayoutWrapper>
							<ProjectTitle>{context.frontmatter.title}</ProjectTitle>
							<ProjectPresentationHero>
								{ matchingProjectGallery.length === 3 ? <GalleryWrapper>
										<BigPicture src={matchingProjectGallery[0]}/>
										<SmallerGallery pictures={matchingProjectGallery.slice(1)}/>
									</GalleryWrapper> : <></>
								}
								<ProjectMetadata>
									<p className="my-5 mx-auto text-2xl md:text-3xl lg:text-5xl font-heading font-bold">Project info</p>
									<p className="my-2 underline text-sm md:text-lg font-bold">Quick rundown:</p>
									<Abstract>{context.frontmatter.abstract}</Abstract>
									<p className="mt-1 underline text-sm md:text-lg font-bold">Tech Stack:</p>
									<StackPresentation techs={context.frontmatter.techs}/>
									<ProjectLink href={context.frontmatter.link}>Link</ProjectLink>
								</ProjectMetadata>
							</ProjectPresentationHero>
							<p className="mt-7 underline text-2xl md:text-4xl font-heading tracking-tighter font-bold">The whole story</p>
							<ContentWrapper>
								<StyledMarkdown mdx={true}>{context.content}</StyledMarkdown>
								{isReadmeLoaded ? 
									<>
										<MarkdownTitle>Project Readme.md</MarkdownTitle>
										<StyledMarkdown 
											className="mt-10"
											linkTarget="_blank"
										>
											{readme} 
										</StyledMarkdown>
									</>: 
									spinner ? spinner : <ReadmeButton id="readme_button" onClick={() => {handleReadmeLoad()}}>Load Readme.md</ReadmeButton>
								}
							</ContentWrapper>
						</ProjectEntryLayoutWrapper>
					</PageWrapper>
				)}
			}
		/>
	)
}

export default ProjectEntryLayout