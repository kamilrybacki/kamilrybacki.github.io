import tw from 'tailwind-styled-components';

const StackPresentationWrapper = tw.div`
    flex
    items-center
    justify-center
    bg-secondary-50
    border-2
    rounded-lg
    border-primary-100
    p-3
    my-5
    mx-auto

    lg:mt-3
    lg:py-6
`;

const StackPresentationContent = tw.div`
    flex
    flex-wrap
    items-center
    justify-start
    overflow-x-hidden
    overflow-y-scroll
    overscroll-contain
    scrollbar-thin
    gap-2
`;

const StackIcon = tw.img`
    my-1
    w-8
    h-8

    md:mx-1
    lg:w-10
    lg:h-10
    lg:mx-3
`;

export {StackPresentationWrapper, StackPresentationContent, StackIcon};
