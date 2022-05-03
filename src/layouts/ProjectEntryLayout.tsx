import React from "react";
import tw from 'tailwind-styled-components';

type ProjectEntryLayoutProps = {

}

const ProjectEntryLayoutWrapper = tw.article`
`

const ProjectEntryLayout: React.FunctionComponent<ProjectEntryLayoutProps> = ({children}) => {
	return(
		<>
			{children}
		</>
	)
}

export default ProjectEntryLayout