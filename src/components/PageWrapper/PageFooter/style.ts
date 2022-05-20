import tw from 'tailwind-styled-components';

const PageFooterWrapper = tw.footer`
    fixed
    w-screen
    bottom-0
    flex
    align-middle
    justify-between
    px-5
    py-2
    bg-secondary-50

    md:py-4
    md:px-10
`;

const PageFooterCopyright = tw.h3`
    font-heading
    text-sm
    origin-left
    scale-90
    md:scale-100
`;

export {PageFooterWrapper, PageFooterCopyright};
