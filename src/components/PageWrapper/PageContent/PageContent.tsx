import React from 'react';
import tw from 'tailwind-styled-components'

type PageContentProps = {
	children: JSX.Element | JSX.Element[]
}

const PageContentWrapper = tw.section`
	relative
	flex
	flex-col
	w-full
	h-fit
	justify-center
	align-middle
	py-5
	px-10
	mx-auto
`

const PageContent: React.FunctionComponent<PageContentProps> = ({children}) => {
	return(
		<PageContentWrapper>
			{children}
		</PageContentWrapper>
	)
}

export default PageContent
