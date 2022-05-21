import tw from 'tailwind-styled-components';

const ProjectMetadata = tw.div`
    flex
    flex-col

    md:relative
    md:w-1/4
`;

const ProjectInfoHeader = tw.p`
    my-5
    mx-auto
    text-2xl
    font-heading
    font-bold
    underline

    md:text-3xl
    lg:text-5xl
`;

const ProjectInfoSubheader = tw.p`
    underline
    text-sm
    font-bold

    md:text-lg
`;

const Abstract = tw.p`
    font-sans
    text-xl
    w-full
    mb-5
    text-justify
    
    md:overflow-y-scroll
    md:scrollbar-thin
    md:h-20
    lg-text-2xl
    lg:h-40
`;

const ProjectLink = tw.a`
    relative
    w-1/3
    text-center
    text-2xl
    font-bold
    font-heading
    bg-primary-900
    text-accent-200
    mx-auto
    px-3
    py-2

    hover:text-secondary-100
`;

const MarkdownTitle = tw.span`
    relative
    text-4xl
    font-bold
    font-heading
    underline
    w-full
    my-5

    md:mt-10
`;

const ProjectEntryLayoutWrapper = tw.article`
    w-full
`;

const ProjectTitle = tw.h1`
    font-heading
    font-bold
    text-primary-900
    text-3xl
    mb-8
    bg-secondary-100
    px-4
    pt-3
    pb-2
    h-fit
    text-center
    underline
    decoration-dotted
    decoration-from-font
    underline-offset-[1rem]

    max-w-full
    md:text-6xl
    md:pt-5
    md:pb-3
    md:top-8
    md:mb-12
    md:text-left
`;

const ProjectPresentationHero = tw.div`
    flex
    flex-col
    w-full
    gap-4
    h-fit

    md:h-1/3
    md:flex-row
    md:justify-center
    md:align-middle
    md:gap-10
    
    lg:h-fit
    lg:gap-20
`;

const GalleryWrapper = tw.section`
    flex
    flex-nowrap
    gap-5
    overflow-x-scroll
    overflow-y-hidden

    md:flex-col
    md:gap-0
    md:overflow-x-hidden
    md:overflow-y-scroll
    md:w-[50vw]

    lg:w-fit
    lg:flex-row
    lg:gap-5
    lg:overflow-hidden
`;

const BigPicture = tw.img`
    bg-secondary-50
    mb-4
    w-screen
    h-fit

    md:w-full
    md:mb-0

    lg:max-w-lg
    lg:relative
    lg:top-10
`;

const SmallerGalleryWrapper = tw.div`
    relative
    flex
    flex-row
    flex-nowrap
    flex-shrink-0
    align-middle
    justify-center
    m-auto
    gap-4
    h-full
    scrollbar-thin

    md:h-fit
    md:mt-14
    md:overflow-x-hidden
    md:overflow-y-scroll
    md:flex-col
`;

const SmallPicture = tw.img`
    w-screen
    lg:w-[25vw]
`;

const ContentTitle = tw.p`
    mt-7
    underline
    text-2xl
    font-heading
    tracking-tighter
    font-bold
    
    md:text-4xl
`;

const ContentWrapper = tw.main`
    flex
    flex-col
    align-middle
    justify-center
    mt-2
    pb-10
    w-full
    bg-secondary-50

    md:mt-4
`;

const ReadmeButton = tw.button`
    mx-auto
    my-5
    p-2
    text-sans
    font-bold
    border-[1px]
    border-primary-500
    border-dashed
    duration-200

    hover:translate-y-1
    hover:border-solid
    hover:bg-accent-50

    active:bg-accent-100
`;

export {ProjectMetadata, ProjectInfoHeader, ProjectInfoSubheader,
  Abstract, ProjectLink, MarkdownTitle, ProjectEntryLayoutWrapper,
  ProjectTitle, ProjectPresentationHero, GalleryWrapper,
  BigPicture, ContentTitle, ContentWrapper, ReadmeButton,
  SmallerGalleryWrapper, SmallPicture};
