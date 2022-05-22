import React from 'react';

// @ts-ignore
import SendIconSVG from '@images/send.svg';

import {ContactFormWrapper, ContactInputLabel,
  ContactFormInput, ContactFormMessage,
  ContactFormSendButton, SendIcon,
} from './style';

type ContactFormProps = {
    endpoint: URL
}

const ContactForm: React.FunctionComponent<ContactFormProps> = ({endpoint}) => {
  return (
    <ContactFormWrapper action={endpoint} method="POST">
      <ContactInputLabel>Name</ContactInputLabel>
      <ContactFormInput
        type="text"
        name="name"
        placeholder="Required"
        required
      />
      <ContactInputLabel>Email</ContactInputLabel>
      <ContactFormInput type="email" name="email" placeholder="Optional"/>
      <ContactInputLabel>Your message</ContactInputLabel>
      <ContactFormMessage
        name="message"
        rows={15}
        placeholder="Required"
        required
      />
      <ContactFormSendButton type="submit">
          Send <SendIcon src={SendIconSVG}/>
      </ContactFormSendButton>
    </ContactFormWrapper>
  );
};

export default ContactForm;
