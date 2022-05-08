import React from 'react';
import tw from 'tailwind-styled-components'

import MenuLink from '@components/MenuLink'

const NavbarMenuWrapper = tw.nav`
	flex
	flex-col
	align-middle
	justify-center
	relative
	w-full
	py-3
	gap-0
	
	md:flex-row
	md:items-center
	lg:mt-3
`

const NavbarMenu = () => {
	return(
		<NavbarMenuWrapper>
			<MenuLink to="/projects" size="4" pop={true}>Projects</MenuLink>
			<MenuLink to="/contact" size="3">Contact me</MenuLink>
			<MenuLink to="/posts" size="2" bold={false}>Blog</MenuLink>
			<MenuLink to="/about" size="2" bold={false}>About me</MenuLink>
		</NavbarMenuWrapper>
	)
}

export default NavbarMenu

