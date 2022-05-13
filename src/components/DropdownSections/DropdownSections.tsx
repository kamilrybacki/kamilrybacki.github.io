import React from 'react';
import tw from "tailwind-styled-components"

type DropdownSectionsProps = {
	children: JSX.Element | JSX.Element[]
	extraClass: string
}

type SectionProps = {
	children: JSX.Element | JSX.Element[]
	title: string 
}

const DropdownSectionsWrapper = tw.div`
	flex
	flex-col
	gap-5
`

const SectionWrapper = tw.section`
	bg-secondary-500
	px-5
`

const SectionTitleWrapper = tw.div`
	flex
	justify-between
	cursor-pointer
	border-b-2
	border-primary-200
	border-dotted
	pb-2

	hover:border-primary-500
`

const SectionTitle = tw.span`
	relative
	text-center
	text-2xl
	font-bold
	font-heading
	mb-5
	ml-1
	my-auto
	select-none
	text-accent-500

	lg:text-5xl
`

const SectionTitleAccent = tw.div`
	opacity-0
	w-5
	h-5
	mt-3
	bg-primary-500
`

const SectionContent = tw.main`
	duration-100
	origin-top
`

const Section: React.FunctionComponent<SectionProps> = ({children, title}) => {
	const [sectionActive, setIfSectionActive] = React.useState(false)

	const titleId = `${title.toLowerCase().split(' ').join('')}_title`
	const accentId = `${title.toLowerCase().split(' ').join('')}_accent`
	const contentId = `${title.toLowerCase().split(' ').join('')}_content`

	const handleSectionState = () => {
		const accentElement = document.getElementById(accentId)
		accentElement?.classList.toggle('duration-500')
		accentElement?.classList.toggle('rotate-90')
		accentElement.style.clipPath = sectionActive ? "" : "polygon(50% 100%, 0 0, 100% 0)"
		setIfSectionActive(!sectionActive)
	}

	const handleMouseHover = () => {
		changeTitleTextShadow()
		changeTitleAccent()
	}

	const changeTitleTextShadow = () => {
		const titleElement = document.getElementById(titleId)
		titleElement?.classList.toggle('drop-shadow-[0.25rem_0.25rem_0_rgb(0,0,0)]')
		titleElement?.classList.toggle('duration-100')
	}

	const changeTitleAccent = () => {
		const accentElement = document.getElementById(accentId)
		accentElement?.classList.toggle('duration-500')
		accentElement?.classList.toggle('rotate-90')
		accentElement?.classList.toggle('opacity-100')
	}

	return(
		<SectionWrapper>
			<SectionTitleWrapper 
				onMouseEnter={handleMouseHover}
				onMouseLeave={handleMouseHover}
				onClick={handleSectionState} 
			>
				<SectionTitle id={titleId}>{title}</SectionTitle>
				<SectionTitleAccent id={accentId}/>
			</SectionTitleWrapper>
			{sectionActive ? <SectionContent id={contentId}>{children}</SectionContent> : ''}
		</SectionWrapper>
	)
}

const DropdownSections: React.FunctionComponent<DropdownSectionsProps> = ({children, extraClass}) => {
	return(
		<DropdownSectionsWrapper className={extraClass}>
			{children}
		</DropdownSectionsWrapper>
	)
}

export { Section }
export default DropdownSections
