import React from 'react';

import ProfilePicture from '@components/ProfilePicture'

type PageHeaderProps = {

}

const PageHeader: React.FunctionComponent<PageHeaderProps> = () => {
	return(
		<header>
			<ProfilePicture/>
		</header>
	)
}

export default PageHeader
