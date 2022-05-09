import React from "react";
import tw from "tailwind-styled-components";

type ContactFormProps = {
	endpoint: URL
}

const ContactFormWrapper = tw.form`
	relative
	flex
	flex-col
	gap-2
	w-1/3
	my-5
`

const ContactInputLabel = tw.span`
	text-sm
	text-primary-400
	underline
	underline-offset-2
	decoration-accent-500
	decoration-dotted
	decoration-2
`

const ContactFormInput = tw.input`
	border-2
	border-primary-500
	placeholder-primary-200
	py-1
	px-2
	mb-2
`

const ContactFormMessage = tw.textarea`
	border-2
	border-primary-500
	placeholder-primary-200
	p-2
	overflow-y-scroll
	scrollbar-thin
`

const ContactFormSendButton = tw.button`
	relative
	bg-accent-500
	w-20
	h-10
	text-secondary-500
	font-display
	tracking-wide
	text-2xl
	uppercase
`

const ContactForm: React.FunctionComponent<ContactFormProps> = ({endpoint}) => {
	return(
		<ContactFormWrapper action={endpoint} method="POST">
			<ContactInputLabel>Name</ContactInputLabel>
			<ContactFormInput type="text" name="name" placeholder="Required" required/>
			<ContactInputLabel>Email</ContactInputLabel>
			<ContactFormInput type="email" name="email" placeholder="Optional"/>
			<ContactInputLabel>Your message</ContactInputLabel>
			<ContactFormMessage name="message" rows={15} placeholder="Required" required/>
			<ContactFormSendButton type="submit">Send</ContactFormSendButton>
		</ContactFormWrapper>
	)
}

export default ContactForm