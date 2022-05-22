import tw from 'tailwind-styled-components';

// @ts-ignore
import StyledMarkdown from '@components/StyledMarkdown';

const AboutMeWrapper = tw.section`
    relative
    flex
    flex-col
    gap-2
    -ml-5
    h-[100vh]

    md:w-[80vw]
    md:gap-10
    md:mx-auto
    md:grid
    md:grid-cols-2
`;

const AboutMePicWrapper = tw.img`
    rounded-full
    border-2
    drop-shadow-2xl
    h-1/2
    mx-auto

    md:ml-auto
    md:mr-0
    md:border-4
    md:h-3/4
`;

const AboutMeSectionParagraph = tw(StyledMarkdown)`
    font-body
    text-justify

    md:text-xl
`;

export {AboutMeWrapper, AboutMePicWrapper, AboutMeSectionParagraph};
