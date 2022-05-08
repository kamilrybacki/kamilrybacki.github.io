import React from 'react';
import tw from 'tailwind-styled-components'

import SocialMediaBar from '../../SocialMediaBar';

type PageFooterProps = {

}

const PageFooterWrapper = tw.footer`
	bg-secondary-500
	fixed
	w-screen
	bottom-0
	flex
	align-middle
	justify-between
	px-5
	py-2
	md:py-4
	md:px-10
`

const PageFooterCopyright = tw.h3`
	font-sans
	origin-left
	scale-75
	md:scale-100
`

const PageFooter: React.FunctionComponent<PageFooterProps> = () => {
	return(
		<PageFooterWrapper>
			<PageFooterCopyright>© Kamil Rybacki {new Date().getFullYear()}</PageFooterCopyright>
			<SocialMediaBar/>
		</PageFooterWrapper>
	)
}

export default PageFooter
