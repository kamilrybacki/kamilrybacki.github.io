import * as React from "react"

import tw from 'tailwind-styled-components'
import { LoremIpsum } from 'react-lorem-ipsum';

import PageWrapper from "@components/PageWrapper" 
import SubpageTitle from "@components/SubpageTitle"

const ProjectsPage = () => {
  return (
	<PageWrapper>
		<SubpageTitle>My Projects</SubpageTitle>
		<LoremIpsum p={3}/>
	</PageWrapper>
  )
}

export default ProjectsPage
