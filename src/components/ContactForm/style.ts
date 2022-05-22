import tw from 'tailwind-styled-components';

const ContactFormWrapper = tw.form`
    flex
    flex-col
    w-full
    gap-2
    my-5

    sm:w-[30vw]
`;

const ContactInputLabel = tw.span`
    text-sm
    text-primary-400
    underline
    underline-offset-2
    decoration-accent-500
    decoration-dotted
    decoration-2
`;

const ContactFormInput = tw.input`
    border-2
    border-primary-500
    placeholder-primary-200
    py-1
    px-2
    mb-2
`;

const ContactFormMessage = tw.textarea`
    border-2
    border-primary-500
    placeholder-primary-200
    p-2
    overflow-y-scroll
    scrollbar-thin
    resize-none
`;

const ContactFormSendButton = tw.button`
    flex
    flex-row
    justify-center
    align-middle
    items-center
    gap-5
    bg-accent-500
    text-secondary-100
    font-heading
    font-semibold
    tracking-wide
    h-fit
    w-fit
    px-4
    py-2
    uppercase
    mr-0
    mb-5
    mt-2
    ml-auto
    text-2xl

    hover:bg-accent-300
    hover:translate-x-3

    sm:hover:translate-x-5
    sm:text-3xl
`;

const SendIcon = tw.img`
    invert
    h-7
    w-7

    sm:h-10
    sm:w-10
`;

export {ContactFormWrapper, ContactInputLabel,
  ContactFormInput, ContactFormMessage,
  ContactFormSendButton, SendIcon,
};
