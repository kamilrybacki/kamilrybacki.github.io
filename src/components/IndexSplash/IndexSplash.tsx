import React from "react";
import tw from "tailwind-styled-components"

import NavbarMenu from "@components/NavbarMenu";
import ProfPic from "@images/prof_pic.svg"

const IndexSplashWrapper = tw.main`
	w-fit
	mx-auto
	
	lg:relative
	lg:flex
	lg:flex-row
	lg:justify-center
	lg:align-middle
	lg:p-0
	lg:-top-10
`

const TitleWithNavbar = tw.header`
	flex
	flex-col
	gap-0
	justify-center
	w-full
	m-auto

	lg:mx-10
`

const Separator = tw.hr`
	p-0
	h-1
	border-0
	bg-primary-100

	lg:h-1
	lg:-ml-1
`

const MainTitle = tw.title`
	flex
	font-heading
	mx-auto
	gap-3
	mt-5

	lg:px-5
`

const MainTitleWord = tw.h1`
	text-5xl
	text-primary-500
	font-bold

	first-letter:text-accent-400
	first-letter:text-6xl

	md:text-6xl
	md:first-letter:text-8xl

	lg:text-8xl
	lg:first-letter:text-9xl
`

const SubTitle = tw.p`
	text-xl
	text-center
	py-4
	mx-auto
	font-body

	md:text-3xl
	md:child:hidden
`

const IndexProfilePicture = tw.img`
	p-0
	rounded-full
	ring-4
	ring-primary-500
	bg-secondary-500
	w-2/3
	m-auto

	md:w-1/2
	lg:w-1/3
`

const IndexSplash = () => {
	return(
		<IndexSplashWrapper id="splash-wrapper">
			<IndexProfilePicture src={ProfPic} alt="My face"/>
			<TitleWithNavbar>
				<MainTitle>
					<MainTitleWord>Kamil</MainTitleWord> 
					<MainTitleWord>Rybacki</MainTitleWord>
				</MainTitle>
				<SubTitle>Pitch the idea.<br/> I will create the experience.</SubTitle>
				<Separator/>
				<NavbarMenu/>
			</TitleWithNavbar>
		</IndexSplashWrapper>
	)
}

export default IndexSplash

