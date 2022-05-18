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
	bg-secondary-50
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
	hover:child:drop-shadow-[0.125rem_0.125rem_0_rgba(0,0,0)]
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

const SectionContent = tw.main`
	duration-100
	origin-top
`

const Section: React.FunctionComponent<SectionProps> = ({children, title}) => {
	const [sectionActive, setIfSectionActive] = React.useState(false)

	const handleSectionState = () => {
		setIfSectionActive(!sectionActive)
	}

	return(
		<SectionWrapper>
			<SectionTitleWrapper onClick={handleSectionState}>
				<SectionTitle>{title}</SectionTitle>
			</SectionTitleWrapper>
			{sectionActive ? <SectionContent>{children}</SectionContent> : ''}
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
