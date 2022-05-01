import * as React from "react"

import { LoremIpsum } from 'react-lorem-ipsum';

import PageWrapper from "@components/PageWrapper" 
import SubpageTitle from "@components/SubpageTitle"

const PostsPage = () => {
  return (
	<PageWrapper>
		<SubpageTitle>Posts</SubpageTitle>
		<LoremIpsum p={3}/>
	</PageWrapper>
  )
}

export default PostsPage
