import React from 'react';
import tw from 'tailwind-styled-components'

import MenuLink from '@components/MenuLink'

const NavbarMenuWrapper = tw.nav`
	relative
	md:inline-flex
	align-middle
	justify-center
	mt-3
	gap-2
	w-full
`

const NavbarMenu = () => {
	return(
		<NavbarMenuWrapper>
			<MenuLink to="/projects" size="5xl" pop={true}>Projects</MenuLink>
			<MenuLink to="/contact" size="4xl">Contact me</MenuLink>
			<MenuLink to="/posts" size="2xl" bold={false}>Blog</MenuLink>
			<MenuLink to="/about" size="2xl" bold={false}>About me</MenuLink>
		</NavbarMenuWrapper>
	)
}

export default NavbarMenu

