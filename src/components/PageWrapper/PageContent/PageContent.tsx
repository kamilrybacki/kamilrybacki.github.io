import React from 'react';
import tw from 'tailwind-styled-components'

type PageContentProps = {
	children: JSX.Element | JSX.Element[]
}

const PageContentWrapper = tw.footer`
	relative
	flex
	flex-col
	w-full
	h-full
	justify-center
	align-middle
	p-20
`

const PageContent: React.FunctionComponent<PageContentProps> = ({children}) => {
	return(
		<PageContentWrapper>
			{children}
		</PageContentWrapper>
	)
}

export default PageContent
