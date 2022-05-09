import React from "react";
import tw from "tailwind-styled-components";

import SendIconSVG from '@images/send.svg'

type ContactFormProps = {
	endpoint: URL
}

const ContactFormWrapper = tw.form`
	relative
	flex
	flex-col
	gap-2
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
	resize-none
`

const ContactFormSendButton = tw.button`
	flex
	flex-row
	justify-center
	align-middle
	items-center
	gap-5
	bg-accent-500
	text-secondary-500
	font-display
	font-semibold
	tracking-wide
	text-3xl
	h-fit
	w-fit
	px-4
	py-2
	uppercase
	mr-0
	mb-5
	mt-2
	ml-auto

	hover:bg-accent-300
	hover:translate-x-5
`

const SendIcon = tw.img`
	h-10
	w-10
	invert
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
			<ContactFormSendButton type="submit">Send <SendIcon src={SendIconSVG}/></ContactFormSendButton>
		</ContactFormWrapper>
	)
}

export default ContactForm