import  React from "react"

import PageWrapper from "@components/PageWrapper" 
import SocialMediaBar from "@components/SocialMediaBar"
import ContactForm from "@components/ContactForm"

// Contact form id: 

const ContactPage = () => {
  return (
	<PageWrapper footer={false}>
		<ContactForm endpoint="https://formsubmit.co/d2f32602d5a315ecf57a8ddf8c45f3b9"/>
		<SocialMediaBar/>
	</PageWrapper>
  )
}

export default ContactPage
