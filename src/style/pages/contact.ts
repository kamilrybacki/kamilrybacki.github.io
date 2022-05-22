import tw from 'tailwind-styled-components';

const ContactRoutes = tw.section`
    flex
    flex-col
    justify-center
    gap-3

    sm:gap-10
    sm:flex-row
`;

const VerticalSeparator = tw.div`
    relative
    bg-primary-100
    my-auto
    hidden

    sm:h-4/5
    sm:w-1
`;

const HorizontalSeparator = tw.div`
    relative
    bg-primary-300
    mx-auto

    w-full
    h-1

    sm:hidden
`;

const ContactRouteInfoWrapper = tw.div`
    flex
    justify-center
    gap-1
    w-full

    sm:justify-end
    sm:gap-2
`;

const ContactRouteTitle = tw.span`
    relative
    font-italic 
    text-primary-900 
    font-heading 
    underline
    underline-offset-4
    decoration-primary-100

    text-xl
    sm:text-4xl 
`;

const ContactRouteTitleAccent = tw(ContactRouteTitle)`
    font-bold
    text-accent-500
    decoration-accent-500
    uppercase
`;

const ContactRoute = tw.div`
    relative
    w-full
    p-1

    sm:w-fit
`;

const SocialMediaWrapper = tw.div`
    flex
    flex-col
    w-full
    mt-4
    gap-1

    sm:gap-5
    sm:mt-16
`;

const SocialMedia = tw.div`
    flex
    w-fit
    justify-end
    duration-300
    scale-75
    transform-origin-left
    cursor-pointer
    ml-auto

    hover:-translate-x-2
    hover:-translate-y-2
    hover:shadow-[0.25rem_0.25rem_0_rgb(0,0,0)]
    hover:border-[1px]
    hover:border-primary-500

    sm:py-2
    sm:px-4
    sm:scale-100
`;

const SocialMediaLabel = tw.p`
    font-heading
    font-bold
    tracking-wider
    text-primary-900
    my-auto
    mr-5

    text-2xl
    md:text-3xl
`;

const SocialMediaIconStyle = {
  width: '5rem',
  height: '5rem',
};

export {ContactRoutes, VerticalSeparator, HorizontalSeparator,
  ContactRouteInfoWrapper, ContactRouteTitle, ContactRouteTitleAccent, ContactRoute,
  SocialMediaWrapper, SocialMedia, SocialMediaLabel, SocialMediaIconStyle};
