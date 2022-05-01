import React from 'react';
import tw from 'tailwind-styled-components'

import ProfilePicture from '@components/ProfilePicture'
import NavbarMenu from '@components/NavbarMenu';

type IndexSplash = {

}

const IndexSplashWrapper = tw.main`
	relative
	flex
	justify-center
	align-middle
	mb-36
	p-0
	w-auto
`

const TitleWithNavbar = tw.header`
	flex
	flex-col
	gap-0
	justify-center
`

const Separator = tw.div`
	-ml-1
	p-0
	h-2
	w-full
	bg-primary-500
`

const MainTitle = tw.title`
	font-display
	flex
	mb-0
	py-0
	px-8
	gap-6
`

const MainTitleWord = tw.h1`
	text-8xl
	text-primary-500
	font-bold

	first-letter:text-accent-400
	first-letter:text-9xl
`

const SubTitle = tw.h3`
	text-2xl
	text-center
	my-4
	px-12
`

const IndexSplash: React.FunctionComponent<IndexSplash> = () => {
	return(
		<IndexSplashWrapper>
			<ProfilePicture/>
			<TitleWithNavbar>
				<MainTitle>
					<MainTitleWord>Kamil</MainTitleWord> 
					<MainTitleWord>Rybacki</MainTitleWord>
				</MainTitle>
				<SubTitle>Personal portfolio & tech blogging thingamajig</SubTitle>
				<Separator/>
				<NavbarMenu/>
			</TitleWithNavbar>
		</IndexSplashWrapper>
	)
}

export default IndexSplash

