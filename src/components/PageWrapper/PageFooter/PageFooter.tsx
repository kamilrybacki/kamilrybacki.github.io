import React from 'react';
import tw from 'tailwind-styled-components'

import SocialMediaBar from './SocialMediaBar';

type PageFooterProps = {

}

const PageFooterWrapper = tw.footer`
	fixed
	inherit-w
	bottom-4
	flex
	align-middle
	justify-between
	py-1
	px-10
`

const PageFooterCopyright = tw.h3`
	font-sans
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
