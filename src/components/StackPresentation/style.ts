import tw from 'tailwind-styled-components';

const StackPresentationWrapper = tw.div`
    relative
    flex
    flex-wrap
    flex-auto
    justify-between
    bg-secondary-50
    p-3
    my-5
    border-2
    rounded-lg
    border-primary-100
    overflow-x-hidden
    overflow-y-scroll
    overscroll-contain
    scrollbar-thin
    mx-auto
    gap-1

    lg:mt-3
    lg:py-6
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

export {StackPresentationWrapper, StackIcon};
