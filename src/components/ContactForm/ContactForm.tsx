import React from "react";
import tw from "tailwind-styled-components";

type ContactFormProps = {
	endpoint: URL
}

const ContactFormWrapper = tw.form`
	flex
	flex-col
`

const ContactForm: React.FunctionComponent<ContactFormProps> = ({endpoint}) => {
	return(
		<ContactFormWrapper action={endpoint} method="POST">
			
		</ContactFormWrapper>
	)
}

export default ContactForm