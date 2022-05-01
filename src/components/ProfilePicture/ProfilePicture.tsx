import React from 'react';

import tw from 'tailwind-styled-components'

import ProfPic from '@images/prof_pic.svg'

const ProfilePictureSource = tw.img`
	p-0
	m-0
	rounded-full
	ring-8
	ring-primary-500
	bg-secondary-500
`

type PageHeaderProps = {

}

const ProfilePicture: React.FunctionComponent<PageHeaderProps> = () => {
	return(
		<ProfilePictureSource src={ProfPic} alt="My face"/>
	)
}

export default ProfilePicture
