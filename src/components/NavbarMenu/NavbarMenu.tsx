import React from 'react';
import tw from 'tailwind-styled-components'

import MenuLink from '@components/MenuLink'

const NavbarMenuWrapper = tw.nav`
	relative
	inline-flex
	justify-center
	mt-3
	gap-2
`

const NavbarMenu = () => {
	return(
		<NavbarMenuWrapper>
			<MenuLink to="/projects" size="5xl" pop={true}>Projects</MenuLink>
			<MenuLink to="/contact" size="3xl">Contact me</MenuLink>
			<MenuLink to="/posts" size="2xl" bold={false}>Blog</MenuLink>
		</NavbarMenuWrapper>
	)
}

export default NavbarMenu

