import React from 'react';
import tw from 'tailwind-styled-components'

import NavbarMenu from '@components/NavbarMenu';
import ProfPic from '@images/prof_pic.svg'

const IndexSplashWrapper = tw.main`
	relative
	w-full
	m-auto
	justify-center
	align-middle
	flex
	flex-col
	top-56
	md:flex-row
	md:p-0
`

const TitleWithNavbar = tw.header`
	flex
	flex-col
	gap-0
	justify-center
	w-fit
	m-auto
`

const Separator = tw.hr`
	-ml-1
	p-0
	h-2
	border-0
	bg-primary-500
`

const MainTitle = tw.title`
	font-display
	flex
	mx-auto
	gap-3
	mt-5
`

const MainTitleWord = tw.h1`
	text-7xl
	md:text-8xl
	text-primary-500
	font-bold

	first-letter:text-accent-400
	first-letter:text-8xl
	md:first-letter:text-9xl
`

const SubTitle = tw.h3`
	text-2xl
	text-center
	py-4
	mx-auto
	md:child:hidden
`

const IndexProfilePicture = tw.img`
	p-0
	rounded-full
	ring-8
	ring-primary-500
	bg-secondary-500
	m-auto
	w-1/2
	md:w-1/3

`

const IndexSplash = () => {
	return(
		<IndexSplashWrapper id='splash-wrapper'>
			<IndexProfilePicture src={ProfPic} alt="My face"/>
			<TitleWithNavbar>
				<MainTitle>
					<MainTitleWord>Kamil</MainTitleWord> 
					<MainTitleWord>Rybacki</MainTitleWord>
				</MainTitle>
				<SubTitle>Personal portfolio &<br/> tech blogging thingamajig</SubTitle>
				<Separator/>
				<NavbarMenu/>
			</TitleWithNavbar>
		</IndexSplashWrapper>
	)
}

export default IndexSplash

