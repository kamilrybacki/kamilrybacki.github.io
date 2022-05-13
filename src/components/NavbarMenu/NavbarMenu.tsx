import React from "react";
import tw from "tailwind-styled-components"

import MenuLink from "@components/MenuLink"

const NavbarMenuWrapper = tw.nav`

	relative
	flex
	flex-col
	align-middle
	justify-center
	w-full
	gap-0
	p-2
	
	md:p-0
	md:flex-row
`

const NavbarMenu = () => {
	return(
		<NavbarMenuWrapper>
			<MenuLink to="/projects" size="5" pop={true}>Projects</MenuLink>
			<MenuLink to="/contact" size="4">Contact me</MenuLink>
			<MenuLink to="/posts" size="3" bold={false}>Blog</MenuLink>
			<MenuLink to="/about" size="3" bold={false}>About me</MenuLink>
		</NavbarMenuWrapper>
	)
}

export default NavbarMenu

