import tw from 'tailwind-styled-components';

const DropdownSectionsWrapper = tw.div`
    flex
    flex-col
    gap-5
`;

const SectionWrapper = tw.section`
    bg-secondary-50
    px-5
`;

const SectionTitleWrapper = tw.div`
    flex
    justify-between
    cursor-pointer
    border-b-2
    border-primary-200
    border-dotted
    pb-2

    hover:border-primary-500
    hover:child:drop-shadow-[0.125rem_0.125rem_0_rgba(0,0,0)]
`;

const SectionTitle = tw.span`
    relative
    text-center
    text-2xl
    font-bold
    font-heading
    mb-5
    ml-1
    my-auto
    select-none
    text-accent-500

    lg:text-5xl
`;

const SectionContent = tw.main`
    duration-100
    origin-top
    mb-2
`;

export {DropdownSectionsWrapper, SectionWrapper,
  SectionTitleWrapper, SectionTitle, SectionContent};
