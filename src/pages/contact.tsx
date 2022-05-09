import React from "react"
import tw from "tailwind-styled-components"

import PageWrapper from "@components/PageWrapper" 
import ContactForm from "@components/ContactForm"

const ContactRoutes = tw.section`
	flex
	justify-center
	gap-10
`

const VerticalSeparator = tw.div`
	relative
	bg-primary-100
	my-auto
	h-4/5
	w-1
`

const ContactRouteTitle = tw.span`
	relative
	text-4xl 
	font-italic 
	text-primary-500 
	font-display 
	underline
	underline-offset-4
	decoration-primary-100
`

const ContactRoute = tw.div`
	relative
	w-2/5
	p-1
`

const ContactPage = () => {
  return (
	<PageWrapper footer={false}>
		<ContactRoutes>
			<ContactRoute>
				<div className="flex justify-end gap-2">
					<ContactRouteTitle>You can also</ContactRouteTitle>
					<ContactRouteTitle className="font-bold text-accent-700 decoration-accent-500 uppercase">catch me here!</ContactRouteTitle>
				</div>
			</ContactRoute>
			<VerticalSeparator/>
			<ContactRoute>
				<div className="flex justify-start gap-2">
					<ContactRouteTitle>My contact </ContactRouteTitle>
					<ContactRouteTitle className="font-bold text-accent-700 decoration-accent-500 uppercase">form</ContactRouteTitle>
				</div>
				<ContactForm endpoint="https://formsubmit.co/d2f32602d5a315ecf57a8ddf8c45f3b9"/>
			</ContactRoute>
		</ContactRoutes>
	</PageWrapper>
  )
}

export default ContactPage
