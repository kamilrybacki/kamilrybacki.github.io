import * as React from "react"

import { LoremIpsum } from 'react-lorem-ipsum';

import PageWrapper from "@components/PageWrapper" 
import PageContent from "@components/PageContent";

const ContactPage = () => {
  return (
	<PageWrapper>
		<LoremIpsum p={1}/>
	</PageWrapper>
  )
}

export default ContactPage
