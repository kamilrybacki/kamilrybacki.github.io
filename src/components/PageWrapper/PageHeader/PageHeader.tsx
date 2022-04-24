import React, { FunctionComponent } from 'react'; // importing FunctionComponent

import { StaticImage } from "gatsby-plugin-image"

import profpic from "../../../images/prof_pic.png"

type PageHeaderProps = {

}

const PageHeader: FunctionComponent<PageHeaderProps> = () => {
	return(
		<header>
			<StaticImage src={profpic} alt="My face"/>
		</header>
	)
}

export default PageHeader
