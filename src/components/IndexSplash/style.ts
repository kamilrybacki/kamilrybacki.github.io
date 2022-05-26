import tw from 'tailwind-styled-components';

const IndexSplashWrapper = tw.main`
    w-fit
    mx-auto
    
    lg:relative
    lg:flex
    lg:flex-row
    lg:justify-center
    lg:align-middle
    lg:p-0
    lg:-top-10
`;

const TitleWithNavbar = tw.header`
    flex
    flex-col
    gap-0
    justify-center
    w-full
    m-auto

    lg:mx-10
`;

const Separator = tw.hr`
    p-0
    h-1
    border-0
    bg-accent-500

    md:mb-5

    lg:h-1
    lg:-ml-1
`;

const MainTitle = tw.h1`
    flex
    font-heading
    mx-auto
    gap-3
    mt-5

    lg:px-5
`;

const MainTitleWord = tw.h2`
    text-5xl
    text-primary-900
    font-bold

    first-letter:text-accent-400
    first-letter:text-6xl

    md:text-6xl
    md:first-letter:text-8xl

    lg:text-8xl
    lg:first-letter:text-9xl
`;

const SubTitle = tw.p`
    text-xl
    text-center
    py-4
    mx-auto
    font-body

    md:my-1
    md:text-3xl
    md:child:hidden
`;

const IndexProfilePicture = tw.img`
    p-0
    rounded-full
    ring-4
    ring-primary-900
    bg-secondary-100
    w-2/3
    m-auto

    md:w-1/2
    lg:w-1/3
`;

export {IndexSplashWrapper, TitleWithNavbar,
  Separator, MainTitle, MainTitleWord, SubTitle, IndexProfilePicture};
