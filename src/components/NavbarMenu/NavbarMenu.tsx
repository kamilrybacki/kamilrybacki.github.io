import React from 'react';
import tw from 'tailwind-styled-components'

import { ProjectsLink, PostsLink, OtherLink } from './Links'

type NavbarMenuProps = {

}

const NavbarMenuWrapper = tw.nav`
	relative
	inline-flex
	justify-center
	gap-0
`

const NavbarMenu: React.FunctionComponent<NavbarMenuProps> = () => {
	return(
		<NavbarMenuWrapper>
			<ProjectsLink to="/projects">Projects</ProjectsLink>
			<PostsLink to="/posts">Posts</PostsLink>
			<OtherLink to="/about">About me</OtherLink>
			<OtherLink to="/contact">Contact</OtherLink>
		</NavbarMenuWrapper>
	)
}

export default NavbarMenu

