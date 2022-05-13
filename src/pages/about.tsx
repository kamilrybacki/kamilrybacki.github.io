import  React from "react"
import tw from "tailwind-styled-components"

import AboutMePic from "@images/aboutme_pic.jpg"
import PageWrapper from "@components/PageWrapper" 
import StyledMarkdown from "@components/StyledMarkdown"
import DropdownSections from "@components/DropdownSections"
import { Section } from "@components/DropdownSections"

const AboutMeWrapper = tw.section`
	relative
	flex
	flex-col
	gap-2
	-ml-5

	md:gap-4
	md:mx-auto
	md:grid
	md:grid-cols-2
	md:w-4/5
`

const AboutMePicWrapper = tw.img`
	rounded-full
	border-4
	drop-shadow-2xl
	w-3/4
	mx-auto
	z-50

	md:ml-auto
	md:h-3/4
`

const AboutMeSectionParagraph = tw(StyledMarkdown)`
	font-body
	text-justify

	md:text-2xl
`

const AboutPage = () => {
	return (
		<PageWrapper>
			<AboutMeWrapper>
				<AboutMePicWrapper src={AboutMePic}/>
				<DropdownSections extraClass="mx-10 md:ml-5 my-10">
					<Section title="Who am I?">
						<AboutMeSectionParagraph>
							**In short**, I am a software developer and organizational journal editor from **Gdańsk**.
						</AboutMeSectionParagraph>
						<AboutMeSectionParagraph>
							I **love** playing around with new technologies and **applying them** in my professional workflow
							and everyday life, which can be seen in **my projects**.
						</AboutMeSectionParagraph>
						<AboutMeSectionParagraph>
							Apart from **softdev**, my interests are **electronics**, **3d printing** and spending time together 
							with other people over **beer** and **horrendously complicated boardgames**.
						</AboutMeSectionParagraph>
					</Section>
					<Section title="What do I do?">
						<AboutMeSectionParagraph>
							**Profesionally**, I aim to provide solutions to problems encountered in **data mining** and **integration of external APIs/databases** with **user interfaces**.
						</AboutMeSectionParagraph>
					</Section>
					<Section title="What do I want?">
						<AboutMeSectionParagraph>
							**When it comes to this site**, I want to simply share my knowledge with others,
							while also having a **cool looking** portfolio to showcase my work.
						</AboutMeSectionParagraph>
						<AboutMeSectionParagraph>
							As for my **carrier path**, I want to specialize more into **DevOps** and **IaC**, while also improving my **data mining** expertise and knowledge about **integrating backend services** with **intuitive user interfaces** (both in terms of graphical UIs and easy-to-use APIs).
						</AboutMeSectionParagraph>
						<AboutMeSectionParagraph>
							Additionally, I am constantly working on my **design** skills to make the aforementioned interfaces **NOT** make my users gouge their eyes out.
							So **in short**, I want to eventually be a **Full-stack developer** with some **UI/UX skills under my belt**.
						</AboutMeSectionParagraph>
					</Section>
				</DropdownSections>
			</AboutMeWrapper>
		</PageWrapper>
	)
}

export default AboutPage
